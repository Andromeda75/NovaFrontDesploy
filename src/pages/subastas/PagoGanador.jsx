import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { notificacionService } from '../../services/notificacionService';
import { useModal } from '../../components/modals/useModal';
import MensajeModal from '../../components/modals/MensajeModal';

function formatearPrecio(precio) {
    if (precio == null || isNaN(precio)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(precio);
}

function formatearFecha(fecha) {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function PagoGanador() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { modal, showModalMessage, hideModal } = useModal();
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        cargarDatosPago();
    }, [id]);

    const cargarDatosPago = async () => {
        try {
            setLoading(true);
            const response = await notificacionService.getPagoGanador(id);
            setData(response);
        } catch (error) {
            console.error('Error cargando datos de pago:', error);
            if (error.response?.status === 404) {
                showModalMessage('Error', 'No eres el ganador de esta subasta o ya fue pagada', 'error');
                navigate('/mis-subastas');
            } else {
                showModalMessage('Error', 'No se pudieron cargar los datos de la subasta', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // FUNCIÓN PLACEHOLDER - Tu amigo implementará el pago real
    const handlePagar = () => {
        showModalMessage(
            '💳 Procesando pago',
            'El módulo de pago está en desarrollo. Próximamente disponible.',
            'info'
        );
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </Container>
        );
    }

    if (!data) {
        return (
            <Container className="py-5 text-center">
                <Alert variant="danger" className="rounded-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    No se encontró información de esta subasta
                </Alert>
                <Link to="/mis-subastas" className="btn btn-linear-gradient rounded-pill px-4">
                    Volver a mis subastas
                </Link>
            </Container>
        );
    }

    const { subasta, vendedor, total_a_pagar } = data;
    const yaPagado = subasta.pago_realizado;
    const esMega = subasta.esMegaSubasta;
    const imagenPrincipal = esMega ? subasta.portada || subasta.foto1_url : subasta.foto1_url;
    const tituloMostrar = esMega ? 'MegaSubasta' : subasta.titulo;
    const COMISION = 0.10; // 10% de comisión

    return (
        <>
            <Container className="py-4">
                <Row className="mb-3">
                    <Col>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <Link to="/" className="text-decoration-none color-2">Inicio</Link>
                                </li>
                                
                                <li className="breadcrumb-item active" aria-current="page">
                                    Completar pago
                                </li>
                            </ol>
                        </nav>
                    </Col>
                </Row>

                {yaPagado ? (
                    <Alert variant="success" className="rounded-4 shadow-sm">
                        <div className="d-flex align-items-center gap-3">
                            <i className="bi bi-check-circle-fill fs-1 text-success"></i>
                            <div>
                                <h5 className="fw-bold mb-1">¡Pago completado!</h5>
                                <p className="mb-0 text-muted">
                                    Esta subasta ya ha sido pagada. El vendedor se pondrá en contacto contigo.
                                </p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Link to="/mis-subastas" className="btn btn-outline-secondary rounded-pill">
                                Volver a mis subastas
                            </Link>
                        </div>
                    </Alert>
                ) : (
                    <>
                        <div className="bg-success bg-opacity-10 p-3 rounded-4 mb-4 d-flex align-items-center gap-3">
                            <div className="bg-success rounded-circle p-2 text-white">
                                <i className="bi bi-trophy fs-3"></i>
                            </div>
                            <div>
                                <h4 className="fw-bold text-success mb-0">¡Felicidades! Has ganado esta subasta</h4>
                                <p className="mb-0 text-muted">Completa el pago para asegurar tu compra</p>
                            </div>
                        </div>

                        <Row className="g-4">
                            <Col lg={7}>
                                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                    <div 
                                        className="position-relative"
                                        style={{
                                            height: '350px',
                                            backgroundImage: `url(${imagenPrincipal || 'https://via.placeholder.com/800x400?text=Sin+imagen'})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundColor: '#f0f0f0'
                                        }}
                                    >
                                        {esMega && (
                                            <span className="position-absolute bottom-0 start-0 m-3 px-3 py-2 rounded-pill" 
                                                style={{ 
                                                    background: 'rgba(255,255,255,0.9)',
                                                    color: '#8d4925',
                                                    fontWeight: '600',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <i className="bi bi-collection me-2"></i>
                                                MegaSubasta
                                            </span>
                                        )}
                                        
                                        <Badge 
                                            bg="success" 
                                            className="position-absolute top-0 end-0 m-3 px-3 py-2"
                                            style={{ fontSize: '12px' }}
                                        >
                                            <i className="bi bi-check-circle-fill me-1"></i>
                                            GANADA
                                        </Badge>
                                    </div>

                                    <Card.Body className="p-4">
                                        <h3 className="fw-bold color-1 mb-2">{tituloMostrar}</h3>
                                        
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            <Badge bg="light" text="dark" className="px-3 py-2">
                                                <i className="bi bi-tag me-1"></i>
                                                {subasta.categoria || 'Sin categoría'}
                                            </Badge>
                                            <Badge bg="light" text="dark" className="px-3 py-2">
                                                <i className="bi bi-clock me-1"></i>
                                                Duración: {subasta.duracion_horas || 0}h
                                            </Badge>
                                            <Badge  className="px-3 py-2" 
                                                style={{ 
                                                    backgroundColor: '#9A5F25',
                                                    color: 'white'
                                                }}
                                            >
                                                <i className="bi bi-hourglass-split me-1"></i>
                                                Estado: Pendiente
                                            </Badge>
                                        </div>

                                        <div className="mb-4">
                                            <h6 className="fw-bold color-1">Descripción</h6>
                                            <p className="text-muted" style={{ lineHeight: '1.6' }}>
                                                {subasta.descripcion || 'Sin descripción disponible'}
                                            </p>
                                        </div>

                                        {esMega && subasta.articulos && subasta.articulos.length > 0 && (
                                            <div className="mb-4">
                                                <h6 className="fw-bold color-1 mb-3">
                                                    <i className="bi bi-collection me-2"></i>
                                                    Artículos incluidos ({subasta.articulos.length})
                                                </h6>
                                                <div className="row g-2">
                                                    {subasta.articulos.map((art, idx) => (
                                                        <div key={idx} className="col-6 col-md-4">
                                                            <div className="border rounded-3 p-2 text-center">
                                                                <div 
                                                                    style={{
                                                                        height: '80px',
                                                                        backgroundImage: `url(${art.foto1_url || 'https://via.placeholder.com/150x150?text=Sin+imagen'})`,
                                                                        backgroundSize: 'cover',
                                                                        backgroundPosition: 'center',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: '#f5f5f5'
                                                                    }}
                                                                />
                                                                <small className="d-block mt-1 text-truncate" style={{ fontSize: '11px' }}>
                                                                    {art.titulo || `Artículo ${idx + 1}`}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="row g-3 bg-light p-3 rounded-4">
                                            <div className="col-6">
                                                <small className="text-muted d-block">Fecha de inicio</small>
                                                <span className="fw-bold">{formatearFecha(subasta.fecha_inicio)}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Fecha de finalización</small>
                                                <span className="fw-bold">{formatearFecha(subasta.fecha_fin)}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Precio inicial</small>
                                                <span className="fw-bold">{formatearPrecio(subasta.precio_inicial_mxn)}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Puja mínima</small>
                                                <span className="fw-bold">{formatearPrecio(subasta.puja_minima_mxn)}</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col lg={5}>
                                <Card className="border-0 shadow-sm rounded-4 mb-4">
                                    <Card.Body className="p-4">
                                        <h6 className="fw-bold color-1 mb-3">
                                            <i className="bi bi-person me-2"></i>
                                            Vendedor
                                        </h6>
                                        <div className="d-flex align-items-center gap-3">
                                            <div 
                                                className="rounded-circle overflow-hidden flex-shrink-0"
                                                style={{ width: '60px', height: '60px', backgroundColor: '#f0f0f0' }}
                                            >
                                                {vendedor.foto_perfil ? (
                                                    <img 
                                                        src={vendedor.foto_perfil} 
                                                        alt={vendedor.nombre}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-center h-100">
                                                        <i className="bi bi-person fs-2 text-secondary"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-0">{vendedor.nombre}</h6>
                                                {vendedor.calificacion && typeof vendedor.calificacion === 'number' && (
                                                    <small className="text-warning">
                                                        <i className="bi bi-star-fill me-1"></i>
                                                        {vendedor.calificacion.toFixed(1)}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="border-0 shadow-sm rounded-4 mb-4">
                                    <Card.Body className="p-4">
                                        <h6 className="fw-bold color-1 mb-3">
                                            <i className="bi bi-credit-card me-2"></i>
                                            Resumen del pago
                                        </h6>
                                        
                                        <div className="d-flex justify-content-between py-2 border-bottom">
                                            <span className="text-muted">Monto ganador</span>
                                            <span className="fw-bold">{formatearPrecio(total_a_pagar)}</span>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between py-2 border-bottom">
                                            <span className="text-muted">Comisión (10%)</span>
                                            <span className="text-muted">{formatearPrecio(total_a_pagar * COMISION)}</span>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between py-3">
                                            <span className="fw-bold color-1">Total a pagar</span>
                                            <span className="fw-bold fs-5 color-2">{formatearPrecio(total_a_pagar)}</span>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="border-0 shadow-sm rounded-4">
                                    <Card.Body className="p-4">
                                        <h6 className="fw-bold color-1 mb-3">
                                            <i className="bi bi-wallet2 me-2"></i>
                                            Método de pago
                                        </h6>

                                        <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                                            
                                        </div>

                                        

                                        <div className="text-center mb-3">
                                            <small className="text-muted">
                                                <i className="bi bi-plus-circle me-1"></i>
                                                Agregar nuevo método de pago
                                            </small>
                                        </div>

                                        <div className="mt-3">
                                            <Button
                                                className="btn-linear-gradient w-100 py-3 rounded-pill fw-bold"
                                                onClick={handlePagar}
                                            >
                                                <i className="bi bi-check-circle me-2"></i>
                                                Pagar ahora
                                            </Button>
                                        </div>

                                        <div className="mt-3 text-center">
                                            <small className="text-muted">
                                                <i className="bi bi-lock-fill me-1"></i>
                                                Tu pago es seguro y encriptado
                                            </small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Container>

            <MensajeModal
                show={modal.show}
                onHide={hideModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </>
    );
}

export default PagoGanador;