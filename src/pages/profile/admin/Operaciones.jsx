import React, { useState } from 'react';
import OperacionesPanel from "../../../components/panels/OperacionesPanel.jsx";

function Operaciones() {
    const [filtro, setFiltro] = useState('Subastas');

    return (
        <div className="animate__animated animate__fadeIn">
            <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Gestión Operativa</h1>
            <p className="text-muted mb-4 color-2" style={{ fontSize: '18px' }}>Supervisión de transacciones, entregas y cumplimiento.</p>
            
            {/* Filtros */}
            <div className="d-flex mb-4 p-1 rounded-pill shadow-sm" style={{ backgroundColor: '#f6d8a8', width: 'fit-content' }}>
                <button 
                    onClick={() => setFiltro('Subastas')}
                    className={`btn rounded-pill px-4 fw-bold small ${filtro === 'Subastas' ? 'bg-white shadow-sm' : ''}`}
                    style={{ color: '#8d4925' }}
                >
                    Subastas
                </button>
                <button 
                    onClick={() => setFiltro('Articulos')}
                    className={`btn rounded-pill px-4 fw-bold small ${filtro === 'Articulos' ? 'bg-white shadow-sm' : ''}`}
                    style={{ color: '#8d4925' }}
                >
                    Artículos
                </button>
                <button 
                    onClick={() => setFiltro('Encargos')}
                    className={`btn rounded-pill px-4 fw-bold small ${filtro === 'Encargos' ? 'bg-white shadow-sm' : ''}`}
                    style={{ color: '#8d4925' }}
                >
                    Encargos
                </button>
            </div>
            
            <h4 className="fw-bold color-2 mt-4">Control de Depósitos y Garantías</h4>
            <OperacionesPanel filtro={filtro} />
        </div>
    );
}

export default Operaciones;