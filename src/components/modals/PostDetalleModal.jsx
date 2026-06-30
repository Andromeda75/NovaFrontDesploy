import { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";

export default function PostDetalleModal({ show, onClose, peticion, categoryColor, styleColor}) {

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
      
      // Limpiar formulario
      setMensaje("");
      setPrecio("");
      setTiempoEntrega("");
      setMostrarFormulario(false);
      
      // Mostrar modal de éxito
      setShowSuccessModal(true);
    };

    return (
      <Modal show={show}
        onHide={onClose}
        centered
        size="lg">
          <Modal.Body className="shadow-sm p-4 rounded-4 py-4">
            <Row>
              {/* COLUMNA IZQUIERDA */}
              <Col md={7}>
                <div className="d-flex align-items-center mb-3">
                  <div className="d-flex justify-content-center align-items-center shadow-sm me-3" style={{ width: "55px", height: "55px", backgroundColor: "#E8B767", borderRadius: "10px" }}>
                    <i className="bi bi-person fs-4 color-1"></i>
                  </div>

                  <div className="d-flex flex-column align-items-start">
                    <h6 className="mb-0 fw-semibold color-1">{peticion.nombre}</h6>
                    <small className="text-muted">Publicado {peticion.tiempo}</small>
                    
                    {/* CATEGORÍA Y ESTILO */}
                    <div className="d-flex gap-2 mt-2">
                      {peticion.categoria && (
                        <span className="px-2 py-1 fw-bold" style={{
                          backgroundColor: categoryColor[peticion.categoria] + "20",
                          borderRadius: "20px",
                          fontSize: "10px",
                          color: categoryColor[peticion.categoria],
                          border: `1px solid ${categoryColor[peticion.categoria]}`
                        }}>
                          {peticion.categoria}
                        </span>
                      )}
                      {peticion.estilo && (
                        <span className="px-2 py-1 fw-bold" style={{
                          backgroundColor: styleColor[peticion.estilo] + "20",
                          borderRadius: "20px",
                          fontSize: "10px",
                          color: styleColor[peticion.estilo],
                          border: `1px solid ${styleColor[peticion.estilo]}`
                        }}>
                          {peticion.estilo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="fw-bold color-2 mb-3">{peticion.titulo}</h2>
                <p className="text-muted">{peticion.descripcion}</p>

                <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#f3f1ee", borderRadius: "14px", maxWidth: "600px" }}>
                  <div>
                    <small className="text-muted color-1">PRESUPUESTO</small>
                    <div className="fw-bold color-1">{peticion.precio}</div>
                  </div>
                  <div>
                    <small className="text-muted color-1">TIEMPO</small>
                    <div className="fw-bold color-1">{peticion.tiempo}</div>
                  </div>
                </div>
              </Col>

              {/* COLUMNA DERECHA */}
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

                      <div className="d-flex justify-content-between align-items-center px-3 py-2 mb-3" style={{ backgroundColor: "#f4e1c7", borderRadius: "10px", fontSize: "14px" }}>
                        <span className="color-2 fw-bold">Costo de propuesta</span>
                        <i className="bi bi-ticket-perforated fs-7 color-3 fw-bold"> -5</i>
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

                      <div className="d-flex justify-content-between align-items-center px-3 py-2 mb-3" style={{ backgroundColor: "#f4e1c7", borderRadius: "10px", fontSize: "14px" }}>
                        <span className="color-2 fw-bold">Costo de propuesta</span>
                        <i className="bi bi-ticket-perforated fs-7 color-3 fw-bold"> -5</i>
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
            </Row>
          </Modal.Body>
      </Modal>
    );
}