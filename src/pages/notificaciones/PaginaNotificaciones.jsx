import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { notificacionService } from '../../services/notificacionService';
import { useModal } from '../../components/modals/useModal';
import MensajeModal from '../../components/modals/MensajeModal';

function PaginaNotificaciones() {
    const { modal, showModalMessage, hideModal } = useModal();
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noLeidas, setNoLeidas] = useState(0);

    useEffect(() => {
        cargarNotificaciones();
    }, []);

    const cargarNotificaciones = async () => {
        try {
            setLoading(true);
            const data = await notificacionService.getNotificaciones();
            setNotificaciones(data.notificaciones || []);
            setNoLeidas(data.noLeidas || 0);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            showModalMessage('Error', 'No se pudieron cargar las notificaciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarLeida = async (id) => {
        try {
            await notificacionService.marcarComoLeida(id);
            setNotificaciones(prev => 
                prev.map(n => n.id === id ? { ...n, leida: true } : n)
            );
            setNoLeidas(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marcando notificación:', error);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await notificacionService.marcarTodasComoLeidas();
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
            setNoLeidas(0);
            showModalMessage('Éxito', 'Todas las notificaciones marcadas como leídas', 'success');
        } catch (error) {
            console.error('Error marcando todas:', error);
            showModalMessage('Error', 'Error al marcar todas como leídas', 'error');
        }
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

    const handleNotificacionClick = (notificacion) => {
        if (!notificacion.leida) {
            handleMarcarLeida(notificacion.id);
        }

        if (notificacion.referencia_tipo === 'subasta' && notificacion.referencia_id) {
            window.location.href = `/subasta/${notificacion.referencia_id}/pago`;
        }
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

    return (
        <>
            <Container className="py-4">
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold color-2 mb-0">
                                    <i className="bi bi-bell me-2"></i>
                                    Notificaciones
                                </h2>
                                <p className="text-muted mb-0">
                                    {noLeidas > 0 
                                        ? `Tienes ${noLeidas} notificaciones no leídas` 
                                        : 'Todas las notificaciones leídas'}
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                {noLeidas > 0 && (
                                    <Button 
                                        variant="outline-secondary" 
                                        className="rounded-pill"
                                        onClick={handleMarcarTodasLeidas}
                                    >
                                        <i className="bi bi-check-all me-2"></i>
                                        Marcar todas como leídas
                                    </Button>
                                )}
                                
                            </div>
                        </div>
                    </Col>
                </Row>

                {notificaciones.length === 0 ? (
                    <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                        <Card.Body>
                            <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                            <h5 className="fw-bold color-1">No tienes notificaciones</h5>
                            <p className="text-muted">Todas tus notificaciones aparecerán aquí.</p>
                            <Link to="/" className="btn btn-linear-gradient rounded-pill px-4">
                                Ir al inicio
                            </Link>
                        </Card.Body>
                    </Card>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {notificaciones.map((notif) => (
                            <Card 
                                key={notif.id}
                                className={`border-0 shadow-sm rounded-4 cursor-pointer transition ${!notif.leida ? 'bg-light' : ''}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <Card.Body className="p-4">
                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="flex-shrink-0">
                                            {notif.tipo === 'subasta_ganada' ? (
                                                <span className="badge bg-success rounded-circle p-3">
                                                    <i className="bi bi-trophy fs-5"></i>
                                                </span>
                                            ) : notif.tipo === 'subasta_vendida' ? (
                                                <span className="badge bg-primary rounded-circle p-3">
                                                    <i className="bi bi-check-circle fs-5"></i>
                                                </span>
                                            ) : notif.tipo === 'subasta_sin_pujas' ? (
                                                <span className="badge bg-secondary rounded-circle p-3">
                                                    <i className="bi bi-info-circle fs-5"></i>
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary rounded-circle p-3">
                                                    <i className="bi bi-info-circle fs-5"></i>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold mb-1 color-1">
                                                        {notif.titulo}
                                                    </h6>
                                                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                                        {notif.mensaje}
                                                    </p>
                                                </div>
                                                <div className="text-end flex-shrink-0 ms-3">
                                                    <small className="text-muted d-block">
                                                        {getTiempoRelativo(notif.fecha_creacion)}
                                                    </small>
                                                    {!notif.leida && (
                                                        <Badge bg="primary" pill className="mt-1">
                                                            Nueva
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
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

export default PaginaNotificaciones;