import React from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';

function Footer() {
  return (
    <>
    <footer className="container-fluid bg-white border-top py-5 px-3 px-lg-5">
      <div className="row g-4 justify-content-between">
        <div className="col-12 col-md-5 col-lg-4 text-start">
          <div className="d-flex align-items-center mb-3">
            {/* ✅ RUTA ABSOLUTA - CORREGIDA */}
            <img 
              src="/img/logos/LogoSecundario.png" 
              alt="Logo" 
              className='col-2' 
              style={{ width: "100px" }}
            />
          </div>
          <p className="text-muted small fw-bold pe-md-4 color-3" style={{ lineHeight: '1.5' }}>
            La plataforma de subastas creativas donde el arte y la exclusividad se encuentran. 
            Seguridad, confianza y talento en cada puja.
          </p>
        </div>
        <div className="col-6 col-md-3 col-lg-2 text-start">
          <h6 className="fw-bold color-2 mb-3">Plataforma</h6>
          <ul className="list-unstyled small">
            <li className="mb-2"><a href="#" className="color-3">Sistema de tickets</a></li>
            <li className="mb-2"><a href="#" className="color-3">Términos y condiciones</a></li>
            <li className="mb-2"><a href="#" className="color-3">Seguridad</a></li>
          </ul>
        </div>

        <div className="col-6 col-md-4 col-lg-3 text-start">
          <h6 className="fw-bold color-2 mb-3">Contacto</h6>
          <ul className="list-unstyled small">
            <li className="mb-2 color-3">
              <i className="bi bi-telephone me-2 color-3"></i>+52 999 943 9905
            </li>
            <li className="mb-2 color-3">
              <i className="bi bi-envelope me-2 color-3"></i>novacreations@gmail.com
            </li>
            <li className="mb-2 color-3">
              <i className="bi bi-facebook me-2 color-3"></i>NovaCreations
            </li>
          </ul>
        </div>

      </div>
    </footer>
    <div className="border-top bg-white d-flex justify-content-center align-items-center text-center">
      <p className="text-muted small color-2 fw-bold m-0 py-4">
        &copy; 2026 NovaCreattions S.A. Todos los derechos reservados.
      </p>
    </div>
    </>
  );
}

export default Footer;