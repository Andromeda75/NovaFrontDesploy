import { Container, Card } from "react-bootstrap";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { useState, useEffect } from "react";
import { operacionesService } from "../../services/operacionesService";

DataTable.use(DT);

export default function OperacionesPanel({ filtro }) {
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarTransacciones();
    }, [filtro]);

    const cargarTransacciones = async () => {
        setLoading(true);
        setError('');
        try {
            let data;
            // Si hay un filtro específico (Subastas, Articulos, o Encargos), usar getTransaccionesPorTipo
            if (filtro && (filtro === 'Subastas' || filtro === 'Articulos' || filtro === 'Encargos')) {
                data = await operacionesService.getTransaccionesPorTipo(filtro);
            } else {
                data = await operacionesService.getTransacciones();
            }
            setTransacciones(data);
        } catch (err) {
            console.error('Error cargando transacciones:', err);
            setError('Error al cargar las transacciones');
        } finally {
            setLoading(false);
        }
    };

    // Definir columnas para DataTable (importante para evitar el error)
    const columns = [
        { data: "id", title: "TRANSACCIÓN", className: "text-center fw-semibold" },
        { data: "titulo", title: "TÍTULO", className: "text-center" },
        { 
            data: "tipo", 
            title: "TIPO", 
            className: "text-center",
            render: (data) => {
                let bgColor, textColor;
                if (data === 'SUBASTA') {
                    bgColor = "#D5FFB4";
                    textColor = "#1F7627";
                } else if (data === 'ARTICULO') {
                    bgColor = "#FFE4B4";
                    textColor = "#B45F00";
                } else {
                    bgColor = "#B4D5FF";
                    textColor = "#0044B4";
                }
                return `<span class="px-3 py-1 fw-bold" style="background-color: ${bgColor}; border-radius: 30px; font-size: 12px; color: ${textColor}">${data}</span>`;
            }
        },
        { data: "comprador", title: "COMPRADOR", className: "text-center" },
        { data: "vendedor", title: "VENDEDOR", className: "text-center" },
        { data: "fecha", title: "FECHA", className: "text-center" },
        { data: "monto", title: "MONTO", className: "text-center fw-semibold" }
    ];

    if (loading) {
        return (
            <Container className="py-3 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-3">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={cargarTransacciones}>Reintentar</button>
            </Container>
        );
    }

    return (
        <Container className="py-3">
            <Card className="border-0 shadow-sm overflow-hidden">
                <DataTable 
                    data={transacciones}
                    columns={columns}
                    responsive 
                    className="mb-0 align-middle display"
                    options={{
                        paging: true,
                        searching: true,
                        ordering: true,
                        info: true,
                        language: {
                            url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json"
                        }
                    }}
                />
            </Card>
        </Container>
    );
}