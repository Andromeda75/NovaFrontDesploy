import React from "react";
import { useState, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function PeticionModal({ showModal, setShowModal, formData, handleUpdate, handleChange, handleSubmit, editando, categoryColor, styleColor }) {

  if (!showModal) return null;

  return (
    <>
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1040 }} onClick={() => setShowModal(false)}></div>

          <div className="modal d-block" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>

                <div className="p-4 text-white" style={{ background: "linear-gradient(to right, #2a140a, #8d4925)" }}>
                  <h3 className="fw-bold mb-1">{editando ? "Editar Petición" : "Nueva Petición Creativa"}</h3>
                  <p className="mb-0 small opacity-75">Publica tu encargo o idea de proyecto.</p>
                </div>

                <div className="modal-body p-4 bg-light">

                   {/* <Link to="/perfil/:id" className="text-decoration-none text-muted mb-4 d-inline-block">
                  <i className="bi bi-arrow-left me-2"></i> Volver al Explorador
                </Link> */}

                  <div className="mb-3">
                    <label className="fw-bold small color-2">Título del Proyecto</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="form-control rounded-3 border-2" placeholder="Ej: Escultura para terraza" />
                  </div>

                  <Row className="mb-3">
                    <Col md={6}>
                      <label className="fw-bold small color-2">Categoría</label>
                      <select name="categoria" value={formData.categoria} onChange={handleChange} className="form-control rounded-3 border-2">
                        <option value="">Selecciona una categoría</option>
                        {Object.keys(categoryColor).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </Col>
                    <Col md={6}>
                      <label className="fw-bold small color-2">Estilo</label>
                      <select name="estilo" value={formData.estilo} onChange={handleChange} className="form-control rounded-3 border-2">
                        <option value="">Selecciona un estilo</option>
                        {Object.keys(styleColor).map((est) => (
                          <option key={est} value={est}>{est}</option>
                        ))}
                      </select>
                    </Col>
                  </Row>

                  <div className="mb-3">
                    <label className="fw-bold small color-2">Descripción Detallada</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="form-control rounded-3 border-2" rows="3" placeholder="Describe qué necesitas..." />
                  </div>

                  <Row className="mb-4">
                    <Col>
                      <label className="fw-bold small color-2">Presupuesto Mínimo (MXN)</label>
                      <input 
                        type="number" 
                        name="presupuesto_min" 
                        className="form-control rounded-3 border-2" 
                        value={formData.presupuesto_min || ""} 
                        onChange={handleChange}
                        placeholder="Mínimo"
                      />
                    </Col>
                    <Col>
                      <label className="fw-bold small color-2">Presupuesto Máximo (MXN)</label>
                      <input 
                        type="number" 
                        name="presupuesto_max" 
                        className="form-control rounded-3 border-2" 
                        value={formData.presupuesto_max || ""} 
                        onChange={handleChange}
                        placeholder="Máximo"
                      />
                    </Col>
                    <Col>
                      <label className="fw-bold small color-2">Plazo de Entrega</label>
                      <input type="text" name="plazo" value={formData.plazo} onChange={handleChange} className="form-control rounded-3 border-2" placeholder="3 semanas" />
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between align-items-center">
                    <Button className="btn-linear-gradient" onClick={() => setShowModal(false)}>Cancelar</Button>

                    <div className="d-flex align-items-center gap-3">
                        <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: "#f6d8a8", color: "#8d4925" }}>- 5 Tickets</span>
                        <Button className="btn-linear-gradient" onClick={editando ? handleUpdate : handleSubmit}>{editando ? "Guardar Cambios" : "Publicar Petición"}<i className="bi bi-check-lg ms-2"></i></Button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </>
    );
}

export default PeticionModal;