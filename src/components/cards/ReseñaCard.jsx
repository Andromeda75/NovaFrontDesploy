import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { authService } from '../../services/authService';

function formatearFecha(fecha) {
  if (!fecha) return '';

  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function ReseñaCard({ id, autor_nombre, autor_id, destinatario_id, comentario, calificacion, fecha, onEditar, onEliminar }) {
  const user = authService.getCurrentUser();
  const isMyReview = user?.id === autor_id;
  
  const [respuestaActiva, setRespuestaActiva] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");

  const [calificacionEditada, setCalificacionEditada] = useState(calificacion);

    
    return(
    <div className="row g-3">
            <div className="card border-0 shadow-sm p-3 mb-3 transition-hover h-100" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-color-4 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                    <i className="bi bi-person fs-4 color-1"></i>
                  </div>
                  <div>
                    <Link
                        to={`/profile/public/${autor_id}`}
                        className="text-decoration-none"
                    >
                      <h6 className="fw-bold color-1 mb-0">
                        {isMyReview ? "Tú" : autor_nombre}
                      </h6>
                    </Link>
                    <small className="text-muted text-uppercase" style={{ fontSize: '0.6rem' }}>{formatearFecha(fecha)}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-auto">
                  {isMyReview && (
                    <button
                      className="btn btn-sm text-secondary d-flex align-items-center justify-content-center fw-bold"
                      onClick={() => {
                        setEditandoId(id);
                        setTextoEditado(comentario);
                        setCalificacionEditada(calificacion);
                      }}
                    >
                      <i className="bi bi-pencil-square fs-5"></i>
                    </button>
                  )}

                  {isMyReview && (
                    <button
                      className="btn btn-sm text-danger d-flex align-items-center justify-content-center fw-bold"
                      onClick={() => onEliminar(id)}
                    >
                      <i className="bi bi-trash fs-5"></i>
                    </button>
                  )}

                  <span className="badge rounded-pill bg-white text-warning border border-warning px-2 py-1 fw-bold shadow-sm small">
                    <i className="bi bi-star-fill me-1"></i> {calificacion}.0 / 5.0
                  </span>
                </div>

              </div>
              {editandoId === id ? (
                <>
                  <div className="mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <i
                        key={star}
                        className={`bi ${star <= calificacionEditada ? "bi-star-fill" : "bi-star"}`}
                        style={{
                          cursor: "pointer",
                          color: "#f5b301",
                          fontSize: "20px",
                          marginRight: "5px"
                        }}
                        onClick={() => setCalificacionEditada(star)}
                      ></i>
                    ))}
                  </div>

                  <textarea
                    className="form-control mb-2"
                    value={textoEditado}
                    onChange={(e) => setTextoEditado(e.target.value)}
                  />

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => setEditandoId(null)}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn btn-sm text-white bg-color-1"
                      onClick={() => {
                        onEditar(id, textoEditado, calificacionEditada);
                        setEditandoId(null);
                      }}
                    >
                      Guardar
                    </button>
                  </div>
                </>
              ) : (
                <p className="small mb-3 px-1" style={{ lineHeight: '1.4', fontSize: '0.85rem' }}>
                  "{comentario}"
                </p>
              )}


              {respuestaActiva !== id ? (
                <button 
                  onClick={() => setRespuestaActiva(id)}
                  className="btn btn-link p-0 text-decoration-none color-1 fw-bold small opacity-75 text-start d-flex align-items-center gap-1 mt-auto">
                  <i className="bi bi-reply"></i> Responder comentario
                </button>
              ) : (
                <div className="animate__animated animate__fadeIn mt-auto">
                  <textarea 
                    className="form-control border-2 shadow-none mb-2 small" 
                    placeholder="Escribe tu respuesta pública..." 
                    rows="2" 
                    style={{ borderRadius: '12px', fontSize: '0.8rem' }}
                    autoFocus
                  ></textarea>
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                    <button onClick={() => setRespuestaActiva(null)} className="btn btn-light border  rounded-pill px-3 py-1 order-2 order-sm-1">
                      Cancelar
                    </button>
                    <button 
                      className="btn btn-sm rounded-pill px-3 py-1 fw-bold text-white shadow-sm border-0 order-1 order-sm-2 bg-color-1">
                      Enviar respuesta
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </div>
    )
}

export default ReseñaCard;