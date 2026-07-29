import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { peticionesService } from "../../services/peticionesService";
import { authService } from "../../services/authService";
import { propuestaService } from "../../services/propuestaService";
import { perfilService } from '../../services/perfilService';

// Colores para categorías y estilos (mismos que en Peticiones)
const categoryColors = {
  "Arte Visual": "#ce7fc0",
  "Arte Digital": "#82ca9d",
  "Fotografía": "#cb747c",
  "Escultura": "#8884d8",
  "Artesanías": "#ffc658",
  "Coleccionables": "#859ec3"
};

const styleColors = {
  "Realista": "#4a90e2",
  "Fantasía": "#9b59b6",
  "Minimalista": "#95a5a6",
  "Moderno": "#e67e22",
  "Vintage": "#d35400"
};

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

// Función para obtener iniciales
const getInitials = (nombre) => {
  if (!nombre) return '?';
  const nombres = nombre.split(' ');
  if (nombres.length === 1) return nombres[0].charAt(0).toUpperCase();
  return (nombres[0].charAt(0) + nombres[nombres.length - 1].charAt(0)).toUpperCase();
};

function DetallePeticion() {
  const { id } = useParams();
  const location = useLocation();
  const peticion = location.state?.peticion || peticiones.find((p) => p.id === parseInt(id));
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [precio, setPrecio] = useState("");
  const [tiempoEntrega, setTiempoEntrega] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [peticiones, setPeticiones] = useState([]);
  const [fotoPerfil, setFotoPerfil] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const peticionesData = await peticionesService.getPeticionesById(id);
      setPeticiones(peticionesData);
      
      // Cargar foto de perfil del creador
      if (peticionesData?.creador_id) {
        await cargarFotoPerfil(peticionesData.creador_id);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarFotoPerfil = async (creadorId) => {
    try {
      const perfilData = await perfilService.getPerfilPublico(creadorId);
      if (perfilData.foto_perfil_url) {
        setFotoPerfil(perfilData.foto_perfil_url);
      }
    } catch (error) {
      console.error('Error cargando foto del creador:', error);
    }
  };

  const user = authService.getCurrentUser();
  const isMyPeticion = user?.id === peticiones.creador_id;

  const handleSubmit = async () => {
    try {
      const propuesta = {
        peticion_id: peticion.id,
        artista_id: user.id,
        mensaje,
        precio_oferta_mxn: precio,
        tiempo_entrega_semanas: tiempoEntrega,
      };

      console.log("Propuesta enviada:", propuesta);

      await propuestaService.postPropuesta(propuesta);

      setShowSuccessModal(true);

      setMensaje("");
      setPrecio("");
      setTiempoEntrega("");

    } catch (error) {
      console.error(error);
      alert("Error al enviar la propuesta");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        {error}
      </div>
    );
  }

  return (
    <>
      <div>
        <Container className="py-0">
          <Col>
            <div className="py-3">
              <h1 className="color-2 fw-bold">Peticiones Creativas</h1>
              <p className="color-3 fs-5">
                Muro comunitario para solicitar encargos, colaboraciones, etc.
              </p>
              <Link to="/peticiones" className="text-decoration-none text-muted mb-4 d-inline-block">
                <i className="bi bi-arrow-left me-2"></i> Volver al Muro
              </Link>
            </div>
          </Col>
        </Container>
      </div>

      <div className="premium-bg mb-5 mt-4">
        <Container>
          <Card className="shadow-sm p-4 border rounded-4 py-4" 
            style={{
              maxWidth: isMyPeticion ? "800px" : ""
            }}>
            <Row>
              {/* COLUMNA IZQUIERDA */}
              <Col md={isMyPeticion ? 12 : 7}>
                <div className="d-flex align-items-center mb-3">
                  {/* Foto de perfil del creador */}
                  <div className="d-flex justify-content-center align-items-center shadow-sm me-3 overflow-hidden" 
                    style={{ 
                      width: "55px", 
                      height: "55px", 
                      backgroundColor: "#f3e1c7", 
                      borderRadius: "10%",
                      border: "2px solid #853204",
                      hover: { borderColor: "#ffffff" },
                      flexShrink: 0
                    }}>
                    {fotoPerfil ? (
                      <img 
                        src={fotoPerfil} 
                        alt={`Foto de ${peticiones.creador_nombre || 'Usuario'}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span className="fw-bold color-1" style={{ fontSize: '18px' }}>
                        {getInitials(peticiones.creador_nombre || 'Usuario')}
                      </span>
                    )}
                  </div>

                  <div className="d-flex flex-column align-items-start">
                    <Link
                      to={`/profile/public/${peticiones.creador_id}`}
                      className="text-decoration-none"
                    >
                      <h6 className="mb-0 fw-semibold color-1"> {isMyPeticion ? "Tú" : peticiones.creador_nombre} </h6>
                    </Link>
                    <small className="text-muted">Publicado {formatearFecha(peticiones.fecha_publicacion)}</small>

                    {/* CATEGORÍA Y ESTILO */}
                    <div className="d-flex gap-2 mt-2">
                      {peticiones.categoria_nombre && (
                        <span className="px-2 py-1 fw-bold" style={{
                          backgroundColor: categoryColors[peticiones.categoria_nombre] + "20",
                          borderRadius: "20px",
                          fontSize: "10px",
                          color: categoryColors[peticiones.categoria_nombre],
                          border: `1px solid ${categoryColors[peticiones.categoria_nombre]}`
                        }}>
                          {peticiones.categoria_nombre}
                        </span>
                      )}
                      {peticiones.estilo && (
                        <span className="px-2 py-1 fw-bold" style={{
                          backgroundColor: styleColors[peticiones.estilo] + "20",
                          borderRadius: "20px",
                          fontSize: "10px",
                          color: styleColors[peticiones.estilo],
                          border: `1px solid ${styleColors[peticiones.estilo]}`
                        }}>
                          {peticiones.estilo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="fw-bold color-2 mb-3">{peticiones.titulo}</h2>
                <p className="text-muted">{peticiones.descripcion}</p>

                <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#f3f1ee", borderRadius: "14px" }}>
                  <div>
                    <small className="text-muted color-1">PRESUPUESTO</small>
                    <div className="fw-bold color-1">{formatearPrecio(peticiones.presupuesto_min_mxn)} - {formatearPrecio(peticiones.presupuesto_max_mxn)}</div>
                  </div>
                  <div>
                    <small className="text-muted color-1">TIEMPO</small>
                    <div className="fw-bold color-1">{peticiones.plazo_entrega_semanas} semanas</div>
                  </div>
                </div>
              </Col>

              {/* COLUMNA DERECHA */}
              {!isMyPeticion && (
                <Col md={5} className="mt-4 mt-md-0">
                  <Card className="shadow-sm p-4 rounded-4 border">
                    {!mostrarFormulario ? (
                      <>
                        <h5 className="fw-bold mb-3 color-3">Enviar Propuesta</h5>

                        <div className="mb-2">
                          <i className="bi bi-check-square-fill me-2 color-3"></i>
                          El creador revisará tu oferta
                        </div>
                        <div className="mb-2">
                          <i className="bi bi-check-square-fill me-2 color-3"></i>
                          Si le gusta, abrirá un chat privado
                        </div>
                        <div className="mb-3">
                          <i className="bi bi-check-square-fill me-2 color-3"></i>
                          Se desbloquean botones de seguimiento
                        </div>

                        <Button className="btn-2" onClick={() => setMostrarFormulario(true)}>
                          <i className="bi bi-arrow-up-right me-2"></i> POSTULARME AHORA
                        </Button>
                      </>
                    ) : (
                      <>
                        <h5 className="fw-bold mb-3 color-3">Enviar Propuesta</h5>
                        <div className="mb-2">
                          <i className="bi bi-check-square-fill me-2 color-3"></i>
                          El creador revisará tu oferta
                        </div>
                        <div className="mb-2">
                          <i className="bi bi-check-square-fill me-2 color-3"></i>
                          Si le gusta, abrirá un chat privado
                        </div>
                        <div className="mb-3">
                          <i className="bi bi-check-square-fill me-2 color-3"></i>
                          Se desbloquean botones de seguimiento
                        </div>

                        <Form.Group className="mb-3">
                          <Form.Control
                            placeholder="Escribe tu mensaje al creador..."
                            as="textarea"
                            rows={3}
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                          />
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center gap-2">
                          <Form.Group className="mb-3 flex-grow-1">
                            <Form.Control
                              placeholder="Tu precio"
                              value={precio}
                              onChange={(e) => setPrecio(e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3 flex-grow-1">
                            <Form.Control
                              placeholder="Tiempo"
                              value={tiempoEntrega}
                              onChange={(e) => setTiempoEntrega(e.target.value)}
                            />
                          </Form.Group>
                        </div>

                        <Button className="btn-2 w-100" onClick={handleSubmit}>
                          <i className="bi bi-send me-2"></i> ENVIAR PROPUESTA
                        </Button>
                        <Button className="flex-grow-1 rounded-pill py-2 w-100 mt-2" 
                          variant="outline-secondary"
                          onClick={() => setMostrarFormulario(false)}>
                          CANCELAR
                        </Button>
                      </>
                    )}
                  </Card>
                </Col>
              )}
            </Row>
          </Card>
        </Container>
      </div>

      {/* MODAL DE ÉXITO */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered contentClassName="rounded-5">
        <div className="p-3 text-white text-center fw-bold rounded-top-5" 
          style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px" }}>
          ¡Propuesta enviada!
        </div>

        <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
          <div className="d-flex justify-content-center align-items-center mx-auto mb-4" 
            style={{ width: "90px", height: "90px", backgroundColor: "#d4edda", borderRadius: "30px" }}>
            <i className="bi bi-check-circle-fill fs-1" style={{ color: "#28a745" }}></i>
          </div>

          <h3 className="mb-3" style={{ fontSize: "20px", color: "#4a2311" }}>
            ¡Postulación exitosa!
          </h3>    
          <p className="text-muted mb-4">
            Tu propuesta ha sido enviada correctamente.<br />
            El creador revisará tu oferta y te contactará si está interesado.
          </p>

          <div className="d-flex flex-column gap-3">
            <button 
              onClick={() => setShowSuccessModal(false)} 
              className="btn-2" 
              style={{ 
                borderRadius: "30px", 
                padding: "12px", 
                border: "none", 
                color: "white", 
                fontWeight: "bold"
              }}
            >
              Entendido
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DetallePeticion;