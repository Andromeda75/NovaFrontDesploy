import React from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navbarc() {
  return (
    <div className="row mb-4 g-4 text-center">
      {/* Arte Digital */}
      <div className="col-6 col-md-4 col-lg-4 col-xl-4 col-xxl-2">
        <Link to="/categoriaAD" className="text-decoration-none">
          <div className="card border-0 shadow-sm p-3 border-1-P d-flex flex-row align-items-center justify-content-center gap-1" style={{ borderBottom: '4px solid', borderRadius: '15px' }}>
            {/* ✅ RUTA ABSOLUTA */}
            <img src="/img/iconos/Tab.png" alt="Digital" style={{ height: '35px', objectFit: 'contain' }} />
            <span className="fw-bold color-2 fs-5 d-none d-md-inline">Arte Digital</span>
          </div>
        </Link>
      </div>

      {/* Arte Visual */}
      <div className="col-6 col-md-4 col-lg-4 col-xl-4 col-xxl-2">
        <Link to="/categoriaAV" className="text-decoration-none">
          <div className="card border-0 shadow-sm p-3 border-2-P d-flex flex-row align-items-center justify-content-center gap-1" style={{ borderBottom: '4px solid', borderRadius: '15px' }}>
            {/* ✅ RUTA ABSOLUTA */}
            <img src="/img/iconos/Art.png" alt="Visual" style={{ height: '35px', objectFit: 'contain' }} />
            <span className="fw-bold color-2 fs-5 d-none d-md-inline">Arte Visual</span>
          </div>
        </Link>
      </div>

      {/* Fotografía */}
      <div className="col-6 col-md-4 col-lg-4 col-xl-4 col-xxl-2">
        <Link to="/categoriaF" className="text-decoration-none">
          <div className="card border-0 shadow-sm p-3 border-3-P d-flex flex-row align-items-center justify-content-center gap-1" style={{ borderBottom: '4px solid', borderRadius: '15px' }}>
            {/* ✅ RUTA ABSOLUTA */}
            <img src="/img/iconos/Cam.png" alt="Fotografía" style={{ height: '35px', objectFit: 'contain' }} />
            <span className="fw-bold color-2 fs-5 d-none d-md-inline">Fotografía</span>
          </div>
        </Link>
      </div>

      {/* Escultura */}
      <div className="col-6 col-md-4 col-lg-4 col-xl-4 col-xxl-2">
        <Link to="/categoriaE" className="text-decoration-none">
          <div className="card border-0 shadow-sm p-3 border-4-P d-flex flex-row align-items-center justify-content-center gap-1" style={{ borderBottom: '4px solid', borderRadius: '15px' }}>
            {/* ✅ RUTA ABSOLUTA */}
            <img src="/img/iconos/Head.png" alt="Escultura" style={{ height: '35px', objectFit: 'contain' }} />
            <span className="fw-bold color-2 fs-5 d-none d-md-inline">Escultura</span>
          </div>
        </Link>
      </div>

      {/* Artesanía */}
      <div className="col-6 col-md-4 col-lg-4 col-xl-4 col-xxl-2">
        <Link to="/categoriaA" className="text-decoration-none">
          <div className="card border-0 shadow-sm p-3 border-5-P d-flex flex-row align-items-center justify-content-center gap-1" style={{ borderBottom: '4px solid', borderRadius: '15px' }}>
            {/* ✅ RUTA ABSOLUTA */}
            <img src="/img/iconos/Han.png" alt="Artesanía" style={{ height: '35px', objectFit: 'contain' }} />
            <span className="fw-bold color-2 fs-5 d-none d-md-inline">Artesanía</span>
          </div>
        </Link>
      </div>

      {/* Coleccionables */}
      <div className="col-6 col-md-4 col-lg-4 col-xl-4 col-xxl-2">
        <Link to="/categoriaC" className="text-decoration-none">
          <div className="card border-0 shadow-sm p-3 border-6-P d-flex flex-row align-items-center justify-content-center gap-1" style={{ borderBottom: '4px solid', borderRadius: '15px' }}>
            {/* ✅ RUTA ABSOLUTA */}
            <img src="/img/iconos/Cua.png" alt="Coleccionables" style={{ height: '35px', objectFit: 'contain' }} />
            <span className="fw-bold color-2 fs-5 d-none d-md-inline">Coleccionables</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Navbarc;