import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";

import { authService } from "../../services/authService";

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatearPrecio(precio) {
  if (precio == null) return '';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(precio);
}

export default function PostDetalleModal({ show, onClose, peticion, categoryColor, styleColor }) {

  if (!peticion) return null;
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [precio, setPrecio] = useState("");
  const [tiempoEntrega, setTiempoEntrega] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    const propuesta = {
      peticionId: peticion.id,
      mensaje,
      precio,
      tiempoEntrega,
    };

    console.log("Propuesta enviada:", propuesta);
    
    setMensaje("");
    setPrecio("");
    setTiempoEntrega("");
    setMostrarFormulario(false);
    setShowSuccessModal(true);
  };

  const user = authService.getCurrentUser();
  const isMyPeticion = user?.id === peticion.creador_id;

  // Obtener la foto de perfil (de la petición o de localStorage)
  const getFotoPerfil = () => {
    // Si es mi petición, intentar desde localStorage
    if (isMyPeticion) {
      const fotoGuardada = localStorage.getItem('fotoPerfil');
      if (fotoGuardada) {
        return fotoGuardada;
      }
    }
    
    // Si no, usar la que viene de la petición
    return peticion.creador_foto || null;
  };

  const fotoPerfil = getFotoPerfil();

  return (
    <Modal 
      style={{backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}
      show={show}
      onHide={onClose}
      centered
      size="lg"
    >
      <Modal.Body className="shadow-sm p-4 rounded-4 py-4">
        <Row>
          {/* COLUMNA IZQUIERDA */}
          <Col md={12}>
            <div className="d-flex align-items-center mb-3">
              {/* Foto de perfil */}
              <div className="d-flex justify-content-center align-items-center shadow-sm me-3 overflow-hidden" 
                style={{
                  width: "55px", 
                  height: "55px", 
                  backgroundColor: "#f3e1c7", 
                  borderRadius: "10%",
                  border: "2px solid #853204",
                  flexShrink: 0
                }}>
                {fotoPerfil ? (
                  <img 
                    src={fotoPerfil} 
                    alt="Foto de perfil"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <i className="bi bi-person fs-4 color-1"></i>
                )}
              </div>

              <div className="d-flex flex-column align-items-start">
                <Link
                  to={`/profile/public/${peticion.creador_id}`}
                  className="text-decoration-none"
                >
                  <h6 className="mb-0 fw-semibold color-1">
                    {isMyPeticion ? "Tú" : (peticion.artista_nombre || peticion.creador_nombre)}
                  </h6>
                </Link>
                <small className="text-muted">Publicado {formatearFecha(peticion.fecha_publicacion)}</small>
                
                {/* CATEGORÍA Y ESTILO */}
                <div className="d-flex gap-2 mt-2">
                  {peticion.categoria_nombre && (
                    <span className="px-2 py-1 fw-bold" style={{
                      backgroundColor: categoryColor?.[peticion.categoria_nombre] + "20" || "#f0f0f0",
                      borderRadius: "20px",
                      fontSize: "10px",
                      color: categoryColor?.[peticion.categoria_nombre] || "#333",
                      border: `1px solid ${categoryColor?.[peticion.categoria_nombre] || "#ccc"}`
                    }}>
                      {peticion.categoria_nombre}
                    </span>
                  )}
                  {peticion.estilo && (
                    <span className="px-2 py-1 fw-bold" style={{
                      backgroundColor: styleColor?.[peticion.estilo] + "20" || "#f0f0f0",
                      borderRadius: "20px",
                      fontSize: "10px",
                      color: styleColor?.[peticion.estilo] || "#333",
                      border: `1px solid ${styleColor?.[peticion.estilo] || "#ccc"}`
                    }}>
                      {peticion.estilo}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <h2 className="fw-bold color-2 mb-3">{peticion.titulo}</h2>
            <p className="text-muted">{peticion.descripcion}</p>

            <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#f3f1ee", borderRadius: "14px" }}>
              <div>
                <small className="text-muted color-1">PRESUPUESTO</small>
                <div className="fw-bold color-1">{formatearPrecio(peticion.presupuesto_min_mxn)} - {formatearPrecio(peticion.presupuesto_max_mxn)}</div>
              </div>
              <div>
                <small className="text-muted color-1">TIEMPO</small>
                <div className="fw-bold color-1">{peticion.plazo_entrega_semanas} semanas</div>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}