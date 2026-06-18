import React from 'react';
import { Container, Row, Col, Button, Card, Form, InputGroup } from 'react-bootstrap';
import { useState } from "react";
import { Link } from 'react-router-dom';
import TicketsPanel from '../../../components/panels/TicketsPanel.jsx';
import HistoryPanel from '../../../components/panels/HistoryPanel.jsx';

function Historial() {
  const [filtro, setFiltro] = useState('Compras');

  return (
    <div className="container-fluid p-0">
      <div className="mb-2">
        <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Historial</h1>
        <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}>Registro completo de tus transacciones y uso de tickets.</p>
      </div>

      <div className="mb-0">
        <div className="d-flex align-items-center mb-4">
          <div className="p-1 rounded-pill d-flex gap-2 shadow-sm" style={{ backgroundColor: '#f6d8a8', width: 'fit-content' }}>
            <button 
              onClick={() => setFiltro('Compras')}
              className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Compras' ? 'bg-white shadow-sm fw-bold color-2' : 'opacity-75'}`}>
              Compras
            </button>
            <button 
              onClick={() => setFiltro('Ventas')}
              className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Ventas' ? 'bg-white shadow-sm fw-bold color-2' : 'opacity-75'}`}>
              Ventas
            </button>
            <button 
              onClick={() => setFiltro('Tickets')}
              className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Tickets' ? 'bg-white shadow-sm fw-bold color-2' : 'opacity-75'}`}>
              Tickets
            </button>
          </div>
        </div>
        
        <div className="row g-4">
          {(filtro === 'Compras' || filtro === 'Ventas') && (
            <div className="col-12 d-flex animate__animated animate__fadeIn">
              <HistoryPanel filtro={filtro} />
            </div>
          )}
          {filtro === 'Tickets' && (
            <div className="col-12 d-flex animate__animated animate__fadeIn">
              <TicketsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Historial;