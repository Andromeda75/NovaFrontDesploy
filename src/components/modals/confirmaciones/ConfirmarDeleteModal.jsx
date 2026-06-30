import React from "react";
import { Button } from "react-bootstrap";

const ConfirmacionDeleteModal = ({ show, confirmarEliminar, setShowDeleteModal }) => {
  if (!show) return null;

  return (
    <>
        <div style={{position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1040 }}></div>

            <div className="modal d-block" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered">

                    <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                    {/* HEADER */}
                    <div className="p-3 text-white text-center fw-bold"style={{background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px"}}> Confirmar eliminación</div>
                    {/* BODY */}
                    <div className="modal-body text-center p-5 bg-light">
                        {/* ICONO */}
                        <div className="d-flex justify-content-center align-items-center mx-auto mb-4" style={{width: "90px", height: "90px", backgroundColor: "#f8d7da", borderRadius: "30px"}}>
                        <i className="bi bi-trash fs-1 text-danger"></i>
                        </div>

                        <h3 className="fw-bold mb-3"> ¿Eliminar petición? </h3>    
                        <p className="text-muted mb-4">Esta acción eliminará la petición permanentemente.</p>

                        {/* BOTONES */}
                        <div className="d-flex flex-column gap-3">
                        <Button className="btn-2" onClick={confirmarEliminar} style={{ borderRadius: "30px", padding: "10px"}}>Eliminar</Button>
                        <Button className="btn btn-light border  rounded-pill px-3 py-2 order-2 order-sm-1" onClick={() => setShowDeleteModal(false)} style={{borderRadius: "30px"}}>Cancelar</Button>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    </>
     );
};

export default ConfirmacionDeleteModal;