import { useState, useEffect } from "react";
import { Modal, Row, Col, Card, Button } from "react-bootstrap";
import { perfilService } from "../../services/perfilService";

function UserProfileModal({ 
  id, 
  nombre_completo, 
  interes, ubicacion, 
  estado_id, 
  foto_perfil_url,
  fecha_registro, 
  telefono,
  email,
  direccion,
  saldo_tickets,
  motivo_suspension,
  estadisticas,
  show, handleClose, user }) {

  const [fotoPerfil, setFotoPerfil] = useState(null);
  
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

  if (!show) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
    >
      <Modal.Body className="p-4">

        <div className="position-relative text-center p-4"
             style={{
               borderRadius: "20px",
               border: "1px solid #dcdcdc"
             }}>

          {/* BOTÓN CERRAR */}
          <button
            onClick={handleClose}
            className="btn position-absolute top-0 end-0 m-3">
            <i className="bi bi-x-circle fs-4"></i>
          </button>

          {/* TITULO */}
          <h3 className="fw-bold mb-4">Datos Personales</h3>

        <div className="position-relative d-inline-block mb-4">
            {/* AVATAR */}
            <div className="overflow-hidden flex-shrink-0" 
              style={{ 
                  width: "150px", 
                  borderRadius: "30px",
                  height: "150px", 
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
                  <i className="bi bi-person-fill color-1" style={{ fontSize: '100px' }}></i>
              )}
            </div>

            {estado_id !== 1 && (
                <div className="badge text-bg-danger position-absolute start-50 translate-middle">
                    Suspendido
                </div>
            )}
        </div>
          {estado_id !== 1 && (
            <div className="mb-2">
              <div 
                className="alert alert-danger mb-0 mx-auto"
                style={{ 
                  borderRadius: "15px", 
                  width: "80%",
                  maxWidth: "450px" 
                }}
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <small>
                  Motivo: {motivo_suspension || "No especificado"}
                </small>
              </div>
            </div>
          )}

          {/* INFO PRINCIPAL */}
          <h2 className="fw-bold color-1 mb-0">{nombre_completo}</h2>
          <h4 className="text-muted color-2 fw-bold ">{interes}</h4>
          <p className="text-muted">
            {ubicacion} · Miembro desde { new Date(fecha_registro).getFullYear() }
          </p>

          {/* DATOS */}
          <Row className="mt-4 text-start">
            <Col md={4}>
              <small className="fw-bold color-1">NÚMERO TELEFÓNICO</small>
              <p className="text-muted"> 
                {telefono
                  ? telefono.startsWith("+52")
                    ? telefono
                    : `+52 ${telefono}`
                  : "+52 ---"}
              </p>
            </Col>

            <Col md={4}>
              <small className="fw-bold color-1 ">EMAIL</small>
              <p
                className="text-muted mb-0"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                title={email}
              >
                {email}
              </p>
            </Col>

            <Col md={4}>
              <small className="fw-bold color-1">DIRECCIÓN</small>
              <p className="text-muted">{direccion || "No disponible"}</p>
            </Col>
          </Row>

          {/* TICKETS */}
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-2 mt-3 color-3 fw-bold"
            style={{
              background: "#e8b767cd",
              borderRadius: "20px"
            }}
          >
            <i className="bi bi-ticket-perforated me-1"></i> {saldo_tickets || 0} Tickets Disponibles
          </div>

          {/* STATS */}
          <Row className="mt-4 g-3">

            <Col md={4}>
              <Card className="p-3 text-white"
                    style={{ background:"#D8A47F", borderRadius:"15px"}}>
                <small>Subastas</small>
                <h3 className="mb-0">{estadisticas?.subastas_activas ?? 0}</h3>
                <small>Activas</small>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="p-3 text-white"
                    style={{ background:"#8B6B4E", borderRadius:"15px"}}>
                <small>Artículos</small>
                <h3 className="mb-0">{estadisticas?.articulos_publicados ?? 0}</h3>
                <small>Publicados</small>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="p-3 text-white"
                    style={{ background:"#2F6F6D", borderRadius:"15px"}}>
                <small>Solicitudes</small>
                <h3 className="mb-0">{estadisticas?.solicitudes_publicadas ?? 0}</h3>
                <small>Publicadas</small>
              </Card>
            </Col>

          </Row>

        </div>

      </Modal.Body>
    </Modal>
  );
}

export default UserProfileModal;
