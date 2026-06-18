import { useState } from "react";

export default function PoliticasModal({ 
    tituloPolitica,
    setTituloPolitica,
    handleGuardarPolitica,
    handleClosePolitica,
    brand 
}) {
    return (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={handleClosePolitica}
        >
          <div 
            className="card border-0 shadow-lg p-4 animate__animated animate__zoomIn" 
            style={{ width: '100%', maxWidth: '500px', borderRadius: '20px', backgroundColor: '#f5f5f5' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-end">
              <button onClick={handleClosePolitica} className="btn border-0 p-0 text-secondary opacity-50 fs-3">
                <i className="bi bi-x-circle-fill"></i>
              </button>
            </div>

            <div className="px-3 pb-3">
              <h2 className="text-center fw-bold mb-4" style={{ color: '#555' }}>
                Editar Política
              </h2>
              
              <label className="fw-bold mb-2 d-block" style={{ color: '#555', fontSize: '1.2rem' }}>Nombre</label>
              <div className="d-flex align-items-center gap-3">
                <input 
                  type="text" 
                  className="form-control form-control-lg border-secondary-subtle flex-grow-1" 
                  style={{ borderRadius: '12px' }}
                  value={tituloPolitica}
                  onChange={(e) => setTituloPolitica(e.target.value)}
                  placeholder="Ej: Políticas"
                />
                <button 
                  onClick={handleGuardarPolitica}
                  className="btn btn-lg text-white px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
                  style={{ backgroundColor: brand.accentOrange, borderRadius: '12px' }}
                >
                  <i className="bi bi-check2-circle"></i> 
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
    )
}