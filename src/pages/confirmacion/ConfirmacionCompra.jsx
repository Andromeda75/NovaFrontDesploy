import React from 'react';
import Navbar from '../navbaryfooter/navbar.jsx';
import Footer from '../navbaryfooter/footer.jsx';

const ConfirmacionCompra = () => {
  return (
    <>
      <Navbar />
      
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-center">
                <h1 className="fw-bold color-1 mb-3 display-5">¡Gracias por tu compra!</h1>
                <p className="color-4 fw-bold mb-5 fz-20">
                  Tu pedido #ART-99281 ha sido confirmado y está siendo preparado por el artista.
                </p>
                <div className="d-flex align-items-center justify-content-center gap-3 mb-5 text-start mx-auto" style={{ maxWidth: '400px' }}>
                  <div className="rounded-3 p-3 d-flex align-items-center justify-content-center shadow-sm bg-color-4" style={{ width: '100px', height: '100px' }}>
                    <i className="bi bi-image text-muted fs-1"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold color-1 m-0">Vase Blue Indigo</h4>
                    <p className="text-muted m-0 fs-5">Precio: $850 MXN</p>
                  </div>
                </div>
                <div className="row justify-content-center mb-5">
                  <div className="col-md-8 text-start border-top pt-4">
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted fs-5">Dirección de envío:</span>
                      <span className="fw-bold color-1 fs-5 text-end">Calle 79 #470 A col centro</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted fs-5">Fecha estimada:</span>
                      <span className="fw-bold color-1 fs-5 text-end">5-7 de Febrero</span>
                    </div>
                  </div>
                </div>
                <div className="d-grid gap-2 col-md-5 mx-auto">
                  <button className="btn py-3 fw-bold shadow-sm bg-color-1 color-white">
                    Volver al Home
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ConfirmacionCompra;