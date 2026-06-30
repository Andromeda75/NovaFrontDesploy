import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from 'react-router-dom';
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { transaccionesService } from '../../services/transaccionesService';
DataTable.use(DT);

export default function TicketsPanel() {
  const [movimientos, setMovimientos] = useState([]);
  const [saldoTickets, setSaldoTickets] = useState(0);
  const [ultimoMovimiento, setUltimoMovimiento] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const saldoData = await transaccionesService.getSaldoTickets();
      setSaldoTickets(saldoData.saldo_tickets);

      const historial = await transaccionesService.getHistorialTickets();
      
      // Formatear como array de arrays para DataTable
      const movimientosFormateados = historial.map(mov => [
        mov.concepto,  // ACCIÓN
        mov.referencia_tipo?.toUpperCase() || 'TICKET',  // TIPO
        new Date(mov.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),  // FECHA
        mov.tickets  // COSTO
      ]);

      setMovimientos(movimientosFormateados);
      
      if (movimientosFormateados.length > 0) {
        setUltimoMovimiento(movimientosFormateados[0][2]);
      }
    } catch (error) {
      console.error('Error cargando datos de tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card
        className="border-0 shadow-sm p-3 mb-4"
        style={{ borderRadius: "16px", background: "#f7dfb8" }}
      >
        <Row className="align-items-center">
          <Col xs="auto">
            <div
              className="d-flex justify-content-center align-items-center bg-white"
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "12px"
              }}
            >
              <i className="bi bi-ticket-perforated fs-3 color-2"></i>
            </div>
          </Col>

          <Col>
            <h4 className="fw-bold mb-1 color-2">
              {saldoTickets} Tickets disponibles
            </h4>
            <small className="text-dark text-muted fw-bold">
              Último movimiento: {ultimoMovimiento || 'Sin movimientos'}
            </small>
          </Col>

          <Col xs="auto">
            <Button
              as={Link}
              to="/tickets"
              size="lg" 
              className="px-4 fw-bold shadow-sm"  
              style={{
                backgroundColor: "#6B2E00",
                border: "none",
                borderRadius: "10px",
              }}>
              Recargar
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        
        <DataTable 
          data={movimientos}
          options={{
            paging: true,
            searching: true,
            ordering: true,
            info: true,
            language: {
              url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json"
            },
            
            columnDefs: [
              { targets: '_all', className: 'text-center' },
              { targets: [0], orderable: true },
              {
                targets: 3, // Columna COSTO
                render: function(data) {
                  const color = data < 0 ? '#C50003' : '#198754';
                  const signo = data > 0 ? '+' : '';
                  return `<span style="color: ${color}; font-weight: bold;">${signo}${data}</span>`;
                }
              },
              {
                targets: 1, // Columna TIPO
                render: function(data) {
                  return `<span class="px-3 py-1 fw-bold" style="background-color: #D5FFB4; border-radius: 30px; font-size: 12px; color: #1F7627">${data}</span>`;
                }
              }
            ]
          }}
        >
          <thead style={{ backgroundColor: "#f7dfb8" }}>
            <tr>
              <th className="text-center">ACCIÓN</th>
              <th className="text-center">TIPO</th>
              <th className="text-center">FECHA</th>
              <th className="text-center">COSTO</th>
            </tr>
          </thead>
        </DataTable>
      </Card>
    </Container>
  );
}