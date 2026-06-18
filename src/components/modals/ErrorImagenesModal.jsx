import { useState } from "react";
import { Modal } from 'react-bootstrap';

export default function ErrorImagenesModal({show, setShowErrorModal, formData}) { 
    return (
        <Modal show={show} onHide={() => setShowErrorModal(false)} centered contentClassName="rounded-5">
          <div className="p-3 text-white text-center fw-bold rounded-top-5" 
            style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px"}}>
            Imágenes insuficientes
          </div>
        
          <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
            <div className="d-flex justify-content-center align-items-center mx-auto mb-4" style={{width: "90px", height: "90px", backgroundColor: "#fff3cd", borderRadius: "30px"}}>
              <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
            </div>
        
            <h3 className="mb-3" style={{fontSize:"18px"}}>
              Faltan imágenes por subir
            </h3>    
            <p className="text-muted mb-4">
              Debes subir al menos 3 imágenes de tu obra antes de continuar.
              <br />
              <strong>Has subido: {formData.imagenes.length} de 3</strong>
            </p>
        
            <div className="d-flex flex-column gap-3">
              <button 
                onClick={() => setShowErrorModal(false)} 
                className="btn-2" 
                style={{ borderRadius: "30px", padding: "10px", border: "none", color: "white" }}
              >
                Entendido
              </button>
            </div>
          </Modal.Body>
        </Modal>
)}