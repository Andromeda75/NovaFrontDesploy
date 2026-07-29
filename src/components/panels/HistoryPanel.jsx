import { useState, useEffect } from 'react';
import { Container, Card } from "react-bootstrap";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { transaccionesService } from '../../services/transaccionesService';
DataTable.use(DT);

function formatearPrecio(precio) {
  if (precio == null) return '';

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(precio);
}

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

      // console.log(rawData);

      if (!Array.isArray(rawData)) {
        console.error('La respuesta no es un array:', rawData);
        setTableData([]);
        return;
      }

      // Transformar a array de arrays con EXACTAMENTE 7 columnas
      const formattedData = rawData.map(item => {
        const fila = [
          `#${item.id || ''}`,
          item.titulo || 'Sin título',
        ];

        if (filtro === "Ventas") {
          fila.push(item.comprador || "Anónimo");
        }

        fila.push(
          item.fecha || "Fecha no disponible",
          item.precio ? `${formatearPrecio(item.precio)}` : "$0",
          item.estado || "Desconocido"
        );

        return fila;
      });

      setTableData(formattedData);
      // console.log(setTableData);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('Error al cargar los datos');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Definir títulos de columnas según el filtro (SIEMPRE 5 columnas)
  const getColumnTitles = () => {
    const baseTitles = ["TRANSACCIÓN", "PRODUCTO"];
      
      if (filtro === "Ventas") {
        return [...baseTitles, "COMPRADOR", "FECHA", "MONTO", "ESTADO"];
      } else {
        return [...baseTitles, "FECHA", "MONTO", "ESTADO"];
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

  // console.log(tableData.length);
  // console.table(tableData);
  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm overflow-hidden">
        {/* key={filtro} fuerza la recreación completa de la tabla al cambiar de pestaña */}
        <DataTable
          // key={filtro}
          data={tableData}
          options={{
            paging: true,
            searching: true,
            ordering: true,
            info: true,
            responsive: true,
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
              { orderable: false, targets: filtro === "Compras" ? 4 : 5 || [] },
              { searchable: false, targets: filtro === "Compras" ? 4 : 5 || [] },
              // Centrar todas las columnas
              { targets: '_all', className: 'text-center' },
              // Columna de TIPO (índice 2)
              {
                targets: filtro === "Compras" ? 2 : 3,
                render: function(data) {
                  return `<span class="px-3 py-1 fw-bold" style="background-color: #D5FFB4; border-radius: 30px; font-size: 12px; color: #1F7627">${data}</span>`;
                }
              },
              // Columna de ESTADO (índice 5)
              {
                targets: filtro === "Compras" ? 4 : 5,
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