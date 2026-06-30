import React from "react";
import { Button } from "react-bootstrap";

const ConfirmarUsuarioModal = ({ show, user, handleClose, cambiarEstadoUsuario }) => {
  if (!show) return null;

  return (
    <>
        <div style={{position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1040 }}></div>

            <div className="modal d-block" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered">

                    <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                    {/* HEADER */}
                    <div className="p-3 text-white text-center fw-bold"style={{background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px"}}>Confirmación</div>
                    {/* BODY */}
                    <div className="modal-body text-center p-5 bg-light">
                        {/* ICONO */}
                        <div className="d-flex justify-content-center align-items-center mx-auto mb-4" 
                            style={{width: "90px", height: "90px", backgroundColor: user.estado === 1 ? "#f8d7da" : "#d1e7dd", borderRadius: "30px"}}>
                            {user.estado === 1 ? (
                                <i className="bi bi-slash-circle fs-1 text-danger"></i>
                            ) : (
                                <i className="bi bi-check2-circle fs-1 text-success"></i>
                            )}
                        </div>
                        <h3 className="fw-bold mb-3">{user.estado === 1 ? "Suspender usuario" : "Reactivar usuario"}</h3>    
                        <p className="text-muted mb-4">
                            {user.estado === 1 ? 
                                "Esta acción suspenderá la cuenta del usuario e impedirá su acceso a la plataforma. ¿Deseas continuar?" 
                                : "Esta acción reactivará la cuenta del usuario. ¿Deseas continuar?"
                            }
                            
                        </p>

                        {/* RAZÓN DE SUSPENSIÓN */}
                        {user.estado === 1 && (
                        <div className="mb-4 text-start">
                            <label className="form-label fw-semibold">
                            Motivo de la suspensión
                            </label>

                            <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Escribe la razón por la cual se suspende al usuario..."
                            // value={razon}
                            // onChange={(e) => setRazon(e.target.value)}
                            style={{
                                borderRadius: "12px",
                                resize: "none"
                            }}
                            />
                        </div>
                        )}


                        {/* BOTONES */}
                        <div className="d-flex flex-column gap-3">
                        <Button className="btn-2"
                            style={{ borderRadius: "30px", padding: "10px"}}
                            onClick={() => {
                                cambiarEstadoUsuario(user.id, user.estado === 1 ? 0 : 1); 
                                handleClose();
                            }}>
                            {user.estado === 1 ? "Suspender" : "Activar"}
                        </Button>
                        <Button className="btn btn-light border  rounded-pill px-3 py-2 order-2 order-sm-1" 
                            style={{borderRadius: "30px"}}
                            onClick={handleClose}>
                            Cancelar
                        </Button>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    </>
     );
};

export default ConfirmarUsuarioModal;