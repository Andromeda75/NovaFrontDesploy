// src/pages/subastas/PagoExitoso.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { ticketsService } from '../../services/ticketsService';

function PagoExitoso() {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');

    const sessionId = searchParams.get('session_id');
    const subastaId = searchParams.get('subasta_id');

    useEffect(() => {
        const confirmarPago = async () => {
            if (!sessionId || !subastaId) {
                setLoading(false);
                setSuccess(false);
                setMessage('No se encontró información del pago');
                return;
            }

            try {
                const response = await ticketsService.confirmarPagoSubasta(sessionId, subastaId);
                if (response.success) {
                    setSuccess(true);
                    setMessage('¡Pago completado exitosamente! Tu compra ha sido confirmada.');
                } else {
                    setSuccess(false);
                    setMessage(response.message || 'El pago no pudo ser confirmado');
                }
            } catch (error) {
                console.error('Error confirmando pago:', error);
                setSuccess(false);
                setMessage(error.response?.data?.message || 'Error al confirmar el pago');
            } finally {
                setLoading(false);
            }
        };

        confirmarPago();
    }, [sessionId, subastaId]);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Confirmando tu pago...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="border-0 shadow-lg rounded-4">
                        <Card.Body className="p-5 text-center">
                            {success ? (
                                <>
                                    <div className="mb-4">
                                        <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                                            style={{ width: '80px', height: '80px' }}>
                                            <i className="bi bi-check-circle-fill text-success fs-1"></i>
                                        </div>
                                    </div>
                                    <h3 className="fw-bold color-1 mb-3">¡Pago Exitoso!</h3>
                                    <p className="text-muted mb-4">{message}</p>
                                    <div className="d-flex flex-column gap-2">
                                        <Link to="/mis-subastas" className="btn btn-linear-gradient rounded-pill py-2">
                                            Ver mis subastas
                                        </Link>
                                        <Link to="/" className="btn btn-outline-secondary rounded-pill py-2">
                                            Ir al inicio
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                                            style={{ width: '80px', height: '80px' }}>
                                            <i className="bi bi-x-circle-fill text-danger fs-1"></i>
                                        </div>
                                    </div>
                                    <h3 className="fw-bold color-1 mb-3">Error en el Pago</h3>
                                    <p className="text-muted mb-4">{message}</p>
                                    <div className="d-flex flex-column gap-2">
                                        <Link to="/" className="btn btn-linear-gradient rounded-pill py-2">
                                            Ir al inicio
                                        </Link>
                                        <Link to="/subasta" className="btn btn-outline-secondary rounded-pill py-2">
                                            Ver subastas disponibles
                                        </Link>
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default PagoExitoso;