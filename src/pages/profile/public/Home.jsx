  import React from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';

function Home() {
  return (
  <div>
    <h3 className="fw-bold color-1 mb-0">Bienvenido de nuevo</h3>
    <p className="text-muted small mb-4">Aquí puedes ver un resumen de tu actividad en NovaCreations.</p>
    <div className="card border-0 shadow-sm p-4 bg-color-4" style={{ borderRadius: '15px' }}>
      <h5 className="fw-bold color-1">¡Hola, Ameli!</h5>
      <p className="small mb-0">Tienes 3 subastas por finalizar y 2 mensajes nuevos.</p>
    </div>
  </div>
  );
}

export default Home;
      
      
      
      

