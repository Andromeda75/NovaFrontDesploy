import { useState, useEffect } from 'react';
import { Container, Card } from "react-bootstrap";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { transaccionesService } from '../../services/transaccionesService';
DataTable.use(DT);

export default function HistoryPanel({ filtro }) {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [filtro]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      let rawData = [];
      if (filtro === "Compras") {
        rawData = await transaccionesService.getCompras();
      } else if (filtro === "Ventas") {
        rawData = await transaccionesService.getVentas();
      }

      if (!Array.isArray(rawData)) {
        console.error('La respuesta no es un array:', rawData);
        setTableData([]);
        return;
      }

      // Transformar a array de arrays con EXACTAMENTE 7 columnas
      const formattedData = rawData.map(item => [
        `#${item.id || ''}`,                              // Columna 0: TRANSACCIÓN
        item.titulo || 'Sin título',                       // Columna 1: TÍTULO
        item.tipo || 'Otro',                               // Columna 2: TIPO
        item.fecha || 'Fecha no disponible',               // Columna 3: FECHA
        filtro === "Compras" 
          ? (item.metodoPago || 'No registrado')
          : (item.comprador || 'Anónimo'),                  // Columna 4: MÉTODO PAGO / COMPRADOR
        item.estado || 'Desconocido',                      // Columna 5: ESTADO
        item.precio ? `$${item.precio}` : '$0'             // Columna 6: COSTO
      ]);

      setTableData(formattedData);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('Error al cargar los datos');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Definir títulos de columnas según el filtro (SIEMPRE 7 columnas)
  const getColumnTitles = () => {
    const baseTitles = ["TRANSACCIÓN", "TÍTULO", "TIPO", "FECHA"];
    
    if (filtro === "Compras") {
      return [...baseTitles, "MÉTODO DE PAGO", "ESTADO", "COSTO"];
    } else {
      return [...baseTitles, "COMPRADOR", "ESTADO", "COSTO"];
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

  if (error) {
    return (
      <Container className="py-4 text-center">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={cargarDatos}>Reintentar</button>
      </Container>
    );
  }

  if (tableData.length === 0) {
    return (
      <Container className="py-4 text-center">
        <p className="text-muted">No hay {filtro.toLowerCase()} registradas</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm overflow-hidden">
        {/* key={filtro} fuerza la recreación completa de la tabla al cambiar de pestaña */}
        <DataTable
          key={filtro}
          data={tableData}
          options={{
            paging: true,
            searching: true,
            ordering: true,
            info: true,
            responsive: true,
            language: {
              url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json"
            },
            columnDefs: [
              // Centrar todas las columnas
              { targets: '_all', className: 'text-center' },
              // Columna de TIPO (índice 2)
              {
                targets: 2,
                render: function(data) {
                  return `<span class="px-3 py-1 fw-bold" style="background-color: #D5FFB4; border-radius: 30px; font-size: 12px; color: #1F7627">${data}</span>`;
                }
              },
              // Columna de ESTADO (índice 5)
              {
                targets: 5,
                render: function(data) {
                  const isDelivered = data === "ENTREGADO" || data === "VENDIDO" || data === "COMPLETADO";
                  const color = isDelivered ? "#1F7627" : "#FF6F20";
                  return `<span><i class="bi bi-circle-fill me-2" style="color: ${color}"></i>${data}</span>`;
                }
              }
            ]
          }}
        >
          <thead style={{ backgroundColor: "#f6d8a8" }}>
            <tr>
              {getColumnTitles().map((title, index) => (
                <th key={index} className="text-center">{title}</th>
              ))}
            </tr>
          </thead>
        </DataTable>
      </Card>
    </Container>
  );
}