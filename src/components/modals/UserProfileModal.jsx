import { Modal, Row, Col, Card, Button } from "react-bootstrap";

function UserProfileModal({ show, handleClose, user }) {

  if (!user) return null;

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
            <div
                className="mx-auto d-flex justify-content-center align-items-center"
                style={{
                width: "150px",
                height: "150px",
                backgroundColor: "#E8B767",
                borderRadius: "30px"
                }}>
                <i className="bi bi-person-fill color-1" style={{ fontSize: '100px' }}></i>
            </div>

            {user.estado !== 1 && (
                <div className="badge text-bg-danger position-absolute start-50 translate-middle-x">
                    Suspendido
                </div>
            )}
        </div>

          {/* INFO PRINCIPAL */}
          <h2 className="fw-bold color-1 mb-0">{user.nombre}</h2>
          <h4 className="text-muted color-2 fw-bold ">{user.rol}</h4>
          <p className="text-muted">
            {user.ubicacion} · Miembro desde 2025
          </p>

          {/* DATOS */}
          <Row className="mt-4 text-start">
            <Col md={4}>
              <small className="fw-bold color-1">NÚMERO TELEFÓNICO</small>
              <p className="text-muted">+52 {user.telefono || "+52 ---"}</p>
            </Col>

            <Col md={4}>
              <small className="fw-bold color-1 ">EMAIL</small>
              <p className="text-muted">{user.email}</p>
            </Col>

            <Col md={4}>
              <small className="fw-bold color-1">DIRECCIÓN</small>
              <p className="text-muted">{user.direccion || "No disponible"}</p>
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
            <i className="bi bi-ticket-perforated me-1"></i> {user.tickets || 0} Tickets Disponibles
          </div>

          {/* STATS */}
          <Row className="mt-4 g-3">

            <Col md={4}>
              <Card className="p-3 text-white"
                    style={{ background:"#D8A47F", borderRadius:"15px"}}>
                <small>Subastas</small>
                <h3 className="mb-0">3</h3>
                <small>Activas</small>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="p-3 text-white"
                    style={{ background:"#8B6B4E", borderRadius:"15px"}}>
                <small>Artículos</small>
                <h3 className="mb-0">10</h3>
                <small>Publicados</small>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="p-3 text-white"
                    style={{ background:"#2F6F6D", borderRadius:"15px"}}>
                <small>Solicitudes</small>
                <h3 className="mb-0">2</h3>
                <small>Enviadas</small>
              </Card>
            </Col>

          </Row>

        </div>

      </Modal.Body>
    </Modal>
  );
}

export default UserProfileModal;
