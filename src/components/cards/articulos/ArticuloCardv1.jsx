import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { authService } from '../../../services/authService';
import { favoriteService } from "../../../services/favoriteService.js";
import { perfilService } from '../../../services/perfilService';

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatearPrecio(precio) {
  if (precio == null) return '';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(precio);
}

// Función para obtener iniciales
const getInitials = (nombre) => {
  if (!nombre) return '?';
  const nombres = nombre.split(' ');
  if (nombres.length === 1) return nombres[0].charAt(0).toUpperCase();
  return (nombres[0].charAt(0) + nombres[nombres.length - 1].charAt(0)).toUpperCase();
};

function ArticuloCardv1({ id, vendedor_id, vendedor_nombre, titulo, precio_mxn, foto1_url, categoria, fecha_publicacion, isPage, vendedor_foto }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [fotoPerfil, setFotoPerfil] = useState(null);

    const user = authService.getCurrentUser();
    const isMyArticle = user?.id === vendedor_id;

    useEffect(() => {
        const verificarFavorito = async () => {
            try {
                const favoritoData = await favoriteService.checkFavorite(
                    "articulo",
                    id
                );
                setIsFavorite(favoritoData.isFavorite);
            } catch (error) {
                console.error("Error verificando favorito:", error);
            }
        };

        verificarFavorito();
        cargarFotoPerfil();
    }, [id, vendedor_id]);

    const cargarFotoPerfil = async () => {
        try {
            // Si ya viene la foto desde las props, usarla
            if (vendedor_foto) {
                setFotoPerfil(vendedor_foto);
                return;
            }

            // Si no, obtener del backend usando el ID del vendedor
            if (vendedor_id) {
                const perfilData = await perfilService.getPerfilPublico(vendedor_id);
                if (perfilData.foto_perfil_url) {
                    setFotoPerfil(perfilData.foto_perfil_url);
                }
            }
        } catch (error) {
            console.error('Error cargando foto del vendedor:', error);
        }
    };

    const handleFavorito = async (articuloId) => {
        try {
            if (isFavorite) {
                await favoriteService.deleteFavorite({
                    tipo: "articulo",
                    referencia_id: articuloId
                });
                setIsFavorite(false);
                console.log("Eliminado de favoritos");
            } else {
                await favoriteService.postFavorite({
                    tipo: "articulo",
                    referencia_id: articuloId
                });
                setIsFavorite(true);
                console.log("Agregado a favoritos");
            }
        } catch (error) {
            console.error(error);
            alert("Error al agregar favorito");
        }
    };

    const handleCardClick = () => {
        window.location.href = `/articulo/${id}`;
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
            {isPage && (
                <div className="p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        {/* Foto de perfil del vendedor */}
                        <div className="overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0" 
                            style={{ 
                                width: '35px', 
                                height: '35px', 
                                backgroundColor: '#f3e1c7',
                                borderRadius: '10%',
                                
                            }}>
                            {fotoPerfil ? (
                                <img 
                                    src={fotoPerfil} 
                                    alt={`Foto de ${vendedor_nombre || 'Vendedor'}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <span className="fw-bold color-1" style={{ fontSize: '12px' }}>
                                    {getInitials(vendedor_nombre || 'V')}
                                </span>
                            )}
                        </div>
                        <Link
                            to={`/profile/public/${vendedor_id}`}
                            className="text-decoration-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <small className="fw-bold color-1">
                                {isMyArticle ? "Tú" : vendedor_nombre}
                            </small>
                        </Link>
                    </div>
                    {!isMyArticle && 
                        <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} text-danger fs-5 color-2`} 
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleFavorito(id);
                            }}
                        ></i>
                    }
                </div>
            )}
            
            {/* CONTENEDOR PRINCIPAL SIN LINK - usando onClick */}
            <div 
                onClick={handleCardClick}
                className="text-decoration-none"
                style={{ cursor: 'pointer' }}
            >
                <div className="bg-secondary bg-opacity-10" style={{ 
                    height: '200px',
                    backgroundImage: `url(${foto1_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}>
                </div>
                <div className="card-body">
                    <small className="color-3 fw-bold text-uppercase d-block mb-1">{categoria}</small>
                    <h5 className="fw-bold color-1">{titulo}</h5>
                    <div className="row mt-4 pt-2 border-top">
                        <div className="col-7">
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>FECHA PUBLICACIÓN</small>
                            <span className="fw-bold color-1" style={{ fontSize: '0.9rem' }}>{formatearFecha(fecha_publicacion)}</span>
                        </div>
                        <div className="col-5 text-end">
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>PRECIO</small>
                            <span className="fw-bold color-2" style={{ fontSize: '0.9rem' }}>{formatearPrecio(precio_mxn)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ArticuloCardv1;