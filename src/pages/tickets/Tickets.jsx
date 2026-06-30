import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ticketsService } from '../../services/ticketsService';
import MensajeModal from '../../components/modals/MensajeModal';
import { useModal } from '../../components/modals/useModal';

function Tickets() {
  const navigate = useNavigate();
  const { modal, showModalMessage, hideModal } = useModal();
  const [paquetes, setPaquetes] = useState([]);
  const [saldoTickets, setSaldoTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const paquetesData = await ticketsService.getPaquetes();
      setPaquetes(paquetesData);
      if (isAuthenticated) {
        const saldoData = await ticketsService.getSaldo();
        setSaldoTickets(saldoData.saldo_tickets);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = (paquete) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setPaqueteSeleccionado(paquete);
    setShowModal(true);
  };

  const confirmarCompra = async () => {
    setProcesando(true);
    try {
      const response = await ticketsService.comprarPaquete(paqueteSeleccionado.id);
      window.location.href = response.url;
    } catch (error) {
      console.error('Error al crear sesión de pago:', error);
      showModalMessage('Error', 'Error al procesar el pago. Intenta de nuevo.', 'error');
      setProcesando(false);
    }
  };

  const formatearMoneda = (precio) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(precio);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="text-center mt-5">
        <span className="badge rounded-pill border border-warning color-3 px-3 py-2" style={{ backgroundColor: '#ffe0ad', fontSize: '22px' }}>
          <i className="bi bi-ticket-perforated color-3"></i> {saldoTickets} Tickets Disponibles
        </span>

        <h1 className="fw-bold texto-difuminado-colores" style={{ fontSize: '60px' }}>Impulsa tus Pujas</h1>
        <p className="color-3 fw-bold mb-0" style={{ fontSize: '15px' }}>
          El sistema de tickets permite que nuestras subastas sean justas y exclusivas.
        </p>
        <p className="color-3 fw-bold" style={{ fontSize: '15px' }}>
          Compra el plan que mejor se adapte a tu nivel de coleccionismo.
        </p>

        <Row className="justify-content-center g-4 mt-3">
          {paquetes.map((paquete, index) => {
            const esPopular = paquete.nombre === 'Coleccionista' || (paquete.cantidad_tickets === 100 && paquete.tickets_extra === 30);
            const ticketsExtra = paquete.tickets_extra || 0;
            const totalTickets = paquete.cantidad_tickets + ticketsExtra;
            
            return (
              <Col md={4} key={paquete.id}>
                <Card className={`p-4 shadow border-7-P position-relative mov-card ${index === 1 ? 'mt-0' : 'mt-3'}`}>
                  {esPopular && (
                    <span className="position-absolute top-0 start-50 translate-middle-x px-5 py-1 text-white" style={{ backgroundColor: "#9A5F25", borderRadius: "5px" }}>
                      MÁS POPULAR
                    </span>
                  )}
                  <h5 className='color-3 fw-bold' style={{ fontSize: '30px' }}>{paquete.nombre}</h5>
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="d-flex align-items-end">
                      <span className="fw-bold display-6 color-1 fw-bold">{paquete.cantidad_tickets}</span>
                      <span className="fs-4 ms-2 color-1 fw-bold">Tickets</span>
                    </div>
                  </div>
                  <i className="bi bi-ticket-perforated color-2">
                    {ticketsExtra > 0 ? `  +${ticketsExtra} Tickets Extras` : '  0 Tickets Extras'}
                  </i>
                  <p className="color-2 mt-3" style={{ fontSize: '15px' }}>
                    {paquete.descripcion || 'Adquiere tickets para participar en subastas y pujar por obras únicas.'}
                  </p>
                  <div className="d-flex justify-content-center align-items-center gap-3 color-1">
                    <p className="text-muted mb-0 color-2">Precio Total:</p>
                    <span className="mb-0 fw-bold">{formatearMoneda(paquete.precio_mxn)}</span>
                  </div>
                  <Button 
                    className="mt-3 btn-linear-gradient"
                    onClick={() => handleComprar(paquete)}
                  >
                    Comprar ahora <i className="bi bi-arrow-right"></i>
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>

      <div className="my-5 p-5 container py-5 px-4" style={{ backgroundColor: '#471900', borderRadius: '20px', color: 'white' }}>
        <Container>
          <h2 className="fw-bold mb-4" style={{ fontSize: '40px' }}>
            ¿Cómo funciona el sistema de tickets?
          </h2>
          <Row>
            <Col md={6} className="mb-4">
              <div className="d-flex align-items-start gap-3">
                <div className="d-flex justify-content-center align-items-center shadow-sm" style={{ width: "120px", height: "80px", backgroundColor: "#ffffff", borderRadius: "5px" }}>
                  <i className="bi bi-ticket-perforated fs-1" style={{ color: "#7A2E00" }}></i>
                </div>
                <div>
                  <h4 className="mb-1 fw-bold">Sistema de Tickets por Acción</h4>
                  <p className="mb-0 text-light">
                    Cada acción dentro de la plataforma consume una cantidad específica de tickets; a mayor visibilidad o impacto, mayor costo.
                  </p>
                </div>
              </div>
            </Col>

            <Col md={6} className="mb-4">
              <div className="d-flex align-items-start gap-3">
                <div className="d-flex justify-content-center align-items-center shadow-sm" style={{ width: "90px", height: "80px", backgroundColor: "#ffffff", borderRadius: "5px" }}>
                  <i className="bi bi-person fs-1" style={{ color: "#7A2E00" }}></i>
                </div>
                <div>
                  <h4 className="mb-1 fw-bold">Modo de Uso</h4>
                  <p className="mb-0 text-light">Los Tickets son personales e intransferibles para garantizar un uso justo dentro de la plataforma.</p>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="d-flex align-items-start gap-3">
                <div className="d-flex justify-content-center align-items-center shadow-sm" style={{ width: "90px", height: "80px", backgroundColor: "#ffffff", borderRadius: "5px" }}>
                  <i className="bi bi-clock fs-1" style={{ color: "#7A2E00" }}></i>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Sin Presión de Tiempo</h5>
                  <p className="mb-0 text-light">Los Tickets no caducan, permitiendo al usuario usarlos cuando lo considere conveniente.</p>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="d-flex align-items-start gap-3">
                <div className="d-flex justify-content-center align-items-center shadow-sm" style={{ width: "90px", height: "80px", backgroundColor: "#ffffff", borderRadius: "5px" }}>
                  <i className="bi bi-chat-left fs-1" style={{ color: "#7A2E00" }}></i>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Confirmación de Uso</h5>
                  <p className="mb-0 text-light">Antes de consumir tickets en acciones de alto costo, el sistema solicita una confirmación del usuario.</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
          <div className="p-4 text-center text-white" style={{ background: 'linear-gradient(to right, #2a140a, #8d4925)' }}>
            <i className="bi bi-credit-card fs-1 mb-2"></i>
            <h3 className="fw-bold mb-0">Confirmar Compra</h3>
            <p className="mb-0 small opacity-75">
              {paqueteSeleccionado && (
                <>Total: {formatearMoneda(paqueteSeleccionado.precio_mxn)}</>
              )}
            </p>
          </div>
          <Modal.Body className="p-4">
            {paqueteSeleccionado && (
              <div className="bg-light p-3 rounded-4 mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Paquete:</span>
                  <span className="fw-bold">{paqueteSeleccionado.nombre}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tickets:</span>
                  <span className="fw-bold">{paqueteSeleccionado.cantidad_tickets}</span>
                </div>
                {paqueteSeleccionado.tickets_extra > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Tickets Extra:</span>
                    <span className="fw-bold">+{paqueteSeleccionado.tickets_extra}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Total:</span>
                  <span className="fw-bold fs-5">{formatearMoneda(paqueteSeleccionado.precio_mxn)}</span>
                </div>
              </div>
            )}
            
            <div className="alert alert-info d-flex align-items-center gap-2">
              <i className="bi bi-shield-check fs-4"></i>
              <div>
                <small>Serás redirigido a Stripe para completar el pago de forma segura. 
                <strong> No guardamos los datos de tu tarjeta.</strong></small>
              </div>
            </div>

            <div className="d-flex gap-3">
              <Button 
                variant="outline-secondary" 
                className="flex-grow-1 rounded-pill py-2"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="btn-2 flex-grow-1 rounded-pill py-2"
                onClick={confirmarCompra}
                disabled={procesando}
              >
                {procesando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Procesando...
                  </>
                ) : (
                  'Pagar con Stripe'
                )}
              </Button>
            </div>
          </Modal.Body>
        </div>
      </Modal>

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

export default Tickets;