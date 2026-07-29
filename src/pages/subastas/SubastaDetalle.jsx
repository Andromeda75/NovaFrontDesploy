import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card, Modal } from 'react-bootstrap';
import { perfilService } from '../../services/perfilService';
import { subastaService } from '../../services/subastaService';
import { pujaService } from '../../services/pujaService';
import { authService } from '../../services/authService';
import { favoriteService } from "../../services/favoriteService";
import { ticketsService } from '../../services/ticketsService';
import MensajeModal from '../../components/modals/MensajeModal.jsx';
import { useModal } from '../../components/modals/useModal.jsx';

const formatearCalificacion = (valor) => {
    if (valor === undefined || valor === null || isNaN(valor)) return '0.0';
    return Number(valor).toFixed(1);
};

function formatearPrecio(precio) {
    if (precio == null || isNaN(precio)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(precio);
}

// Función para verificar si es video
const esVideo = (url) => {
    return url && (url.includes('video') || url.includes('.mp4') || url.includes('.webm') || url.includes('blob:'));
};

// ========== FUNCIÓN PARA OBTENER CONFIGURACIÓN DE ESTADO ==========
const getEstadoConfig = (estado, subasta = null) => {
    if (estado === "FINALIZADA") {
        if (subasta?.ganador_id || subasta?.ganador_nombre) {
            return { 
                bg: "#fffffff5", 
                color: "#198754", 
                border: "#198754", 
                icon: "bi-check-circle-fill",
                label: "VENDIDA" 
            };
        } else {
            return { 
                bg: "#fffffff5", 
                color: "#b02a37", 
                border: "#b02a37", 
                icon: "bi-x-circle-fill",
                label: "NO VENDIDA" 
            };
        }
    }

    switch (estado) {
        case "ACTIVA":
            return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-check-circle-fill", label: "ACTIVA" };
        case "PENDIENTE":
            return { bg: "#fffffff5", color: "#6c757d", border: "#6c757d", icon: "bi-clock-history", label: "PENDIENTE" };
        case "EN ESPERA":
            return { bg: "#fffffff5", color: "#6c757d", border: "#6c757d", icon: "bi-clock-history", label: "EN ESPERA" };
        case "RECHAZADA":
            return { bg: "#fffffff5", color: "#b02a37", border: "#b02a37", icon: "bi-x-circle-fill", label: "RECHAZADA" };
        default:
            return { bg: "#fffffff5", color: "#495057", border: "#495057", icon: "bi-question-circle", label: estado };
    }
};

const SubastaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { modal, showModalMessage, hideModal } = useModal();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [subasta, setSubasta] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [montoPuja, setMontoPuja] = useState('');
    const [pujando, setPujando] = useState(false);
    
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const timerRef = useRef(null);

    // 👇 NUEVO: Estados para pago con Stripe
    const [procesandoPago, setProcesandoPago] = useState(false);
    const [esGanador, setEsGanador] = useState(false);
    const [pagoRealizado, setPagoRealizado] = useState(false);
    const [showPagoModal, setShowPagoModal] = useState(false);

    const [portadaActiva, setPortadaActiva] = useState('');
    const [indiceImagenActual, setIndiceImagenActual] = useState(0);
    const [showModalImagen, setShowModalImagen] = useState(false);
    const [imagenModal, setImagenModal] = useState('');

    const [isFavorite, setIsFavorite] = useState(false);

    // 👇 ESTADOS PARA MODALES PERSONALIZADOS
    const [showTicketsModal, setShowTicketsModal] = useState(false);
    const [showMontoInvalidoModal, setShowMontoInvalidoModal] = useState(false);

    // 👇 ESTADOS PARA EL MODAL DE ARTÍCULOS DE MEGASUBASTA
    const [showArticuloModal, setShowArticuloModal] = useState(false);
    const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
    const [indiceArticuloModal, setIndiceArticuloModal] = useState(0);
    const [indiceImagenArticulo, setIndiceImagenArticulo] = useState(0);
    const [mostrandoVideoArticulo, setMostrandoVideoArticulo] = useState(false);

    const verificarGanador = async () => {
        try {
            const response = await subastaService.getGanador(id);
            setEsGanador(response.esGanador);
            setPagoRealizado(response.pago_realizado);
        } catch (err) {
            console.error('Error verificando ganador:', err);
        }
    };

    // 👇 NUEVA FUNCIÓN: Iniciar pago con Stripe
    const handlePagarConStripe = async () => {
        setProcesandoPago(true);
        
        try {
            // Crear sesión de pago en Stripe para la subasta
            const response = await ticketsService.crearSesionPagoSubasta(id, subasta.puja_actual_mxn);
            
            // Redirigir a Stripe
            if (response.url) {
                window.location.href = response.url;
            } else {
                showModalMessage('Error', 'No se pudo iniciar el proceso de pago', 'error');
                setProcesandoPago(false);
            }
        } catch (error) {
            console.error('Error al crear sesión de pago:', error);
            showModalMessage('Error', error.response?.data?.message || 'Error al procesar el pago', 'error');
            setProcesandoPago(false);
        }
    };

    useEffect(() => {
        cargarDatos();
        verificarGanador();
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [id]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const subastaData = await subastaService.getSubastaById(id);

            const media = [];
        
            if (subastaData.foto1_url) media.push(subastaData.foto1_url);
            if (subastaData.foto2_url) media.push(subastaData.foto2_url);
            if (subastaData.foto3_url) media.push(subastaData.foto3_url);
            if (subastaData.video_url) media.push(subastaData.video_url);
        
            subastaData.media = media;
  
            if (!subastaData.estadoPrincipal) {
                if (subastaData.estado_nombre === 'Activa') {
                    subastaData.estadoPrincipal = 'ACTIVA';
                } else if (subastaData.estado_nombre === 'Finalizada') {
                    subastaData.estadoPrincipal = 'FINALIZADA';
                } else {
                    subastaData.estadoPrincipal = 'EN ESPERA';
                }
            }
            
            console.log('Subasta cargada:', subastaData);
            setSubasta(subastaData);
            setPortadaActiva(subastaData.media[0] || '');
            setIndiceImagenActual(0);
            setIndiceArticuloModal(0);
            setIndiceImagenArticulo(0);
            setMostrandoVideoArticulo(false);

            if (subastaData?.vendedor_id) {
                const perfilData = await perfilService.getPerfilPublico(subastaData.vendedor_id);
                setPerfil(perfilData);
                if (perfilData.foto_perfil_url) {
                    setFotoPerfil(perfilData.foto_perfil_url);
                }
            }

            const favoritoData = await favoriteService.checkFavorite(
                "subasta",
                id
            );

            setIsFavorite(favoritoData.isFavorite);

        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleFavorito = async (subastaId) => {
        try {
            if (isFavorite) {
                await favoriteService.deleteFavorite({
                    tipo: "subasta",
                    referencia_id: subastaId
                });
                setIsFavorite(false);
                showModalMessage('Favoritos', 'Eliminado de favoritos', 'success');
                console.log("Eliminado de favoritos");
            } else {
                await favoriteService.postFavorite({
                    tipo: "subasta",
                    referencia_id: subastaId
                });
                setIsFavorite(true);
                showModalMessage('Favoritos', 'Agregado a favoritos', 'success');
                console.log("Agregado a favoritos");
            }
        } catch (error) {
            console.error(error);
            showModalMessage('Error', 'Error al agregar favorito', 'error');
        }
    };

    const cambiarImagen = (imgSeleccionada, index) => {
        if (!subasta?.media) return;
        const nuevasMedia = [...subasta.media];
        nuevasMedia[index] = portadaActiva;
        setSubasta({
            ...subasta,
            media: nuevasMedia
        });
        setPortadaActiva(imgSeleccionada);
        setIndiceImagenActual(index);
    };

    const imagenAnterior = () => {
        if (!subasta?.media || subasta.media.length === 0) return;
        const nuevoIndice = indiceImagenActual > 0 ? indiceImagenActual - 1 : subasta.media.length - 1;
        setIndiceImagenActual(nuevoIndice);
        setPortadaActiva(subasta.media[nuevoIndice]);
    };

    const imagenSiguiente = () => {
        if (!subasta?.media || subasta.media.length === 0) return;
        const nuevoIndice = indiceImagenActual < subasta.media.length - 1 ? indiceImagenActual + 1 : 0;
        setIndiceImagenActual(nuevoIndice);
        setPortadaActiva(subasta.media[nuevoIndice]);
    };

    const abrirModalImagen = (img) => {
        setImagenModal(img);
        setShowModalImagen(true);
    };

    // ========== FUNCIONES PARA EL MODAL DE ARTÍCULOS DE MEGASUBASTA ==========
    const anteriorArticuloModal = () => {
        if (!subasta?.articulos || subasta.articulos.length === 0) return;
        const total = subasta.articulos.length;
        const nuevoIndice = indiceArticuloModal > 0 ? indiceArticuloModal - 1 : total - 1;
        setIndiceArticuloModal(nuevoIndice);
        setArticuloSeleccionado(subasta.articulos[nuevoIndice]);
        setIndiceImagenArticulo(0);
        setMostrandoVideoArticulo(false);
    };

    const siguienteArticuloModal = () => {
        if (!subasta?.articulos || subasta.articulos.length === 0) return;
        const total = subasta.articulos.length;
        const nuevoIndice = indiceArticuloModal < total - 1 ? indiceArticuloModal + 1 : 0;
        setIndiceArticuloModal(nuevoIndice);
        setArticuloSeleccionado(subasta.articulos[nuevoIndice]);
        setIndiceImagenArticulo(0);
        setMostrandoVideoArticulo(false);
    };

    const abrirModalArticulo = (articulo, index) => {
        setArticuloSeleccionado(articulo);
        setIndiceArticuloModal(index);
        setIndiceImagenArticulo(0);
        setMostrandoVideoArticulo(false);
        setShowArticuloModal(true);
    };

    // ========== RENDER DE ARTÍCULOS DE MEGASUBASTA ==========
    const renderArticulosMegaSubasta = () => {
        if (!subasta?.esMegaSubasta || !subasta?.articulos || subasta.articulos.length === 0) return null;

        return (
            <div className="d-flex flex-column gap-3">
                {subasta.articulos.map((articulo, index) => {
                    const imagenes = [
                        articulo.foto1_url,
                        articulo.foto2_url,
                        articulo.foto3_url
                    ].filter(Boolean);
                    const imagenPrincipal = imagenes[0] || null;
                    const tieneVideo = articulo.video_url ? true : false;
                    
                    const isSelected = indiceArticuloModal === index;

                    return (
                        <div 
                            key={index} 
                            className="card border-0 shadow-sm rounded-4 overflow-hidden cursor-pointer"
                            style={{ 
                                cursor: 'pointer', 
                                transition: 'transform 0.2s',
                                backgroundColor: '#fff',
                                border: isSelected ? '2px solid #b0b0b0' : '2px solid transparent',
                                boxShadow: isSelected 
                                    ? '0 8px 30px rgba(0,0,0,0.15)' 
                                    : '0 2px 10px rgba(0,0,0,0.05)',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                position: 'relative'
                            }}
                            onClick={() => abrirModalArticulo(articulo, index)}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.borderColor = '#d4d4d4';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }
                            }}
                        >
                            <div className="d-flex flex-row">
                                <div 
                                    className="flex-shrink-0 position-relative"
                                    style={{ 
                                        width: '120px',
                                        height: '120px',
                                        backgroundColor: '#f5f5f5',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {imagenPrincipal ? (
                                        <img 
                                            src={imagenPrincipal} 
                                            alt={articulo.titulo}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                            <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                                        </div>
                                    )}
                                    
                                    {isSelected && (
                                        <div 
                                            className="position-absolute top-0 start-0 w-100 h-100"
                                            style={{
                                                background: 'rgba(0,0,0,0.05)'
                                            }}
                                        />
                                    )}
                                </div>

                                <div 
                                    className="position-absolute bottom-0 end-0 m-2 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: '#b0b0b0',
                                        borderRadius: '50%',
                                        zIndex: 5,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'none'
                                    }}
                                >
                                    <i 
                                        className="bi bi-chevron-right" 
                                        style={{ 
                                            fontSize: '16px',
                                            color: 'white',
                                        }}
                                    ></i>
                                </div>

                                <div className="card-body p-3 d-flex flex-column justify-content-between flex-grow-1" style={{ minWidth: 0 }}>
                                    <div>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                <h6 className="fw-bold color-1 mb-1" style={{ 
                                                    fontSize: '14px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {articulo.titulo || 'Sin título'}
                                                </h6>
                                            </div>
                                            <div className="d-flex gap-1 flex-shrink-0">
                                                {imagenes.length > 1 && (
                                                    <span className="badge bg-light text-muted small">
                                                        <i className="bi bi-images me-1"></i> {imagenes.length}
                                                    </span>
                                                )}
                                                {tieneVideo && (
                                                    <span className="badge bg-light text-muted small">
                                                        <i className="bi bi-play-circle me-1"></i>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="small text-muted mb-0" style={{ 
                                            fontSize: '12px', 
                                            lineHeight: '1.4',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            maxHeight: '2.8em'
                                        }}>
                                            {articulo.descripcion || 'Sin descripción'}
                                        </p>
                                    </div>
                                    <div className="mt-2">
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // ========== RENDER DE ARTÍCULOS EN MODAL DE MEGASUBASTA ==========
    const renderModalArticulosMegaSubasta = () => {
        if (!articuloSeleccionado) return null;

        const imagenesArticuloModal = [
            articuloSeleccionado.foto1_url,
            articuloSeleccionado.foto2_url,
            articuloSeleccionado.foto3_url
        ].filter(Boolean);

        const totalImagenes = imagenesArticuloModal.length;
        const totalArticulos = subastaDetalle?.articulos?.length || 0;
        const esVideo = indiceImagenArticulo === 3 && articuloSeleccionado.video_url;

        const imagenAnteriorArticulo = () => {
            if (totalImagenes === 0 && !articuloSeleccionado.video_url) return;
            const totalItems = totalImagenes + (articuloSeleccionado.video_url ? 1 : 0);
            const nuevoIndice = indiceImagenArticulo > 0 ? indiceImagenArticulo - 1 : totalItems - 1;
            setIndiceImagenArticulo(nuevoIndice);
        };

        const imagenSiguienteArticulo = () => {
            if (totalImagenes === 0 && !articuloSeleccionado.video_url) return;
            const totalItems = totalImagenes + (articuloSeleccionado.video_url ? 1 : 0);
            const nuevoIndice = indiceImagenArticulo < totalItems - 1 ? indiceImagenArticulo + 1 : 0;
            setIndiceImagenArticulo(nuevoIndice);
        };

        const seleccionarImagenArticulo = (index) => {
            setIndiceImagenArticulo(index);
        };

        return (
            <div className="position-relative" style={{ backgroundColor: '#ffffff' }}>
                <button
                    className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow d-flex align-items-center justify-content-center"
                    style={{ width: '36px', height: '36px', zIndex: 10, border: 'none' }}
                    onClick={() => {
                        setShowArticuloModal(false);
                        setArticuloSeleccionado(null);
                        setIndiceArticuloModal(0);
                        setIndiceImagenArticulo(0);
                    }}
                >
                    <i className="bi bi-x-lg" style={{ fontSize: '14px' }}></i>
                </button>
                <div className="p-4 p-lg-5">
                    <div className="row g-4">
                        <div className="col-lg-7">
                            <div className="position-relative">
                                <div 
                                    className="bg-light rounded-4 d-flex align-items-center justify-content-center overflow-hidden"
                                    style={{ 
                                        height: '400px',
                                        backgroundColor: '#f8f9fa'
                                    }}
                                >
                                    {esVideo ? (
                                        <video
                                            src={articuloSeleccionado.video_url}
                                            controls
                                            autoPlay
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : totalImagenes > 0 && indiceImagenArticulo < totalImagenes ? (
                                        <img 
                                            src={imagenesArticuloModal[indiceImagenArticulo]} 
                                            alt={articuloSeleccionado.titulo}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        <div className="text-muted text-center">
                                            <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                                            <p className="mt-2 small">Sin imágenes</p>
                                        </div>
                                    )}
                                </div>

                                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-dark bg-opacity-50 text-white rounded-pill px-3 py-1 small">
                                    {esVideo ? ' 4/4' : `${indiceImagenArticulo + 1} / ${totalImagenes + (articuloSeleccionado.video_url ? 1 : 0)}`}
                                </div>

                                {(totalImagenes > 1 || articuloSeleccionado.video_url) && (
                                    <>
                                        <button
                                            className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 shadow-sm d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px', zIndex: 10, border: 'none' }}
                                            onClick={imagenAnteriorArticulo}
                                        >
                                            <i className="bi bi-chevron-left" style={{ fontSize: '12px' }}></i>
                                        </button>
                                        <button
                                            className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 shadow-sm d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px', zIndex: 10, border: 'none' }}
                                            onClick={imagenSiguienteArticulo}
                                        >
                                            <i className="bi bi-chevron-right" style={{ fontSize: '12px' }}></i>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="d-flex gap-2 mt-2 overflow-auto pb-1" style={{ flexWrap: 'nowrap' }}>
                                {imagenesArticuloModal.map((img, idx) => (
                                    <div
                                        key={`img-${idx}`}
                                        className={`rounded-3 overflow-hidden flex-shrink-0 cursor-pointer ${
                                            indiceImagenArticulo === idx && !esVideo ? 'border border-2 border-warning' : 'border border-2 border-transparent'
                                        }`}
                                        style={{ 
                                            width: '70px', 
                                            height: '60px', 
                                            backgroundColor: '#f5f5f5', 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => seleccionarImagenArticulo(idx)}
                                    >
                                        <img
                                            src={img}
                                            alt={`Imagen ${idx + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}

                                {articuloSeleccionado.video_url && (
                                    <div
                                        className={`rounded-3 overflow-hidden flex-shrink-0 cursor-pointer d-flex flex-column align-items-center justify-content-center ${
                                            esVideo ? 'border border-2 border-warning' : 'border border-2 border-transparent'
                                        }`}
                                        style={{ 
                                            width: '70px', 
                                            height: '60px', 
                                            backgroundColor: '#f5f5f5', 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => setIndiceImagenArticulo(3)}
                                    >
                                        <i className="bi bi-play-circle-fill fs-2 text-secondary"></i>
                                        <small className="text-muted" style={{ fontSize: '7px' }}>Video</small>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                    Artículo {indiceArticuloModal + 1} de {totalArticulos}
                                </span>
                            </div>

                            <h5 className="fw-bold color-1 mb-2" style={{ fontSize: '25px' }}>
                                {articuloSeleccionado.titulo || 'Sin título'}
                            </h5>
                            
                            <div className="mb-3">
                                <h6 style={{ fontSize: '14px', color: '#9A5F25' }}>
                                    {articuloSeleccionado.categoria || 'Sin categoría'}
                                </h6>
                            </div>

                            <div className="mb-3">
                                <h6 className="fw-bold color-1 mb-1" style={{ fontSize: '15px' }}>
                                    Descripción
                                </h6>
                                <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                                    {articuloSeleccionado.descripcion || 'Sin descripción'}
                                </p>
                            </div>

                            <div className="bg-light p-3 rounded-4 mt-3">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <small className="text-muted d-block small fw-bold">TIEMPO RESTANTE</small>
                                        <h6 className="text-muted fw-normal m-0">
                                            {subasta?.tiempo || 'No disponible'}
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleRealizarPuja = async () => {
        const monto = parseFloat(montoPuja);
        
        if (isNaN(monto) || monto <= 0) {
            setShowMontoInvalidoModal(true);
            return;
        }

        const pujaActualNum = parseFloat(subasta.puja_actual_mxn) || parseFloat(subasta.precio_inicial_mxn) || 0;
        const pujaMinimaNum = parseFloat(subasta.puja_minima_mxn) || 0;
        const montoMinimo = pujaActualNum + pujaMinimaNum;
        
        if (monto < montoMinimo) {
            showModalMessage('Atención', `La puja mínima es de ${formatearPrecio(montoMinimo)}`, 'warning');
            return;
        }

        setPujando(true);
        
        try {
            await pujaService.realizarPuja(id, monto);
            await cargarDatos();
            
            setSuccessMessage(`¡Puja realizada con éxito! Tu oferta de ${formatearPrecio(monto)} ha sido registrada.`);
            setShowSuccessModal(true);
            setMontoPuja('');
            
            timerRef.current = setTimeout(() => {
                setShowSuccessModal(false);
                cargarDatos();
            }, 4000);
            
        } catch (err) {
            console.error('Error al realizar puja:', err);
            if (err.response?.data?.message?.includes('Tickets insuficientes')) {
                setShowTicketsModal(true);
            } else {
                showModalMessage('Error', err.response?.data?.message || 'Error al realizar la puja', 'error');
            }
        } finally {
            setPujando(false);
        }
    };

    const handleCerrarModal = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setShowSuccessModal(false);
        cargarDatos();
    };

    // ====== BADGE DEL GANADOR O NO VENDIDA ======
    const renderGanadorBadge = () => {
        if (subasta.estadoPrincipal !== 'FINALIZADA') return null;
        
        if (subasta.ganador_nombre) {
            return (
                <div className="alert alert-success p-2 mb-3 d-flex align-items-center gap-2" style={{ borderRadius: '12px', fontSize: '14px' }}>
                    <i className="bi bi-trophy-fill fs-5"></i>
                    <span>
                        <strong>¡Subasta vendida!</strong> Ganador: <strong>{subasta.ganador_nombre}</strong>
                        <br />
                        <small>Monto final: <strong>{formatearPrecio(subasta.puja_actual_mxn)}</strong></small>
                    </span>
                </div>
            );
        } else {
            return (
                <div className="alert alert-danger p-2 mb-3 d-flex align-items-center gap-2" style={{ borderRadius: '12px', fontSize: '14px' }}>
                    <i className="bi bi-x-circle fs-5"></i>
                    <span>
                        <strong>Subasta finalizada</strong> - No se vendió
                        <br />
                        <small>No hubo pujas registradas</small>
                    </span>
                </div>
            );
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error || !subasta) {
        return (
            <div className="alert alert-danger m-3">
                {error || 'Subasta no encontrada'}
                <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => navigate(-1)}>
                    Volver
                </button>
            </div>
        );
    }

    const user = authService.getCurrentUser();
    const esMiSubasta = user?.id === subasta.vendedor_id;
    const pujaActualNum = parseFloat(subasta.puja_actual_mxn) || parseFloat(subasta.precio_inicial_mxn) || 0;
    const pujaMinimaNum = parseFloat(subasta.puja_minima_mxn) || 0;
    const montoMinimoPuja = pujaActualNum + pujaMinimaNum;
    const esActiva = subasta.estadoPrincipal === 'ACTIVA';
    const estadoConfig = getEstadoConfig(subasta.estadoPrincipal, subasta);

    return (
        <div className="bg-color-white d-flex flex-column">
            <Container fluid="xxl" className="my-4 flex-grow-1 px-lg-5">
                <Button 
                    variant="link" 
                    className="text-decoration-none color-2 p-0 mb-3 fw-bold" 
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left me-2"></i> Volver
                </Button>

                <Row className="g-4">
                    <Col lg={7}>
                        {subasta.esMegaSubasta ? (
                            renderArticulosMegaSubasta()
                        ) : (
                            <>
                                <div className="position-relative">
                                    <div 
                                        className="bg-color-5 rounded-4 mb-3 d-flex align-items-center justify-content-center shadow-sm" 
                                        style={{ 
                                            minHeight: '550px',
                                            maxHeight: '600px',
                                            backgroundColor: '#f5f5f5',
                                            overflow: 'hidden',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => portadaActiva && abrirModalImagen(portadaActiva)}
                                    >
                                        {portadaActiva ? (
                                            esVideo(portadaActiva) ? (
                                                <video
                                                    key={portadaActiva}
                                                    src={portadaActiva}
                                                    controls
                                                    autoPlay
                                                    playsInline
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <img 
                                                    src={portadaActiva} 
                                                    alt="Imagen de la subasta"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            )
                                        ) : (
                                            <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                                        )}
                                    </div>
                                    
                                    <div className="position-absolute top-0 start-0 m-3">
                                        <span className="px-2 py-1 fw-bold d-flex align-items-center gap-1"
                                            style={{
                                                backgroundColor: estadoConfig.bg,
                                                color: estadoConfig.color,
                                                border: `1px solid ${estadoConfig.border}`,
                                                borderRadius: "20px",
                                                fontSize: "9px",
                                                background: "rgba(255, 255, 255, 0.9)"
                                            }}
                                        >
                                            <i className={`bi ${estadoConfig.icon}`} style={{ fontSize: '8px' }}></i>
                                            <span>{estadoConfig.label}</span>
                                        </span>
                                    </div>
                                    
                                    {subasta.media?.length > 1 && (
                                        <>
                                            <button
                                                className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 shadow d-flex align-items-center justify-content-center"
                                                style={{ width: '40px', height: '40px', zIndex: 10 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    imagenAnterior();
                                                }}
                                            >
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                            <button
                                                className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 shadow d-flex align-items-center justify-content-center"
                                                style={{ width: '40px', height: '40px', zIndex: 10 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    imagenSiguiente();
                                                }}
                                            >
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-dark bg-opacity-50 text-white rounded-pill px-3 py-1 small">
                                                {indiceImagenActual + 1} / {subasta.media.length}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <Row className="g-2">
                                    {subasta.media?.map((img, index) => (
                                        <Col xs={4} key={index}>
                                            <div 
                                                className={`bg-color-5 rounded-3 shadow-sm cursor-pointer overflow-hidden ${
                                                    portadaActiva === img ? 'border border-2 border-warning' : 'border border-2 border-transparent'
                                                }`}
                                                onClick={() => cambiarImagen(img, index)}
                                                style={{ 
                                                    height: '140px',
                                                    backgroundColor: '#f5f5f5',
                                                    position: 'relative'
                                                }}
                                            >
                                                {esVideo(img) ? (
                                                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                                        <i className="bi bi-play-circle-fill color-2" style={{ fontSize: '2rem' }}></i>
                                                        <small className="text-muted mt-1" style={{ fontSize: '0.6rem' }}>Video</small>
                                                    </div>
                                                ) : (
                                                    <img 
                                                        src={img} 
                                                        alt={`Miniatura ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                )}
                                                {portadaActiva === img && (
                                                    <div className="position-absolute top-0 end-0 m-1" style={{ zIndex: 5 }}>
                                                        <i className="bi bi-check-circle-fill text-warning" style={{ fontSize: '1.5rem' }}></i>
                                                    </div>
                                                )}
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        )}
                    </Col>

                    <Col lg={5}>
                        <Card className="shadow-sm rounded-5 p-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="d-flex justify-content-center align-items-center shadow-sm me-3 overflow-hidden" 
                                    style={{ 
                                        width: "55px", 
                                        height: "55px", 
                                        backgroundColor: "#f3e1c7", 
                                        borderRadius: "10%",
                                    }}>
                                    {fotoPerfil ? (
                                        <img 
                                            src={fotoPerfil} 
                                            alt={`Foto de ${subasta.vendedor_nombre || 'Vendedor'}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <i className="bi bi-person color-1 fs-3"></i>
                                    )}
                                </div>
                                <div>
                                    <Link
                                        to={`/profile/public/${subasta.vendedor_id}`}
                                        className="text-decoration-none"
                                    >
                                        <h5 className="mb-1 color-1 fw-bold">
                                            {esMiSubasta ? "Tú" : subasta.vendedor_nombre}
                                        </h5>
                                    </Link>
                                    <div className="d-inline-flex align-items-center gap-2">
                                        <div className="d-flex justify-content-center align-items-center rounded-circle" 
                                            style={{ width: "25px", height: "25px", backgroundColor: "#FFD700" }}>
                                            <i className="bi bi-star-fill text-white"></i>
                                        </div>
                                        <small className="fw-bold color-2">
                                            {formatearCalificacion(perfil?.calificacion_promedio || subasta.vendedor_calificacion || 0)} / 5.0
                                        </small>
                                    </div>
                                </div>
                                {!esMiSubasta &&
                                    <div className='pe-2 ms-auto'>
                                        <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} color-1 fw-bold`} 
                                            style={{ fontSize: '30px', cursor: 'pointer' }}
                                            onClick={() => handleFavorito(id)}
                                        ></i>
                                    </div>
                                }
                            </div>

                            {subasta.esMegaSubasta && (
                                <>
                                    <h2 className="fw-bold color-1 mb-1" style={{ fontSize: '28px' }}>
                                        MegaSubasta
                                    </h2>
                                    <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
                                        {subasta.articulos?.length || 0} {subasta.articulos?.length === 1 ? 'artículo' : 'artículos'}
                                    </p>
                                </>
                            )}

                            {!subasta.esMegaSubasta && (
                                <>
                                    <span className="color-3 fw-bold small text-uppercase mb-1">{subasta.categoria}</span>
                                    <h1 className="display-6 color-1 fw-bold mb-3">{subasta.titulo}</h1>
                                </>
                            )}

                            {renderGanadorBadge()}

                            <div className="bg-light p-3 rounded-4 my-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <small className="text-muted d-block small fw-bold">PUJA ACTUAL</small>
                                        <h4 className="color-1 fw-bold m-0">{formatearPrecio(pujaActualNum)}</h4>
                                    </div>
                                    <div className="text-end">
                                        <small className="text-muted d-block small fw-bold">CIERRA EN</small>
                                        <h4 className="text-muted fw-normal m-0">{subasta.tiempo || 'Finalizada'}</h4>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                    <small className="text-muted">PUJA MÍNIMA: {formatearPrecio(pujaMinimaNum)}</small>
                                    <small className="text-muted">
                                        <i className="bi bi-ticket-perforated me-1"></i> Costo: 5 Tickets
                                    </small>
                                </div>
                            </div>

                            {!esMiSubasta && esActiva && (
                                <div className="mb-4">
                                    <label className="fw-bold mb-2">Tu puja (MXN)</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="number"
                                            className="form-control form-control-lg"
                                            placeholder={formatearPrecio(montoMinimoPuja)}
                                            value={montoPuja}
                                            onChange={(e) => setMontoPuja(e.target.value)}
                                            min={montoMinimoPuja}
                                            step={pujaMinimaNum}
                                        />
                                        <Button 
                                            className="btn-2 px-4"
                                            onClick={handleRealizarPuja}
                                            disabled={pujando}
                                        >
                                            {pujando ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Pujando...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-arrow-up-right me-2"></i> PUJAR
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <small className="text-muted mt-2 d-block">
                                        Mínimo: {formatearPrecio(montoMinimoPuja)}
                                    </small>
                                </div>
                            )}

                            {!esActiva && (
                                <div className="alert alert-secondary text-center">
                                    <i className="bi bi-clock-history me-2"></i>
                                    Esta subasta ya {subasta.estadoPrincipal === 'FINALIZADA' ? 'finalizó' : 'no está activa'}
                                </div>
                            )}

                            {esMiSubasta && esActiva && (
                                <div className="alert alert-info text-center">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Eres el vendedor de esta subasta. No puedes pujar en tu propia obra.
                                </div>
                            )}

                            {/* 👇 NUEVO: Botón de pago con Stripe para el ganador */}
                            {esGanador && !pagoRealizado && subasta.estadoPrincipal === 'FINALIZADA' && (
                                <div className="mt-4">
                                    <Button 
                                        className="btn-success w-100 py-2 fw-bold"
                                        onClick={handlePagarConStripe}
                                        disabled={procesandoPago}
                                    >
                                        {procesandoPago ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-credit-card me-2"></i>
                                                PAGAR CON STRIPE
                                            </>
                                        )}
                                    </Button>
                                    <small className="text-muted d-block mt-2 text-center">
                                        <i className="bi bi-lock me-1"></i>
                                        Pago seguro a través de Stripe
                                    </small>
                                </div>
                            )}

                            {/* ✅ Ya pagado */}
                            {esGanador && pagoRealizado && subasta.estadoPrincipal === 'FINALIZADA' && (
                                <div className="alert alert-success text-center">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    ¡Pago completado! El vendedor se pondrá en contacto contigo.
                                </div>
                            )}

                            {!subasta.esMegaSubasta && (
                                <div className="mt-4">
                                    <h6 className="fw-bold color-1">Descripción detallada</h6>
                                    <p className="color-2 small lh-base">
                                        {subasta.descripcion}
                                    </p>
                                </div>
                            )}

                            <Card className="border-0 shadow-sm rounded-4 mt-4">
                                <h6 className="color-1 fw-bold mb-3">
                                    <i className="bi bi-clock-history me-2"></i> Historial de pujas
                                </h6>
                                {subasta.historial_pujas && subasta.historial_pujas.length > 0 ? (
                                    subasta.historial_pujas.map((puja, idx) => (
                                        <div key={idx} className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                                            <div className="d-flex align-items-center">
                                                <div className="d-flex justify-content-center align-items-center me-2 overflow-hidden" 
                                                    style={{ 
                                                        width: '35px', 
                                                        height: '35px', 
                                                        backgroundColor: '#f3e1c7', 
                                                        borderRadius: '50%',
                                                        flexShrink: 0
                                                    }}>
                                                    {puja.foto_perfil_url ? (
                                                        <img 
                                                            src={puja.foto_perfil_url} 
                                                            alt={`Foto de ${puja.nombre || 'Usuario'}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <i className="bi bi-person color-1"></i>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="m-0 small fw-bold">
                                                        {user?.id === puja.usuario_id ? "Tú" : puja.nombre}
                                                    </p>
                                                    <small className="text-muted" style={{ fontSize: '10px' }}>{puja.tiempo}</small>
                                                </div>
                                            </div>
                                            <span className="fw-bold color-1">{puja.montoFormateado || formatearPrecio(puja.monto)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted text-center small">No hay pujas aún. ¡Sé el primero!</p>
                                )}
                            </Card>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal de imagen */}
            <Modal
                show={showModalImagen}
                onHide={() => setShowModalImagen(false)}
                centered
                size="lg"
                contentClassName="border-0 shadow-lg"
                style={{ borderRadius: '20px' }}
            >
                <div className="position-relative p-4" style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}>
                    <button
                        className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', zIndex: 10 }}
                        onClick={() => setShowModalImagen(false)}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                    
                    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
                        {esVideo(imagenModal) ? (
                            <video
                                key={imagenModal}
                                src={imagenModal}
                                controls
                                autoPlay
                                playsInline
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '50vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px'
                                }}
                            />
                        ) : (
                            <img
                                src={imagenModal}
                                alt="Imagen ampliada"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '50vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px'
                                }}
                            />
                        )}
                    </div>
                    
                    {subasta?.media?.length > 1 && (
                        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-dark bg-opacity-50 text-white rounded-pill px-3 py-1 small">
                            <i className="bi bi-images me-2"></i>
                            {indiceImagenActual + 1} / {subasta.media.length}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Modal de artículo de MegaSubasta */}
            <Modal
                show={showArticuloModal}
                onHide={() => {
                    setShowArticuloModal(false);
                    setArticuloSeleccionado(null);
                    setIndiceArticuloModal(0);
                    setIndiceImagenArticulo(0);
                    setMostrandoVideoArticulo(false);
                }}
                centered
                size="lg"
                contentClassName="border-0 shadow-lg"
                style={{ borderRadius: '20px' }}
            >
                {articuloSeleccionado && (
                    <div className="position-relative" style={{ backgroundColor: '#ffffff' }}>
                        <button
                            className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow d-flex align-items-center justify-content-center"
                            style={{ width: '36px', height: '36px', zIndex: 10, border: 'none' }}
                            onClick={() => {
                                setShowArticuloModal(false);
                                setArticuloSeleccionado(null);
                                setIndiceArticuloModal(0);
                                setIndiceImagenArticulo(0);
                                setMostrandoVideoArticulo(false);
                            }}
                        >
                            <i className="bi bi-x-lg" style={{ fontSize: '14px' }}></i>
                        </button>
                        <div className="p-4 p-lg-5">
                            <div className="row g-4">
                                <div className="col-lg-7">
                                    <div className="position-relative">
                                        <div 
                                            className="bg-light rounded-4 d-flex align-items-center justify-content-center overflow-hidden"
                                            style={{ 
                                                height: '400px',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                        >
                                            {mostrandoVideoArticulo && articuloSeleccionado.video_url ? (
                                                <video
                                                    src={articuloSeleccionado.video_url}
                                                    controls
                                                    autoPlay
                                                    playsInline
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (e.target.paused === false) {
                                                            setImagenModal(articuloSeleccionado.video_url);
                                                            setShowModalImagen(true);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                (() => {
                                                    const imagenes = [
                                                        articuloSeleccionado.foto1_url,
                                                        articuloSeleccionado.foto2_url,
                                                        articuloSeleccionado.foto3_url
                                                    ].filter(Boolean);
                                                    const totalImagenes = imagenes.length;
                                                    const idx = indiceImagenArticulo % totalImagenes;
                                                    const imgActual = totalImagenes > 0 ? imagenes[idx] : null;
                                                    
                                                    return imgActual ? (
                                                        <img 
                                                            src={imgActual} 
                                                            alt={articuloSeleccionado.titulo}
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '100%',
                                                                objectFit: 'contain'
                                                            }}
                                                            onClick={() => {
                                                                setImagenModal(imgActual);
                                                                setShowModalImagen(true);
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="text-muted text-center">
                                                            <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                                                            <p className="mt-2 small">Sin imágenes</p>
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </div>

                                        {(() => {
                                            const imagenes = [
                                                articuloSeleccionado.foto1_url,
                                                articuloSeleccionado.foto2_url,
                                                articuloSeleccionado.foto3_url
                                            ].filter(Boolean);
                                            const totalImagenes = imagenes.length;
                                            const tieneVideo = articuloSeleccionado.video_url ? true : false;
                                            const totalItems = totalImagenes + (tieneVideo ? 1 : 0);
                                            
                                            if (totalItems > 0) {
                                                return (
                                                    <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-dark bg-opacity-50 text-white rounded-pill px-3 py-1 small">
                                                        {mostrandoVideoArticulo ? '4/4' : `${indiceImagenArticulo + 1} / ${totalImagenes}`}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {totalItems > 1 && (
                                            <>
                                                <button
                                                    className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 shadow-sm d-flex align-items-center justify-content-center"
                                                    style={{ width: '32px', height: '32px', zIndex: 10, border: 'none' }}
                                                    onClick={() => {
                                                        if (mostrandoVideoArticulo) {
                                                            setMostrandoVideoArticulo(false);
                                                            setIndiceImagenArticulo(totalImagenes - 1);
                                                        } else {
                                                            const nuevoIndice = indiceImagenArticulo > 0 ? indiceImagenArticulo - 1 : totalImagenes - 1;
                                                            setIndiceImagenArticulo(nuevoIndice);
                                                        }
                                                    }}
                                                >
                                                    <i className="bi bi-chevron-left" style={{ fontSize: '12px' }}></i>
                                                </button>
                                                <button
                                                    className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 shadow-sm d-flex align-items-center justify-content-center"
                                                    style={{ width: '32px', height: '32px', zIndex: 10, border: 'none' }}
                                                    onClick={() => {
                                                        if (mostrandoVideoArticulo) {
                                                            setMostrandoVideoArticulo(false);
                                                            setIndiceImagenArticulo(0);
                                                        } else {
                                                            const nuevoIndice = indiceImagenArticulo < totalImagenes - 1 ? indiceImagenArticulo + 1 : totalImagenes - 1;
                                                            if (nuevoIndice === totalImagenes - 1 && tieneVideo) {
                                                                setMostrandoVideoArticulo(true);
                                                            } else {
                                                                setIndiceImagenArticulo(nuevoIndice);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <i className="bi bi-chevron-right" style={{ fontSize: '12px' }}></i>
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="d-flex gap-2 mt-2 overflow-auto pb-1" style={{ flexWrap: 'nowrap' }}>
                                        {(() => {
                                            const imagenes = [
                                                articuloSeleccionado.foto1_url,
                                                articuloSeleccionado.foto2_url,
                                                articuloSeleccionado.foto3_url
                                            ].filter(Boolean);
                                            
                                            return imagenes.map((img, idx) => (
                                                <div
                                                    key={`img-${idx}`}
                                                    className={`rounded-3 overflow-hidden flex-shrink-0 cursor-pointer ${
                                                        !mostrandoVideoArticulo && indiceImagenArticulo === idx ? 'border border-2 border-warning' : 'border border-2 border-transparent'
                                                    }`}
                                                    style={{ 
                                                        width: '70px', 
                                                        height: '60px', 
                                                        backgroundColor: '#f5f5f5', 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => {
                                                        setMostrandoVideoArticulo(false);
                                                        setIndiceImagenArticulo(idx);
                                                    }}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`Imagen ${idx + 1}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            ));
                                        })()}

                                        {articuloSeleccionado.video_url && (
                                            <div
                                                className={`rounded-3 overflow-hidden flex-shrink-0 cursor-pointer d-flex flex-column align-items-center justify-content-center ${
                                                    mostrandoVideoArticulo ? 'border border-2 border-warning' : 'border border-2 border-transparent'
                                                }`}
                                                style={{ 
                                                    width: '70px', 
                                                    height: '60px', 
                                                    backgroundColor: '#f5f5f5', 
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => setMostrandoVideoArticulo(true)}
                                            >
                                                <i className="bi bi-play-circle-fill fs-2 text-secondary"></i>
                                                <small className="text-muted" style={{ fontSize: '7px' }}>Video</small>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-lg-5">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                            Artículo {indiceArticuloModal + 1} de {subasta?.articulos?.length || 0}
                                        </span>
                                    </div>

                                    <h5 className="fw-bold color-1 mb-2" style={{ fontSize: '25px' }}>
                                        {articuloSeleccionado.titulo || 'Sin título'}
                                    </h5>
                                    
                                    <div className="mb-3">
                                        <h6 style={{ fontSize: '14px', color: '#9A5F25' }}>
                                            {articuloSeleccionado.categoria || 'Sin categoría'}
                                        </h6>
                                    </div>

                                    <div className="mb-3">
                                        <h6 className="fw-bold color-1 mb-1" style={{ fontSize: '15px' }}>
                                            Descripción
                                        </h6>
                                        <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                                            {articuloSeleccionado.descripcion || 'Sin descripción'}
                                        </p>
                                    </div>

                                    <div className="bg-light p-3 rounded-4 mt-3">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <small className="text-muted d-block small fw-bold">TIEMPO RESTANTE</small>
                                                <h6 className="text-muted fw-normal m-0">
                                                    {subasta?.tiempo || 'No disponible'}
                                                </h6>
                                            </div>
                                        </div>
                                    </div>

                                    {articuloSeleccionado.documento_url && (
                                        <div className="mt-3">
                                            <a
                                                href={articuloSeleccionado.documento_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-secondary"
                                            >
                                                <i className="bi bi-file-pdf me-1"></i> Ver PDF
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL DE MONTO INVÁLIDO */}
            <Modal 
                show={showMontoInvalidoModal} 
                onHide={() => setShowMontoInvalidoModal(false)}
                centered
                contentClassName="rounded-5"
                style={{backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}
            >
                <div className="p-3 text-white text-center fw-bold rounded-top-5" 
                    style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px" }}>
                    Monto inválido
                </div>
                <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
                    <div className="d-flex justify-content-center align-items-center mx-auto mb-4" 
                        style={{ width: "90px", height: "90px", backgroundColor: "#fff3cd", borderRadius: "30px" }}>
                        <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
                    </div>
                    <h3 className="mb-3" style={{ fontSize: "18px" }}>
                        Por favor, ingresa un monto válido
                    </h3>
                    <div className="d-flex flex-column gap-3">
                        <button 
                            onClick={() => setShowMontoInvalidoModal(false)} 
                            className="btn-2" 
                            style={{ borderRadius: "30px", padding: "10px", border: "none", color: "white" }}
                        >
                            Entendido
                        </button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* MODAL DE TICKETS INSUFICIENTES */}
            <Modal 
                show={showTicketsModal} 
                onHide={() => setShowTicketsModal(false)}
                centered
                contentClassName="rounded-5"
                style={{backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}
            >
                <div className="p-3 text-white text-center fw-bold rounded-top-5" 
                    style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px" }}>
                    Tickets insuficientes
                </div>
                <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
                    <div className="d-flex justify-content-center align-items-center mx-auto mb-4" 
                        style={{ width: "90px", height: "90px", backgroundColor: "#fff3cd", borderRadius: "30px" }}>
                        <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
                    </div>
                    <h3 className="mb-3" style={{ fontSize: "18px" }}>
                        Necesitas 5 tickets para pujar
                    </h3>
                    <div className="d-flex flex-column gap-3">
                        <button 
                            onClick={() => setShowTicketsModal(false)} 
                            className="btn-2" 
                            style={{ borderRadius: "30px", padding: "10px", border: "none", color: "white" }}
                        >
                            Entendido
                        </button>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal 
                show={showSuccessModal} 
                onHide={handleCerrarModal}
                centered
                backdrop="static"
                keyboard={false}
            >
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                    <div className="p-4 text-center text-white" style={{ background: 'linear-gradient(to right, #2a140a, #8d4925)' }}>
                        <i className="bi bi-check-circle-fill fs-1 mb-2"></i>
                        <h3 className="fw-bold mb-0">¡Puja realizada!</h3>
                    </div>
                    <Modal.Body className="text-center p-4">
                        <div className="py-3">
                            <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{ width: '70px', height: '70px' }}>
                                <i className="bi bi-trophy-fill fs-1 text-success"></i>
                            </div>
                            <p className="fs-5">{successMessage}</p>
                            <div className="alert alert-info mt-3">
                                <i className="bi bi-info-circle me-2"></i>
                                La página se actualizará automáticamente...
                            </div>
                        </div>
                    </Modal.Body>
                    <div className="modal-footer border-0 justify-content-center pb-4">
                        <Button 
                            className="btn-linear-gradient px-4"
                            onClick={handleCerrarModal}
                        >
                            Entendido
                        </Button>
                    </div>
                </div>
            </Modal>

            <MensajeModal
                show={modal.show}
                onHide={hideModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
};

export default SubastaDetalle;