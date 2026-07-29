import React from 'react';
import { Container, Row, Col, Button, Card, Form, InputGroup } from 'react-bootstrap';
import { useState } from "react";
import { Link } from 'react-router-dom';
import TicketsPanel from '../../../components/panels/TicketsPanel.jsx';

function Tickets() {

  return (
    <div className="container-fluid p-0">
      <div className="mb-2">
        <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Tickets</h1>
        <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}>Historial de recargas, consumos y saldo disponible de tus tickets.</p>
      </div>

     <div className="mb-0">
        <div className="row g-4">
          <div className="col-12 d-flex animate__animated animate__fadeIn">
            <TicketsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tickets;