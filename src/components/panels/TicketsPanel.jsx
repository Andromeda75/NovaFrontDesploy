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
  const [ultimaRecarga, setUltimaRecarga] = useState(null);
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
        new Date(mov.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),  // FECHA
        mov.concepto,  // ACCIÓN
        mov.tickets  // COSTO
      ]);

      setMovimientos(movimientosFormateados);
      
      if (movimientosFormateados.length > 0) {
        setUltimoMovimiento(movimientosFormateados[0][0]);
      }

      const recarga = await transaccionesService.getUltimaRecarga();
      setUltimaRecarga(recarga);

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
      <Row className="align-items-start justify-content-between mb-4">
        <Col lg={8} md={8}>
          <Card
            className="border-0 shadow-sm p-3 mb-4 bg-color-2"
            style={{
              borderRadius: "16px",
              maxWidth: "700px",
              width: "100%",
            }}
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
                <h3 className="mb-1 text-white fw-bold">
                  Disponibles: {saldoTickets}
                </h3>
                <small className="text-white">
                  Último movimiento: {ultimoMovimiento || 'Sin movimientos'}
                </small>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col
          lg="auto"
          md="auto"
          className="d-flex flex-column align-items-center"
        >
          <Button
            as={Link}
            to="/tickets"
            size="lg"
            className="fw-bold shadow-sm px-5 bg-color-2"
            style={{
              border: "none",
              borderRadius: "10px",
              minWidth: "180px",
            }}
          >
            Recargar
          </Button>

          <small className="mt-2 fw-semibold text-secondary">
            Recargaste: {ultimaRecarga?.tickets ?? 0} tickets
          </small>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm overflow-hidden">
        
        <DataTable 
          data={movimientos}
          options={{
            paging: true,
            searching: true,
            ordering: true,
            info: true,
            language: {     
                lengthMenu: "Mostrar _MENU_ registros por página", 
                zeroRecords: "Ningún registro coincide con tu búsqueda",
                info: "Mostrando del _START_ al _END_ de un total de _TOTAL_ registros", 
                infoEmpty: "Ningún registro encontrado",
                infoFiltered: "(filtrados desde _MAX_ registros totales)",
                search: "Buscar:",
                loadingRecords: "Cargando...",
                paginate: {
                    first: "<i class='bi bi-chevron-double-left'></i>",
                    last: "<i class='bi bi-chevron-double-right'></i>", 
                    next: "<i class='bi bi-chevron-right'></i>", 
                    previous: "<i class='bi bi-chevron-left'></i>"
                },
            },
            columnDefs: [
              { targets: '_all', className: 'text-center' },
              { targets: [0], orderable: true },
              {
                targets: 2, // Columna COSTO
                render: function(data) {
                  const color = data < 0 ? '#C50003' : '#198754';
                  const signo = data > 0 ? '+' : '';
                  return `<span style="color: ${color}; font-weight: bold;">${signo}${data}</span>`;
                }
              }
            ]
          }}
        >
          <thead style={{ backgroundColor: "#f7dfb8" }}>
            <tr>
              <th className="text-center">FECHA</th>
              <th className="text-center">ACCIÓN</th>             
              <th className="text-center">CANTIDAD</th>
            </tr>
          </thead>
        </DataTable>
      </Card>
    </Container>
  );
}