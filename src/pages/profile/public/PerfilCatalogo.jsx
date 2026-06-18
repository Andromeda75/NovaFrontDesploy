import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, InputGroup, Card, Badge } from 'react-bootstrap';
import { Link } from "react-router-dom";

import principal from '../../../assets/img/illustrations/publico/image.png';
import segundo from '../../../assets/img/illustrations/publico/imagen2.png';
import tercero from '../../../assets/img/illustrations/publico/imagen3.png';
import cuarto from '../../../assets/img/illustrations/publico/imagen4.png';


const VistaArticulo = () => {
  const [mostrarPago, setMostrarPago] = useState(false);
  return (
    <div className="bg-color-white d-flex flex-column">
      <Container fluid="xxl" className="my-4 flex-grow-1 px-lg-5">
        <Link className="btn  text-decoration-none color-2 p-0 mb-3 fw-bold" to="/profile/public"><i className="bi bi-arrow-left me-2"></i>
          Volver al producto
        </Link>
        <Row className="g-4">
          <Col lg={7}>
            <div className="bg-color-5 rounded-4 mb-3 d-flex align-items-center justify-content-center shadow-sm" style={{ minHeight: '550px', overflow: 'hidden', backgroundImage: `url(${principal})`, backgroundSize: 'cover', backgroundPosition: 'center',  backgroundRepeat: 'no-repeat' }}>
            </div>
            <Row className="g-2">
              <Col xs={4}><div className="bg-color-5 rounded-3 shadow-sm" style={{ height: '140px', backgroundImage: `url(${segundo})`, backgroundSize: 'cover', backgroundPosition: 'center',  backgroundRepeat: 'no-repeat'}}></div></Col>
              <Col xs={4}><div className="bg-color-5 rounded-3 shadow-sm" style={{ height: '140px', backgroundImage: `url(${tercero})`, backgroundSize: 'cover', backgroundPosition: 'center',  backgroundRepeat: 'no-repeat' }}></div></Col>
              <Col xs={4}><div className="bg-color-5 rounded-3 shadow-sm" style={{ height: '140px', backgroundImage: `url(${cuarto})`, backgroundSize: 'cover', backgroundPosition: 'center',  backgroundRepeat: 'no-repeat' }}></div></Col>
            </Row>
          </Col>
          <Col lg={5}>
            <Card className="shadow-sm rounded-5 p-4 ">
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
                <span className="color-3 fw-bold small mb-1">ARTE VISUAL</span>
                <h1 className="display-6 color-1 fw-bold mb-3">Pinturas al Oleo</h1>
                <p className="text-muted small">Fecha de publicación: 27/01/2026</p>

                <div className="mb-4">
                    <h6 className="fw-bold color-1">Descripción detallada</h6>
                    <p className="color-2 small lh-base">
                        Pintura de oleo de un paisaje caracteristica de playa con un belero.
                    </p>
                </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VistaArticulo;