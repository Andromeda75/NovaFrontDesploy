import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const MensajeModal = ({ show, onHide, title, message, type = 'success' }) => {
  const colors = {
    brownDark: '#4a2311',
    brownSecondary: '#8d4925',
    accentOrange: '#d4a373',
    sandLight: '#f2d9bb',
    grayDark: '#555555'
  };

  // Configuración según el tipo de mensaje
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="bi bi-check-circle-fill fs-1 mb-2"></i>;
      case 'error':
        return <i className="bi bi-x-circle-fill fs-1 mb-2"></i>;
      case 'warning':
        return <i className="bi bi-exclamation-triangle-fill fs-1 mb-2"></i>;
      case 'info':
        return <i className="bi bi-info-circle-fill fs-1 mb-2"></i>;
      default:
        return <i className="bi bi-check-circle-fill fs-1 mb-2"></i>;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-info';
      default:
        return 'text-success';
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
      <div className="modal-content border-0 shadow-lg" style={{ overflow: 'hidden' }}>
        {/* Cabecera con gradiente */}
        <div className="p-4 text-center text-white" style={{ background: 'linear-gradient(to right, #2a140a, #8d4925)' }}>
          <div className={getIconColor()}>
            {getIcon()}
          </div>
          <h3 className="fw-bold mb-0">{title}</h3>
        </div>

        {/* Cuerpo del modal */}
        <Modal.Body className="p-4 bg-white text-center">
          <p className="fs-5 mb-0" style={{ color: colors.grayDark }}>
            {message}
          </p>
        </Modal.Body>

        {/* Footer con botón */}
        <div className="modal-footer border-0 p-4 pt-0 d-flex justify-content-center">
          <Button
            className="px-5 py-2 rounded-pill"
            style={{ backgroundColor: colors.brownSecondary, border: 'none', color: 'white' }}
            onClick={onHide}
          >
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MensajeModal;