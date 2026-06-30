import React from 'react';

function PujaRealizada({ cerrar }) {
  return (
    <div className="modal d-flex align-items-center justify-content-center shadow" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1050 }}>
      <div className="card border-0 shadow-lg" style={{ width: '90%', maxWidth: '500px', borderRadius: '25px', overflow: 'hidden' }}>
        <div className="text-end p-3 pb-0">
          <button type="button" className="btn-close" onClick={cerrar}></button>
        </div>
        <div className="card-body p-4 pt-0">
          <div className="d-flex align-items-center gap-3 mb-3 border-bottom pb-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-sm bg-color-1" style={{  width: '40px', height: '40px', flexShrink: 0 }}>
              <i className="bi bi-check-lg fs-4"></i>
            </div>
            <h3 className="fw-bold m-0 color-1">
              Puja realizada con éxito
            </h3>
          </div>
          <div className="py-2">
            <p className="fw-bold ms-3 mb-0 text-start color-2">
                Se han descontado 6 tickets de tu cuenta.
            </p>
          </div>
          <div className="border-top mt-2 mb-4 pt-3">
          </div>
        </div>
      </div>
    </div>
  );
}

export default PujaRealizada;