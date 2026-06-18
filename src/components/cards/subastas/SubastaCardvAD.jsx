import React from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';

function Vistas_s({ imagen }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
    <div className="p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
        <div className="bg-light rounded-circle" style={{ width: '35px', height: '35px', display: 'grid', placeItems: 'center' }}>
            <i className="bi bi-person text-muted"></i>
        </div>
        <small className="fw-bold color-1">Marco T.</small>
        <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success" style={{ fontSize: '10px' }}>ACTIVA</span>
        </div>
        <i className="bi bi-heart text-danger fs-5 cursor-pointer color-2"></i>
    </div>
    <div className="bg-secondary bg-opacity-10 position-relative" style={{ 
          height: '200px',
          backgroundImage: `url(${imagen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="position-absolute bottom-0 start-0 m-3 text-white px-3 py-1 rounded-pill small" style={{ backgroundColor: '#632c00', fontSize: '0.75rem' }}>
            <i className="bi bi-clock me-1"></i>
            <span className=" ms-1 me-1">00d:12h:51m</span>
            <span className="fz-15 ms-1 "style={{ color: '#ffffffa7' }}>Restante</span>
        </div>
    </div>
    <div className="card-body">
        <div className="d-flex justify-content-between mb-1">
        <small className="color-3 fw-bold">ARTE DIGITAL</small>
        <small className="text-muted"><i className="bi bi-people me-1"></i>12 pujas</small>
        </div>
        <h5 className="fw-bold color-1">Cara traslucidas doradas</h5>
        <div className="row mt-3 pt-3 border-top g-0 align-items-center">
        <div className="col-6">
            <small className="text-muted d-block" style={{ fontSize: '10px' }}>PUJA ACTUAL</small>
            <span className="fw-bold color-2">$2,500.00 MXN</span>
        </div>
        <div className="col-6 text-end">
            <small className="text-muted d-block" style={{ fontSize: '10px' }}>COSTO PUJA</small>
            <span className="badge rounded-pill border border-warning color-1 px-3 py-2" style={{ backgroundColor: '#f0e6d2' }}>
            <i className="bi bi-ticket-perforated me-1"></i> 6
            </span>
        </div>
        <div className="col-12 d-flex justify-content-start text-end">
            <small className=" text-muted d-block fz-15 me-1" >Puja Mínima:</small>
             <small className=" text-muted d-block color-2 fz-15 ms-1"> $500.00MX</small>
        </div>
        
        </div>
    </div>
    </div>
  );
}

export default Vistas_s;
      
      
      
      
