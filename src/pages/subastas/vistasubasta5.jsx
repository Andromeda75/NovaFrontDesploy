import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, InputGroup, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import card5 from '../../assets/img/illustrations/categories/arte-visual/imgA_V5.jpg';

const VistaSubasta = () => {
  const [view, setView] = useState('detalle');
  const navigate = useNavigate();

  const handleVolver = () => {
    if (view === 'detalle') {
      // Si ya estamos en vista detalle, navegamos a la raíz
      navigate('/');
    } else {
      // Si estamos en otra vista (checkout), volvemos a detalle
      setView('detalle');
    }
  };

  return (
    <div className="bg-color-white w-100 d-flex flex-column">

      <Container fluid="xxl" className="my-4 flex-grow-1 px-lg-5">
        <Button 
          variant="link" 
          className="text-decoration-none color-2 p-0 mb-3 fw-bold" 
          onClick={handleVolver}
        >
          <i className="bi bi-arrow-left me-2"></i>
          {view === 'detalle' ? 'Salir de la subasta' : 'Volver a detalles'}
        </Button>

        <Row className="g-4">
          <Col lg={7}>
            <div className="bg-color-5 rounded-4 mb-3 d-flex align-items-center justify-content-center shadow-sm" style={{ 
                  minHeight: '550px', 
                  backgroundImage: `url(${card5})`, 
                  backgroundSize: 'cover',       
                  backgroundPosition: 'center',  
                  backgroundRepeat: 'no-repeat',
                }}>
              <span className="text-white opacity-50 fs-4" ></span>
            </div>
            <Row className="g-2 ">
              <Col xs={4}><div className="bg-color-5 rounded-3 shadow-sm" style={{ height: '140px', backgroundImage: `url(${card5})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div></Col>
              <Col xs={4}><div className="bg-color-5 rounded-3 shadow-sm" style={{ height: '140px', backgroundImage: `url(${card5})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div></Col>
              <Col xs={4}><div className="bg-color-5 rounded-3 shadow-sm" style={{ height: '140px', backgroundImage: `url(${card5})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div></Col>
            </Row>
          </Col>

          <Col lg={5}>
            {view === 'detalle' && (
              <div className="d-flex flex-column gap-4">
                <Card className="border-0 shadow-sm rounded-4 p-4">
                  <div className="d-flex align-items-center mb-4">
                 <div className="d-flex justify-content-center align-items-center shadow-sm me-3" style={{width: "55px", height: "55px", backgroundColor: "#E8B767", borderRadius: "8px"}}>
                   <i className="bi bi-person color-1 fs-5"></i>
                 </div>
                    <div>
                      <h6 className="m-0 fw-bold color-1">Marcos T.</h6>
                      <small className="color-4"> <i className="bi bi-star-fill"></i> 4.9 / 5.0</small>
                    </div>
                    <div className='ms-auto'>
                      <img src="/img/assets/img/iconos/heart.png" alt="Favoritos" style={{ height: '24px', width: 'auto', cursor: 'pointer' }} />
                    </div>  
                  </div>
                  <small className="color-3 fw-bold">ARTE VISUAL</small>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h2 className="color-1 fw-bold m-0">Minimalist Horizon</h2>
                    <div className="d-flex align-items-center gap-2 color-2">
                      <img src="/img/assets/img/iconos/users.png" alt="Pujadores" style={{ height: '20px' }} />
                      <span className="fw-bold">12 pujas</span>
                    </div>
                  </div>
                  <div className="bg-light p-3 rounded-4 my-3 d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block small fw-bold">PUJA ACTUAL</small>
                      <h4 className="color-1 fw-bold m-0">$2,500.00 MXN</h4>
                    </div>
                    <div className="text-end">
                      <small className="text-muted d-block small fw-bold">CIERRA EN</small>
                      <h4 className="text-muted fw-normal m-0">00d:12h:51m</h4>
                    </div>
                  </div>
                  <div className="bg-color-4-T p-3 rounded-4 d-flex align-items-center gap-3 mb-4">
                     <i className="bi bi-ticket-perforated color-3 fs-3"></i>
                    <div>
                      <p className="m-0 small color-2" style={{ lineHeight: '1.2' }}>
                        Esta puja consumirá <br /> 
                        <span className="fs-6 fw-bold">6 Tickets</span>
                      </p>
                    </div>
                  </div>

                  <Button className="bg-color-1 border-0 w-100 py-3 fw-bold mb-2 shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={() => setView('checkout')}>
                    <img src="/img/assets/img/iconos/pujar_icon.png" alt="" style={{ height: '18px', filter: 'brightness(0) invert(1)' }} />
                    <i className="bi bi-arrow-up-right me-2"></i>  PUJAR AHORA
                  </Button>
                  <small className="text-center d-block text-muted fw-bold">PUJA MÍNIMA: 500.00MXN</small>
                </Card>
                <Card className="border-0 shadow-sm rounded-4 p-4">
                  <h5 className="color-1 fw-bold mb-3">  <i className="bi bi-clock"></i> Historial de pujas</h5>
                  {[ {n: 'Marcus', p: '$3,200'}, {n: 'Carla J.', p: '$3,000'}, {n: 'Alejandra R.', p: '$2,800'} ].map((puja, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle me-2" style={{ width: '35px', height: '35px' }}></div>
                        <div>
                          <p className="m-0 small fw-bold">{puja.n}</p>
                          <small className="text-muted" style={{ fontSize: '10px' }}>HACE 3 MIN</small>
                        </div>
                      </div>
                      <span className="fw-bold color-1">{puja.p}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}
            {view === 'checkout' && (
              <Card className="border-0 shadow-sm rounded-4 p-4">
                <h2 className="fw-bold color-1 mb-4">Finalizar Compra</h2>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="m-0 color-1 fw-bold">Minimalist Horizon</h5>
                  <Badge bg="success" className="bg-opacity-10 text-success border border-success">SUBASTA GANADA</Badge>
                </div>
                
                <div className="my-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Puja ganadora</span>
                    <span className="fw-bold">$2,500.00 MXN</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Envío</span>
                    <span className="fw-bold">$20 MXN</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <h4 className="fw-bold color-1">Total</h4>
                    <h4 className="fw-bold color-1">$2,520 MXN</h4>
                  </div>
                  <small className="text-muted d-block text-end" style={{ fontSize: '10px' }}>Se aplica una comisión del 3% por servicio.</small>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold color-1 mb-3">Método de Pago</h6>
                  <div className="border rounded-3 p-3 d-flex align-items-center bg-light">
                    <div className="bg-white border rounded p-2 me-3">
                      <img src="/img/assets/img/iconos/hand.png" alt="Visa" style={{ height: '40px', width: 'auto' }} />
                    </div>
                    <div>
                      <p className="m-0 small fw-bold">**** 4242</p>
                      <small className="text-muted">EXP: 12/26</small>
                    </div>
                    <Form.Check type="radio" className="ms-auto" defaultChecked name="payment" />
                  </div>
                </div>

                <Button className="bg-color-1 border-0 w-100 py-3 fw-bold rounded-3 shadow-sm">
                  CONFIRMAR PAGO
                </Button>
              </Card>
            )}

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VistaSubasta;