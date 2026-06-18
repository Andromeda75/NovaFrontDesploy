import React, { useState, useEffect } from 'react';
import { reviewService } from '../../../services/reviewService';
import { authService } from '../../../services/authService';
import MensajeModal from '../../../components/modals/MensajeModal';
import { useModal } from '../../../components/modals/useModal';

function Reputacionv2() {
  const { modal, showModalMessage, hideModal } = useModal();
  const [respuestaActiva, setRespuestaActiva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reseñas, setReseñas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    promedio: 0,
    total: 0,
    distribucion: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  const user = authService.getCurrentUser();
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      cargarReseñas();
    }
  }, [userId]);

  const cargarReseñas = async () => {
    setLoading(true);
    try {
      // Obtener reseñas del usuario
      const reseñasData = await reviewService.getMyReviews();
      setReseñas(reseñasData);
      
      // Calcular estadísticas
      calcularEstadisticas(reseñasData);
    } catch (err) {
      console.error('Error cargando reseñas:', err);
      setError('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (reseñasData) => {
    if (!reseñasData || reseñasData.length === 0) {
      setEstadisticas({
        promedio: 0,
        total: 0,
        distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    let suma = 0;
    const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reseñasData.forEach(reseña => {
      const calificacion = parseInt(reseña.calificacion);
      suma += calificacion;
      if (distribucion[calificacion] !== undefined) {
        distribucion[calificacion]++;
      }
    });

    const total = reseñasData.length;
    const promedio = suma / total;

    setEstadisticas({
      promedio: promedio.toFixed(1),
      total: total,
      distribucion: distribucion
    });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const enviarRespuesta = async (reseñaId, respuesta) => {
    if (!respuesta.trim()) {
      showModalMessage('Atención', 'Por favor, escribe una respuesta', 'warning');
      return;
    }

    try {
      // Aquí se enviaría la respuesta al backend
      // Por ahora solo mostramos un mensaje
      console.log('Enviando respuesta:', { reseñaId, respuesta });
      showModalMessage('¡Éxito!', 'Respuesta enviada correctamente', 'success');
      setRespuestaActiva(null);
    } catch (err) {
      console.error('Error enviando respuesta:', err);
      showModalMessage('Error', 'Error al enviar la respuesta', 'error');
    }
  };

  const obtenerPorcentaje = (cantidad) => {
    if (estadisticas.total === 0) return 0;
    return (cantidad / estadisticas.total) * 100;
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
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={cargarReseñas}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="animate__animated animate__fadeIn">
        <h3 className="fw-bold color-1 mb-0">Mi Reputación</h3>
        <p className="text-muted mb-3 color-2" style={{ fontSize: '18px' }}>
          Lo que dicen otros usuarios sobre tu trabajo y confiabilidad.
        </p>
        
        <div className="row g-3 g-md-4 text-start">
          {/* Tarjeta de estadísticas */}
          <div className="col-12 col-md-5 col-lg-4">
            <div className="card border-0 shadow-sm p-4 text-center h-100" style={{ borderRadius: '15px' }}>
              <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style={{ width: '55px', height: '55px' }}>
                <i className="bi bi-star-fill text-white fs-3"></i>
              </div>
              <h2 className="fw-bold color-2 mb-1" style={{ fontSize: '2.2rem' }}>
                {estadisticas.promedio} / 5.0
              </h2>
              <p className="fw-bold mb-4 small color-2">
                Basado en {estadisticas.total} {estadisticas.total === 1 ? 'reseña' : 'reseñas'}
              </p>
              <div className="px-1">
                {[5, 4, 3, 2, 1].map((num) => (
                  <div key={num} className="d-flex align-items-center gap-3 mb-2">
                    <span className="fw-bold color-1 small" style={{ width: '15px' }}>{num}</span>
                    <div className="progress flex-grow-1" style={{ height: '8px', borderRadius: '10px' }}>
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ 
                          width: `${obtenerPorcentaje(estadisticas.distribucion[num])}%`, 
                          borderRadius: '10px' 
                        }}
                      ></div>
                    </div>
                    <span className="small text-muted" style={{ width: '30px' }}>
                      {estadisticas.distribucion[num]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de reseñas */}
          <div className="col-12 col-md-7 col-lg-8">
            {reseñas.length > 0 ? (
              reseñas.map((r) => (
                <div key={r.id} className="card border-0 shadow-sm p-3 mb-3 transition-hover" style={{ borderRadius: '20px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-color-4 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                        <i className="bi bi-person fs-4 color-1"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold color-1 mb-0">{r.autor_nombre || 'Usuario'}</h6>
                        <small className="text-muted text-uppercase" style={{ fontSize: '0.6rem' }}>
                          {formatearFecha(r.fecha)}
                        </small>
                      </div>
                    </div>
                    <span className="badge rounded-pill bg-white text-warning border border-warning px-2 py-1 fw-bold shadow-sm small">
                      <i className="bi bi-star-fill me-1"></i> {r.calificacion} / 5.0
                    </span>
                  </div>
                  <p className="small mb-3 px-1" style={{ lineHeight: '1.4', fontSize: '0.85rem' }}>
                    "{r.comentario || 'Sin comentario'}"
                  </p>

                  {respuestaActiva !== r.id ? (
                    <button 
                      onClick={() => setRespuestaActiva(r.id)}
                      className="btn btn-link p-0 text-decoration-none color-1 fw-bold small opacity-75 text-start d-flex align-items-center gap-1">
                      <i className="bi bi-reply"></i> Responder comentario
                    </button>
                  ) : (
                    <div className="animate__animated animate__fadeIn">
                      <textarea 
                        className="form-control border-2 shadow-none mb-2 small" 
                        placeholder="Escribe tu respuesta pública..." 
                        rows="2" 
                        style={{ borderRadius: '12px', fontSize: '0.8rem' }}
                        autoFocus
                        id={`respuesta-${r.id}`}
                      ></textarea>
                      <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                        <button 
                          onClick={() => setRespuestaActiva(null)} 
                          className="btn btn-light border rounded-pill px-3 py-1 order-2 order-sm-1"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => {
                            const respuesta = document.getElementById(`respuesta-${r.id}`).value;
                            enviarRespuesta(r.id, respuesta);
                          }}
                          className="btn btn-sm rounded-pill px-3 py-1 fw-bold text-white shadow-sm border-0 order-1 order-sm-2 bg-color-1"
                        >
                          Enviar respuesta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '20px' }}>
                <i className="bi bi-chat-dots fs-1 text-muted mb-3"></i>
                <h5 className="color-2">No hay reseñas aún</h5>
                <p className="text-muted small">
                  Cuando otros usuarios te califiquen, sus reseñas aparecerán aquí.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE MENSAJES */}
      <MensajeModal
        show={modal.show}
        onHide={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </>
  );
}

export default Reputacionv2;