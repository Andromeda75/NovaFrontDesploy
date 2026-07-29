import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Image, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { perfilService } from '../../services/perfilService';
import { notificacionService } from '../../services/notificacionService';

function Navbar() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [showNotificaciones, setShowNotificaciones] = useState(false);
    const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);
    const notificacionesRef = useRef(null);
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const rolId = authService.getCurrentRol();

    // Cargar foto de perfil
    useEffect(() => {
        if (isAuthenticated) {
            cargarFotoPerfil();
            cargarNotificaciones();
        }
    }, [isAuthenticated]);

    // Cargar notificaciones cada 30 segundos
    useEffect(() => {
        if (!isAuthenticated) return;
        
        const interval = setInterval(() => {
            cargarNotificaciones();
        }, 30000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificacionesRef.current && !notificacionesRef.current.contains(event.target)) {
                setShowNotificaciones(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const cargarFotoPerfil = async () => {
        try {
            const fotoGuardada = localStorage.getItem('fotoPerfil');
            if (fotoGuardada) {
                setFotoPerfil(fotoGuardada);
                return;
            }

            const perfilData = await perfilService.getPerfil();
            if (perfilData.foto_perfil_url) {
                setFotoPerfil(perfilData.foto_perfil_url);
                localStorage.setItem('fotoPerfil', perfilData.foto_perfil_url);
            }
        } catch (error) {
            console.error('Error cargando foto de perfil:', error);
        }
    };

    const cargarNotificaciones = async () => {
        if (!isAuthenticated) return;
        try {
            setLoadingNotificaciones(true);
            const data = await notificacionService.getNotificaciones();
            setNotificaciones(data.notificaciones || []);
            setNoLeidas(data.noLeidas || 0);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        } finally {
            setLoadingNotificaciones(false);
        }
    };

    const handleNotificacionClick = async (notificacion) => {
        try {
            // Marcar como leída
            if (!notificacion.leida) {
                await notificacionService.marcarComoLeida(notificacion.id);
                setNoLeidas(prev => Math.max(0, prev - 1));
                setNotificaciones(prev => 
                    prev.map(n => n.id === notificacion.id ? { ...n, leida: true } : n)
                );
            }

            // Redirigir según el tipo
            if (notificacion.referencia_tipo === 'subasta' && notificacion.referencia_id) {
                if (notificacion.tipo === 'subasta_ganada') {
                    navigate(`/subasta/${notificacion.referencia_id}/pago`);
                } else {
                    navigate(`/subasta/${notificacion.referencia_id}`);
                }
            }

            setShowNotificaciones(false);
        } catch (error) {
            console.error('Error al procesar notificación:', error);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await notificacionService.marcarTodasComoLeidas();
            setNoLeidas(0);
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
        }
    };

    const handleLogout = () => {
        authService.logout();
        localStorage.removeItem('fotoPerfil');
        setFotoPerfil(null);
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const getProfileLink = () => {
        if (!isAuthenticated) return '/login';
        if (rolId === '1') {
            return `/admin/${user?.id}`;
        }
        return `/perfil/${user?.id}`;
    };

    const getTiempoRelativo = (fecha) => {
        const ahora = new Date();
        const diffMs = ahora - new Date(fecha);
        const diffMin = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMin / 60);
        const diffDias = Math.floor(diffHoras / 24);

        if (diffMin < 1) return 'Hace unos segundos';
        if (diffMin < 60) return `Hace ${diffMin} min`;
        if (diffHoras < 24) return `Hace ${diffHoras} hr${diffHoras > 1 ? 's' : ''}`;
        if (diffDias < 7) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
        return new Date(fecha).toLocaleDateString('es-MX');
    };

    return (
        <nav className="border-bottom py-3 bg-white w-100">
            <Container fluid className="px-2 px-lg-5">
                <Row className="align-items-center g-0">
                    <Col xs={12} md={6} lg={3} className="d-flex justify-content-center align-items-center py-2">
                        <Link to="/">
                            <Image src="/src/assets/img/logos/LogoPrincipal.png" alt="NovaCreations" className='col-10' fluid />
                        </Link>
                    </Col>

                    <Col xs={12} md={6} lg={3} className="d-flex justify-content-center align-items-center">
                        <form onSubmit={handleSearch} className="w-100">
                            <div className="w-100 input-icon position-relative">
                                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3"></i>
                                <Form.Control 
                                    type="text"
                                    placeholder="Buscar obras, artistas, categorías..." 
                                    className="color-3 bg-light rounded-pill px-4 py-2 ps-5"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                        </form>
                    </Col>

                    <Col xs={12} md={6} lg={3} className="d-flex gap-2 justify-content-center align-items-center py-2 py-lg-1 ps-md-4 px-2">
                        <Link to="/peticiones" className="text-decoration-none color-white mb-0 d-inline-block flex-fill bg-color-1 border-0 rounded-3 fw-bold d-flex justify-content-center align-items-center gap-2 py-2">
                            <i className="bi bi-send fs-6"></i>
                            <span className="m-0">Peticiones</span> 
                        </Link>
                        
                        {isAuthenticated && (
                            <Link to="/tickets" className="text-decoration-none color-white mb-0 d-inline-block flex-fill bg-color-1 border-0 rounded-3 fw-bold d-flex justify-content-center align-items-center gap-2 py-2">
                                <i className="bi bi-ticket"></i>
                                <span className="m-0">Tickets</span>
                            </Link>
                        )}
                    </Col>

                    <Col xs={12} md={6} lg={3} className='d-flex justify-content-center justify-content-md-end justify-content-lg-end align-items-center gap-3 ps-lg-3 pe-md-3'>
                        
                        {isAuthenticated && (
                            <Link to={getProfileLink() + "?tab=favoritos"}>
                                <i className="bi bi-heart color-1 fw-bold fs-2"></i>
                            </Link>
                        )}
                        
                        {/* ========== NOTIFICACIONES CON DROPDOWN ========== */}
                        {isAuthenticated && (
                            <div className="position-relative" ref={notificacionesRef}>
                                <button 
                                    className="btn position-relative p-0 border-0 bg-transparent"
                                    onClick={() => setShowNotificaciones(!showNotificaciones)}
                                    aria-label="Notificaciones"
                                >
                                    <i className="bi bi-bell color-1 fw-bold fs-2"></i>
                                    {noLeidas > 0 && (
                                        <Badge 
                                            pill 
                                            bg="danger" 
                                            className="position-absolute top-0 end-0"
                                            style={{ 
                                                fontSize: '0.6rem', 
                                                transform: 'translate(25%, -25%)',
                                                padding: '0.25rem 0.5rem'
                                            }}
                                        >
                                            {noLeidas > 99 ? '99+' : noLeidas}
                                        </Badge>
                                    )}
                                </button>

                                {/* Dropdown de notificaciones */}
                                {showNotificaciones && (
                                    <div 
                                        className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-4 overflow-hidden"
                                        style={{ 
                                            width: '380px', 
                                            maxHeight: '500px',
                                            zIndex: 1050,
                                            minWidth: '300px'
                                        }}
                                    >
                                        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                                            <h6 className="mb-0 fw-bold color-1">Notificaciones</h6>
                                            {noLeidas > 0 && (
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary rounded-pill"
                                                    onClick={handleMarcarTodasLeidas}
                                                >
                                                    Marcar todas como leídas
                                                </button>
                                            )}
                                        </div>

                                        <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                            {loadingNotificaciones ? (
                                                <div className="p-4 text-center">
                                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                        <span className="visually-hidden">Cargando...</span>
                                                    </div>
                                                </div>
                                            ) : notificaciones.length === 0 ? (
                                                <div className="p-4 text-center">
                                                    <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                                                    <p className="text-muted mb-0">No tienes notificaciones</p>
                                                </div>
                                            ) : (
                                                notificaciones.map((notif) => (
                                                    <div 
                                                        key={notif.id}
                                                        className={`p-3 border-bottom cursor-pointer ${!notif.leida ? 'bg-light' : ''}`}
                                                        onClick={() => handleNotificacionClick(notif)}
                                                        style={{ 
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                        onMouseLeave={(e) => {
                                                            if (!notif.leida) {
                                                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                            } else {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                            }
                                                        }}
                                                    >
                                                        <div className="d-flex gap-2">
                                                            <div className="flex-shrink-0">
                                                                {notif.tipo === 'subasta_ganada' ? (
                                                                    <span className="badge bg-success rounded-circle p-2">
                                                                        <i className="bi bi-trophy"></i>
                                                                    </span>
                                                                ) : notif.tipo === 'subasta_vendida' ? (
                                                                    <span className="badge bg-primary rounded-circle p-2">
                                                                        <i className="bi bi-check-circle"></i>
                                                                    </span>
                                                                ) : (
                                                                    <span className="badge bg-secondary rounded-circle p-2">
                                                                        <i className="bi bi-info-circle"></i>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <small className="fw-bold">{notif.titulo}</small>
                                                                    <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                                                                        {getTiempoRelativo(notif.fecha_creacion)}
                                                                    </small>
                                                                </div>
                                                                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
                                                                    {notif.mensaje}
                                                                </p>
                                                                {!notif.leida && (
                                                                    <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.6rem' }}>
                                                                        Nueva
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="p-2 border-top text-center">
                                            <Link 
                                                to="/notificaciones" 
                                                className="text-decoration-none small color-2"
                                                onClick={() => setShowNotificaciones(false)}
                                            >
                                                Ver todas las notificaciones
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {isAuthenticated ? (
                            <>
                                <Link to={getProfileLink()}>
                                    {fotoPerfil ? (
                                        <img 
                                            src={fotoPerfil} 
                                            alt="Foto de perfil"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    ) : (
                                        <i className="bi bi-person-circle color-1 fw-bold fs-2"></i>
                                    )}
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="text-decoration-none color-1 px-2 ms-2 small fw-bold d-inline-flex align-items-center bg-transparent border-0"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-box-arrow-right fs-2 me-2"></i>
                                    <span className="d-none d-lg-inline">Cerrar Sesión</span>
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-decoration-none color-1 px-2 ms-2 small fw-bold d-inline-flex align-items-center">
                                <i className="bi bi-box-arrow-in-right fs-2 me-2"></i>
                                <span className="d-none d-lg-inline">Iniciar Sesión</span>
                            </Link>
                        )}
                    </Col>
                </Row>
            </Container>
        </nav>
    );
}

export default Navbar;