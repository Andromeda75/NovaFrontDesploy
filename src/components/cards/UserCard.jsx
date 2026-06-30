import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useState } from "react";
import UserProfileModal from "../modals/UserProfileModal.jsx";
import ConfirmarUsuarioModal from "../modals/confirmaciones/ConfirmarUsuarioModal.jsx";

function UserCard({user, cambiarEstadoUsuario}) {
    const [showProfile, setShowProfile] = useState(false);

    const [showConfirmacion, setShowConfirmacion] = useState(false);
    
    return(
    <>
        
        <Card key={user.id} className="mov-card shadow-sm p-3 border w-100 h-100">
             <Row className="d-flex justify-content-center align-items-center">
               <Col xs="auto">
                 <div className="d-flex justify-content-center align-items-center" style={{width: "70px", height: "70px", backgroundColor: "#E8B767", borderRadius: "50px"}}>
                   <i className="bi bi-person color-1 fs-1"></i>
                 </div>
               </Col>

               <Col>
                  <h5 className="mb-1 fw-bold color-1">{user.nombre}</h5>
                  <h6 className="fw-semibold text-muted mb-1">{user.rol}</h6>
                  <p className="text-muted" style={{fontSize:"13px"}}><i className="bi bi-geo-alt me-1"></i>{user.ubicacion}</p>
               </Col>

               <Col className="d-flex justify-content-end align-items-center gap-2">
                    <button className="btn btn-linear-gradient text-white fw-semibold shadow-sm" 
                            style={{ borderRadius: '8px' }}
                            onClick={() => setShowProfile(true)}>
                        <i className="bi bi-eye fs-5"></i>
                    </button>
                    {user.estado === 1 ? (
                    <button className="btn bg-danger text-white fw-semibold shadow-sm" 
                        style={{ borderRadius: '8px' }} 
                        onClick={() => setShowConfirmacion(true)}>
                        <i className="bi bi-slash-circle fs-5"></i>
                    </button>
                    ) : (
                    <button className="btn bg-success text-white fw-semibold shadow-sm" 
                        style={{ borderRadius: '8px' }}
                        onClick={() => setShowConfirmacion(true)}>
                        <i className="bi bi-check2-circle fs-5"></i>
                    </button>
                    )}
               </Col>
             </Row>
        </Card>

        <UserProfileModal
            show={showProfile}
            handleClose={() => setShowProfile(false)}
            user={user}
        />
        <ConfirmarUsuarioModal 
            show={showConfirmacion}
            handleClose={() => setShowConfirmacion(false)}
            user={user}
            cambiarEstadoUsuario={cambiarEstadoUsuario}
        />
    </>
    )
}

export default UserCard;