import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { perfilService } from "../../services/perfilService";

import { Container, Row, Col, Card, Button } from "react-bootstrap";
import UserProfileModal from "../modals/UserProfileModal.jsx";
import ConfirmarUsuarioModal from "../modals/confirmaciones/ConfirmarUsuarioModal.jsx";

function UserCard({
    id, 
    nombre_completo, 
    interes, 
    ubicacion, 
    estado_id, 
    foto_perfil_url,
    fecha_registro,
    telefono,
    email,
    direccion,
    saldo_tickets,
    motivo_suspension,
    user, cambiarEstado}) {
    const [showProfile, setShowProfile] = useState(false);

    const [showConfirmacion, setShowConfirmacion] = useState(false);
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);

    useEffect(() => {
        cargarFotoPerfil();
    }, [id]);

    const cargarFotoPerfil = async () => {
        try {
          // Si ya viene la foto desde las props, usarla
          if (foto_perfil_url) {
            setFotoPerfil(foto_perfil_url);
            return;
          }
    
          // Si no, obtener del backend usando el ID del artista
          const perfilData = await perfilService.getPerfilPublico(id);
          if (perfilData.foto_perfil_url) {
            setFotoPerfil(perfilData.foto_perfil_url);
          }
        } catch (error) {
          console.error('Error cargando foto del artista:', error);
        }
    };

    const handleOpenProfile = async () => {
        const data = await perfilService.getEstadisticasUser(id);
        // console.log(data);
        setEstadisticas(data);
        setShowProfile(true);
    };
    
    return(
    <>
        
        <Card key={id} className="mov-card shadow-sm p-3 border w-100 h-100">
             <Row className="d-flex justify-content-center align-items-center">
               <Col xs="auto">
                    <div className="overflow-hidden flex-shrink-0" 
                        style={{ 
                            width: "70px", 
                            borderRadius: "50px",
                            height: "70px", 
                            backgroundColor: "#E8B767",
                            display: "grid", 
                            placeItems: "center" 
                        }}>
                        {fotoPerfil ? (
                            <img 
                            src={fotoPerfil} 
                            alt={`Foto de ${nombre_completo || 'Artista'}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            />
                        ) : (
                            <i className="bi bi-person color-1 fs-1"></i>
                        )}
                    </div>
               </Col>

               <Col>
                  <h5 className="mb-1 fw-bold color-1">{nombre_completo}</h5>
                  <h6 className="fw-semibold text-muted mb-1">{interes}</h6>
                  <p className="text-muted" style={{fontSize:"13px"}}><i className="bi bi-geo-alt me-1"></i>{ubicacion}</p>
               </Col>

               <Col className="d-flex justify-content-end align-items-center gap-2">
                    <button className="btn btn-linear-gradient text-white fw-semibold shadow-sm" 
                            style={{ borderRadius: '8px' }}
                            onClick={handleOpenProfile}>
                        <i className="bi bi-eye fs-5"></i>
                    </button>
                    {estado_id === 1 ? (
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
            id={id}
            estado_id={estado_id}
            nombre_completo={nombre_completo}
            interes={interes}
            ubicacion={ubicacion}
            foto_perfil_url={foto_perfil_url}
            fecha_registro={fecha_registro}
            telefono={telefono}
            email={email}
            direccion={direccion}
            saldo_tickets={saldo_tickets}
            motivo_suspension={motivo_suspension}
            estadisticas={estadisticas}
        />
        <ConfirmarUsuarioModal 
            show={showConfirmacion}
            handleClose={() => setShowConfirmacion(false)}
            id={id}
            estado_id={estado_id}
            nombre_completo={nombre_completo}
            cambiarEstado={cambiarEstado}
        />
    </>
    )
}

export default UserCard;