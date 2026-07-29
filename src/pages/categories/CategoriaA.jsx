import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Navbarc from '../../components/categories/Category.jsx';
import SubastaCard from '../../components/cards/subastas/SubastaCardv2.jsx';
import ArticuloCard from '../../components/cards/articulos/ArticuloCardv1.jsx';
import { subastaService } from '../../services/subastaService';

// ============================================
// ========== FUNCIONES HELPER ==========
// ============================================

// 🔥 Detectar si es MegaSubasta por el título
const esMegaSubasta = (titulo) => {
    if (!titulo) return false;
    return titulo.startsWith('MegaSubasta:') || 
           titulo.toLowerCase().includes('megasubasta');
};

// 🔥 Extraer cantidad de artículos del título
const extraerCantidadArticulos = (titulo) => {
    if (!titulo) return 0;
    const match = titulo.match(/y (\d+) más/);
    if (match) {
        return parseInt(match[1]) + 1;
    }
    return 0;
};

// 🔥 Obtener la portada de la subasta
const obtenerPortada = (subasta) => {
    if (!subasta) return null;
    
    const propiedades = ['portada', 'img1', 'foto1_url', 'imagen', 'foto1'];
    
    for (const prop of propiedades) {
        const valor = subasta[prop];
        if (valor && typeof valor === 'string' && valor.trim() !== '') {
            return valor;
        }
    }
    
    if (subasta.imagenes && Array.isArray(subasta.imagenes) && subasta.imagenes.length > 0) {
        return subasta.imagenes[0];
    }
    
    return null;
};

// ============================================
// ========== COMPONENTE PRINCIPAL ==========
// ============================================

const CategoriaArtesanias = () => {
    const [filtro, setFiltro] = useState('Todos');
    const [subastas, setSubastas] = useState([]);
    const [articulos, setArticulos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const CATEGORIA_ID = 5; // Artesanías
    const CATEGORIA_NOMBRE = 'Artesanías';

    useEffect(() => {
        cargarDatos();
        // 🔥 Cambiar el título de la página
        document.title = `${CATEGORIA_NOMBRE} | ArtGallery`;
        
        return () => {
            document.title = 'ArtGallery';
        };
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [subastasData, articulosData] = await Promise.all([
                subastaService.getSubastasByCategoria(CATEGORIA_ID),
                subastaService.getArticulosByCategoria(CATEGORIA_ID)
            ]);
            
            setSubastas(subastasData);
            setArticulos(articulosData);
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const mostrarSubastas = filtro === 'Todos' || filtro === 'Subastas';
    const mostrarArticulos = filtro === 'Todos' || filtro === 'Articulos';

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-3">
                {error}
                <button className="btn btn-sm btn-outline-danger ms-3" onClick={cargarDatos}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="container-fluid px-lg-5 py-4 bg-light min-vh-100">
                <Navbarc />

                {/* ===== FILTROS ===== */}
                <div className="d-flex align-items-center mb-4">
                    <Link className="btn btn-link text-decoration-none text-muted p-0 me-4" to="/">
                        <i className="bi bi-arrow-left me-2"></i>Volver al explorador
                    </Link>
                    <div className="p-1 rounded-pill d-flex gap-1 shadow-sm" style={{ backgroundColor: '#f0e6d2' }}>
                        <button 
                            onClick={() => setFiltro('Todos')}
                            className={`btn btn-sm rounded-pill px-4 border-0 ${filtro === 'Todos' ? 'bg-white shadow-sm fw-bold color-1' : 'text-muted'}`}
                        >
                            Todos
                        </button>
                        <button 
                            onClick={() => setFiltro('Articulos')}
                            className={`btn btn-sm rounded-pill px-4 border-0 ${filtro === 'Articulos' ? 'bg-white shadow-sm fw-bold color-1' : 'text-muted'}`}
                        >
                            Artículos
                        </button>
                        <button 
                            onClick={() => setFiltro('Subastas')}
                            className={`btn btn-sm rounded-pill px-4 border-0 ${filtro === 'Subastas' ? 'bg-white shadow-sm fw-bold color-1' : 'text-muted'}`}
                        >
                            Subastas
                        </button>
                    </div>
                </div>

                {/* ===== GRID DE CONTENIDO ===== */}
                <div className="row g-4">
                    {/* ===== SUBASTAS ===== */}
                    {mostrarSubastas && subastas.map((subasta) => {
                        // Detectar si es MegaSubasta
                        const esMega = esMegaSubasta(subasta.titulo);
                        
                        // Obtener portada
                        const portada = obtenerPortada(subasta);
                        
                        // Extraer cantidad de artículos
                        let cantidad = subasta.total_articulos || 0;
                        if (cantidad === 0 && esMega) {
                            cantidad = extraerCantidadArticulos(subasta.titulo);
                        }
                        
                        // Título a mostrar
                        const tituloMostrar = esMega ? 'MegaSubasta' : subasta.titulo;
                        
                        return (
                            <div key={`sub-${subasta.id}`} className="col-md-6 col-lg-4 animate__animated animate__fadeIn">
                                <SubastaCard
                                    id={subasta.id}
                                    vendedor_id={subasta.vendedor_id}
                                    vendedor_nombre={subasta.vendedor_nombre}
                                    titulo={tituloMostrar}
                                    img1={portada || ''}
                                    tiempo={subasta.tiempo}
                                    pujas={subasta.pujas || 0}
                                    pujaMinima={subasta.pujaMinima || subasta.puja_minima || 0}
                                    categoria={subasta.categoria}
                                    estadoPrincipal={subasta.estadoPrincipal || 'ACTIVA'}
                                    precio={subasta.precio || subasta.puja_actual_mxn || subasta.precio_inicial_mxn || 0}
                                    isPage={true}
                                    vendedor_foto={subasta.vendedor_foto}
                                    esMegaSubasta={esMega}
                                    cantidadArticulos={cantidad}
                                    portada={portada || ''}
                                />
                            </div>
                        );
                    })}

                    {/* ===== ARTÍCULOS ===== */}
                    {mostrarArticulos && articulos.map((articulo) => (
                        <div key={`art-${articulo.id}`} className="col-md-6 col-lg-4 animate__animated animate__fadeIn">
                            <ArticuloCard {...articulo} isPage={true} />
                        </div>
                    ))}

                    {/* ===== MENSAJE SIN DATOS ===== */}
                    {mostrarSubastas && subastas.length === 0 && mostrarArticulos && articulos.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <i className="bi bi-folder-x fs-1 text-muted"></i>
                            <h5 className="mt-3 text-muted">No hay contenido en esta categoría</h5>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CategoriaArtesanias;