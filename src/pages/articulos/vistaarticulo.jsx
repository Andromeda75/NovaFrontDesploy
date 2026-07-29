import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, InputGroup, Card, Badge } from 'react-bootstrap';

const VistaArticulo = () => {
  const [mostrarPago, setMostrarPago] = useState(false);

  return (
    <div className="bg-color-white d-flex flex-column">

      <Container fluid="xxl" className="my-4 flex-grow-1 px-lg-5">
        <Button variant="link" className="text-decoration-none color-2 p-0 mb-3 fw-bold"onClick={() => setMostrarPago(false)}><i className="bi bi-arrow-left me-2"></i>
          {mostrarPago ? " Volver al producto" : " Volver a explorar"}
        </Button>

        <Row className="g-4">
          <Col lg={7}>
            <div className="bg-color-5 rounded-4 mb-3 d-flex align-items-center justify-content-center shadow-sm" style={{ minHeight: '550px', overflow: 'hidden' }}>
              <span className="text-white opacity-50 fs-4">Imagen Principal</span>
            </div>
            <Row className="g-2">
              <Col xs={4}><div className="bg-color-5 rounded-3 shadow-sm" style={{ height: '140px' }}></div></Col>
              <Col xs={4}><div className="bg-color-5 rounded-3 shadow-sm" style={{ height: '140px' }}></div></Col>
              <Col xs={4}><div className="bg-color-5 rounded-3 shadow-sm" style={{ height: '140px' }}></div></Col>
            </Row>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm rounded-5 p-4 ">
              {!mostrarPago ? (
                <>
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-color-4 rounded-3 me-3 d-flex align-items-center justify-content-center overflow-hidden shadow-sm" style={{ width: '55px', height: '55px' }}>
                      <i class="bi bi-person" style={{ fontSize: '55px', color: 'black' }}></i>
                    </div>
                    <div>
                      <h5 className="m-0 color-1 fw-bold">Lorena Peralta</h5>
                      <small className="color-4"> <i class="bi bi-star-fill"></i> 4.9 / 5.0</small>
                    </div>
                  <div className='pe-2 ms-auto'>
                    <i className="bi bi-heart color-1 fw-bold" style={{ fontSize: '30px', color: 'black' }}></i>
                  </div>  

                  </div>
                  <span className="color-3 fw-bold small mb-1">ARTESANÍA</span>
                  <h1 className="display-6 color-1 fw-bold mb-3">Noguchi Inspired Desk</h1>
                  <p className="text-muted small">Fecha de publicación: 27/01/2026</p>
                  
                  <div className="my-4 py-3 border-top border-bottom">
                    <p className="m-0 text-muted">Precio:</p>
                    <h2 className="color-1 fw-bold m-0">$2,500.00 MXN</h2>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold color-1">Descripción detallada</h6>
                    <p className="color-2 small lh-base">
                      Esta mesa de escritorio, inspirada en las formas orgánicas de Isamu Noguchi, 
                      es una pieza maestra de ebanistería moderna construida con maderas finas y acabados artesanales.
                    </p>
                  </div>

                  <Button className="btn-2" onClick={() => setMostrarPago(true)}>
                    <i className="bi bi-arrow-up-right me-2"></i> COMPRAR AHORA
                  </Button>
                </>
              ) : (
                <div className="d-flex flex-column h-100">
                  <h2 className="fw-bold color-1 mb-4">Finalizar Compra</h2>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="m-0 color-1 fw-bold small">Noguchi Inspired Desk</h5>
                    <Badge bg="success" className="bg-opacity-10 text-success border border-success">COMPRA DIRECTA</Badge>
                  </div>

                  <div className="my-4 py-3 border-top border-bottom">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Subtotal</span>
                      <span className="fw-bold color-1">$2,500.00 MXN</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Envío estimado</span>
                      <span className="fw-bold color-1">$20.00 MXN</span>
                    </div>
                    <hr className="my-3" />
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="fw-bold color-1 m-0">Total</h4>
                      <h4 className="fw-bold color-1 m-0">$2,520.00 MXN</h4>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold color-1 mb-3">Método de Pago</h6>
                    <div className="border rounded-4 p-3 d-flex align-items-center bg-light">
                      <div className="bg-white border rounded p-2 me-3" style={{fontSize: '20px'}}>
                        <img src="../src/assets/img/hand.png" alt="Visa" style={{ height: '40px', width: 'auto' }} />
                      </div>
                      <div>
                        <p className="m-0 small fw-bold color-1">Visa **** 4242</p>
                        <small className="text-muted">Vence: 12/26</small>
                      </div>
                      <Form.Check type="radio" className="ms-auto" defaultChecked name="metodoPago" />
                    </div>
                    <small className="text-muted mt-2 d-block px-1" style={{fontSize: '11px'}}>
                      Tu pago se procesará de forma segura.
                    </small>
                  </div>

                  <Button className="btn-2">
                    CONFIRMAR Y PAGAR
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VistaArticulo;