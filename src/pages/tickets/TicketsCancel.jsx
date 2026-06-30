import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

function TicketsCancel() {
    const navigate = useNavigate();

    useEffect(() => {
        // Registrar que el pago fue cancelado
        console.log('Pago cancelado por el usuario');
    }, []);

    return (
        <Container className="text-center mt-5 py-5">
            <div className="card shadow-lg p-5" style={{ borderRadius: '25px', maxWidth: '600px', margin: '0 auto' }}>
                <i className="bi bi-x-circle-fill text-danger fs-1 mb-3"></i>
                <h2 className="fw-bold text-danger">Pago cancelado</h2>
                <p className="mt-3">Has cancelado el proceso de pago. No se ha realizado ningún cargo.</p>
                <p className="text-muted small">Puedes intentarlo nuevamente cuando quieras.</p>
                <div className="d-flex flex-column gap-2 mt-4">
                    <Button className="btn-linear-gradient" onClick={() => navigate('/tickets')}>
                        Volver a tickets
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/')}>
                        Ir al inicio
                    </Button>
                </div>
            </div>
        </Container>
    );
}

export default TicketsCancel;