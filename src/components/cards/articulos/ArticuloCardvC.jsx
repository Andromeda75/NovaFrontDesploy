import React from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';


function Vistas_n({ imagen }) {
  return (
<div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
    <div className="p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
        <div className="bg-light rounded-circle" style={{ width: '35px', height: '35px', display: 'grid', placeItems: 'center' }}>
            <i className="bi bi-person text-muted"></i>
        </div>
        <small className="fw-bold color-1">Alejandra Garcia</small>
        </div>
        <i className="bi bi-heart text-muted fs-5 cursor-pointer color-2"></i>
    </div>
    <div className="bg-secondary bg-opacity-10" style={{ 
          height: '200px',
          backgroundImage: `url(${imagen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
    </div>
    <div className="card-body">
        <small className="color-3 fw-bold d-block mb-1">COLECCIONABLES</small>
        <h5 className="fw-bold color-1">Star wars Muñecos Collecionables</h5>
        <div className="row mt-4 pt-2 border-top">
        <div className="col-7">
            <small className="text-muted d-block" style={{ fontSize: '10px' }}>FECHA PUBLICACIÓN</small>
            <span className="fw-bold color-1" style={{ fontSize: '0.9rem' }}>30/01/2026</span>
        </div>
        <div className="col-5 text-end">
            <small className="text-muted d-block" style={{ fontSize: '10px' }}>PRECIO</small>
            <span className="fw-bold color-2" style={{ fontSize: '0.9rem' }}>$1,100.00 MXN</span>
        </div>
        </div>
    </div>
</div>
  );
}

export default Vistas_n;
      
      
      
      
