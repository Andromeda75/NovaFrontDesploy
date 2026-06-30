import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Button, Spinner } from 'react-bootstrap';
import { ticketsService } from '../../services/ticketsService';

function TicketsSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const paqueteId = searchParams.get('paquete_id');

        if (!sessionId || !paqueteId) {
            setMessage('Información de pago no encontrada');
            setError(true);
            setLoading(false);
            return;
        }

        const processedKey = `stripe_processed_${sessionId}`;
        if (localStorage.getItem(processedKey) === 'true') {
            setMessage('Este pago ya fue procesado anteriormente. Los tickets ya están en tu cuenta.');
            setLoading(false);
            return;
        }

        const confirmar = async () => {
            if (processed) return;
            setProcessed(true);

            try {
                const result = await ticketsService.confirmarPago(sessionId, paqueteId);
                
                if (result.success) {
                    if (result.already_processed) {
                        setMessage('Este pago ya fue procesado anteriormente. Los tickets ya están en tu cuenta.');
                    } else {
                        localStorage.setItem(processedKey, 'true');
                        setMessage(`¡Pago exitoso! Has adquirido ${result.tickets_adquiridos} tickets (${result.tickets_base} base + ${result.tickets_extra} extra).`);
                    }
                    setError(false);
                } else {
                    setMessage(result.message || 'Error al confirmar el pago');
                    setError(true);
                }
            } catch (err) {
                console.error('Error:', err);
                setMessage('Error al confirmar el pago. Contacta a soporte.');
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        confirmar();
    }, []);

    if (loading) {
        return (
            <Container className="text-center mt-5 py-5">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h3>Confirmando tu pago...</h3>
                <p className="text-muted">Por favor espera un momento</p>
            </Container>
        );
    }

    return (
        <Container className="text-center mt-5 py-5">
            <div className="card shadow-lg p-5" style={{ borderRadius: '25px', maxWidth: '600px', margin: '0 auto' }}>
                <i className={`bi ${error ? 'bi-x-circle-fill text-danger' : 'bi-check-circle-fill text-success'} fs-1 mb-3`}></i>
                <h2 className={`fw-bold ${error ? 'text-danger' : 'color-1'}`}>
                    {error ? 'Error en el pago' : '¡Gracias por tu compra!'}
                </h2>
                <p className="mt-3">{message}</p>
                <div className="d-flex flex-column gap-2 mt-4">
                    <Button className="btn-linear-gradient" onClick={() => navigate('/perfil/historial?tab=Tickets')}>
                        Ver mi historial de tickets
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/tickets')}>
                        Volver a tickets
                    </Button>
                </div>
            </div>
        </Container>
    );
}

export default TicketsSuccess;