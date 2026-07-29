import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import terminosPDF from '../../assets/NovaCreations_Terminos_y_Privacidad.pdf';
import logoNova from '../../assets/img/logos/LogoSecundario.png';

const TerminosModal = ({ show, onAccept, loading }) => {
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  useEffect(() => {
    if (show) {
      setTerminosAceptados(false);
    }
  }, [show]);

  const handleAccept = () => {
    if (terminosAceptados) {
      onAccept();
    }
  };

  return (
    <Modal
      show={show}
      backdrop="static"
      keyboard={false}
      centered
      dialogClassName="modal-lg"
      contentClassName="border-0 shadow-lg"
      style={{ borderRadius: '25px', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      {/* HEADER */}
      <div 
        className="p-4 text-center text-white position-relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #2a140a 0%, #6b3a1f 50%, #8d4925 100%)',
          borderRadius: '5px 5px 0 0'
        }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
          <div className="position-absolute top-50 start-50 translate-middle">
            <i className="bi bi-shield-check" style={{ fontSize: '12rem', opacity: 0.05 }}></i>
          </div>
        </div>
        <div className="position-relative" style={{ zIndex: 1 }}>
          {/* 👇 LOGO CON FONDO BLANCO Y CIRCULAR - PERFECTAMENTE CENTRADO */}
          <div 
            className="d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ 
              width: '100px', 
              height: '100px', 
              backgroundColor: 'white',
              borderRadius: '50%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src={logoNova} 
              alt="Nova Creations" 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '24px' }}>Bienvenido a NovaCreations</h2>
          <p className="mb-0 small opacity-75" style={{ fontSize: '13px' }}>
            Tu plataforma de arte y creatividad
          </p>
        </div>
      </div>

      {/* BODY */}
      <Modal.Body className="p-4 bg-white" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {/* Mensaje de bienvenida */}
        <div className="text-center mb-4">
           <p className="text-muted" style={{ fontSize: '15px', lineHeight: '1.7' }}>
            Antes de comenzar, te pedimos leer y aceptar
            nuestros <strong className="color-2">Términos y Condiciones</strong>, así como el
            <strong className="color-2"> Aviso de Privacidad</strong>.
          </p>
          <p className="text-muted small" style={{ fontSize: '13px', lineHeight: '1.6' }}>
            Al continuar, confirmas que comprendes las políticas de publicación,
            propiedad intelectual y el uso responsable de la plataforma.
          </p>
        </div>

        {/* Separador decorativo */}
        <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
          <div className="flex-grow-1" style={{ height: '1px', background: 'linear-gradient(to right, transparent, #8d4925)' }}></div>
          <i className="bi bi-shield-check text-muted opacity-50"></i>
          <div className="flex-grow-1" style={{ height: '1px', background: 'linear-gradient(to left, transparent, #8d4925)' }}></div>
        </div>

        {/* Tarjetas de información */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="border rounded-4 p-3 h-100" style={{ backgroundColor: '#faf7f3', borderColor: '#e8ddd0' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: '#8d4925', color: 'white' }}>
                  <i className="bi bi-building fs-6"></i>
                </div>
                <h6 className="fw-bold color-1 mb-0" style={{ fontSize: '13px' }}>¿Qué es NovaCreations?</h6>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>
                Plataforma de compra y venta de arte donde artistas publican sus obras y coleccionistas las adquieren de forma segura.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-4 p-3 h-100" style={{ backgroundColor: '#faf7f3', borderColor: '#e8ddd0' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: '#8d4925', color: 'white' }}>
                  <i className="bi bi-search fs-6"></i>
                </div>
                <h6 className="fw-bold color-1 mb-0" style={{ fontSize: '13px' }}>¿Cómo funciona?</h6>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>
                Publica con fotos y video. Un equipo de curadores revisa cada obra. Una vez aprobada, estará disponible para la venta.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-4 p-3 h-100" style={{ backgroundColor: '#faf7f3', borderColor: '#e8ddd0' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: '#8d4925', color: 'white' }}>
                  <i className="bi bi-percent fs-6"></i>
                </div>
                <h6 className="fw-bold color-1 mb-0" style={{ fontSize: '13px' }}>Comisiones</h6>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>
                Nova Creations cobra una comisión del <strong className="color-2">10%</strong> sobre cada venta realizada a través de la plataforma.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-4 p-3 h-100" style={{ backgroundColor: '#faf7f3', borderColor: '#e8ddd0' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: '#8d4925', color: 'white' }}>
                  <i className="bi bi-shield-lock fs-6"></i>
                </div>
                <h6 className="fw-bold color-1 mb-0" style={{ fontSize: '13px' }}>Seguridad</h6>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>
                Todas las transacciones son seguras y protegidas. Los pagos se procesan a través de métodos de pago verificados.
              </p>
            </div>
          </div>
        </div>

        {/* Checkbox de aceptación */}
        <div className="form-check mb-0 mt-3">
          <input
            className="form-check-input border-2"
            type="checkbox"
            id="terminosModal"
            checked={terminosAceptados}
            onChange={(e) => setTerminosAceptados(e.target.checked)}
            style={{ 
              cursor: 'pointer',
              width: '18px',
              height: '18px',
              borderColor: '#8d4925',
              marginTop: '4px'
            }}
          />
           <label className="form-check-label small fw-bold color-2" htmlFor="terminosModal" style={{ fontSize: '13px' }}>
            Acepto los <a href={terminosPDF} target="_blank" rel="noopener noreferrer" className="text-decoration-underline fw-bold" style={{ color: '#8d4925' }}>
              Términos y Condiciones
            </a> y el <a href={terminosPDF} target="_blank" rel="noopener noreferrer" className="text-decoration-underline fw-bold" style={{ color: '#8d4925' }}>
              Aviso de Privacidad
            </a> de Nova Creations
            <span className="text-danger"> *</span>
          </label>
        </div>

        {/* Mensaje de advertencia si no acepta */}
        {!terminosAceptados && (
          <div className="mt-3 small text-muted d-flex align-items-center gap-2">
            <i className="bi bi-info-circle text-warning"></i>
            <span style={{ fontSize: '12px' }}>Debes aceptar los términos para continuar</span>
          </div>
        )}
      </Modal.Body>

      {/* FOOTER */}
      <div className="modal-footer border-0 p-3 bg-white" style={{ borderRadius: '0 0 25px 25px' }}>
        <div className="w-100 d-flex flex-column gap-2">
          <button
            className="btn-2 w-100 py-3 fw-bold"
            onClick={handleAccept}
            disabled={!terminosAceptados || loading}
            style={{
              borderRadius: "30px",
              border: "none",
              color: "white",
              fontSize: "15px",
              opacity: terminosAceptados && !loading ? 1 : 0.5,
              cursor: terminosAceptados && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Aceptar y continuar
              </>
            )}
          </button>
          <p className="text-center text-muted small mb-0" style={{ fontSize: '11px' }}>
            <i className="bi bi-lock me-1"></i>
            Tus datos están seguros
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default TerminosModal;