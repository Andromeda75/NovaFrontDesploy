// Vistas_s.jsx (Componente Card con Modal)
import { useState } from "react";
import { Button } from 'react-bootstrap';

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function VerificacionCard({ 
  id, 
  vendedor_id, 
  vendedor_nombre, 
  titulo,
  descripcion,
  precio_mxn,
  foto1_url,
  foto2_url,
  foto3_url,
  video_url,
  documento_url,
  precio,
  img1,
  img2,
  img3,
  video,
  documento,
  categoria, 
  fecha_publicacion,
  duracion,
  filtro,
  cambiarEstado }) {

  // Determinar si es SUBASTA o ARTÍCULO
  const esSubasta = filtro === "Subastas";

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState(null); // 'aprobar' o 'rechazar'
  const [observaciones, setObservaciones] = useState("");
  
  // Estados para el visor de imágenes
  const [imagenSeleccionada, setImagenSeleccionada] = useState(esSubasta ? img1 : foto1_url);
  const [indiceImagenActual, setIndiceImagenActual] = useState(0);

  // Crear array de todas las imágenes (simuladas con la misma imagen por ahora)
  // En un caso real, usarías articulo.imagenes o similar
  const todasLasImagenes = [
    foto1_url || img1,
    foto2_url || img2, // Simulamos segunda imagen
    foto3_url || img3, // Simulamos tercera imagen
  ].filter(Boolean);

  // console.log({
  //   esSubasta,
  //   fecha_publicacion,
  //   duracion
  // });

  const videoActual = esSubasta ? video : video_url;
  const documentoActual = esSubasta ? documento : documento_url;

  const abrirPDF = (base64PDF) => {

    // Convertir Base64 a bytes
    const byteCharacters = atob(base64PDF.split(',')[1]);

    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Crear Blob PDF
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Crear URL temporal
    const fileURL = URL.createObjectURL(blob);

    // Abrir PDF
    window.open(fileURL, '_blank');
  };

  // Funciones para el visor de imágenes
  const seleccionarImagen = (img, index) => {
    setImagenSeleccionada(img);
    setIndiceImagenActual(index);
  };

  const imagenAnterior = (e) => {
    e.stopPropagation();
    const nuevoIndice = indiceImagenActual > 0 ? indiceImagenActual - 1 : todasLasImagenes.length - 1;
    setIndiceImagenActual(nuevoIndice);
    setImagenSeleccionada(todasLasImagenes[nuevoIndice]);
  };

  const imagenSiguiente = (e) => {
    e.stopPropagation();
    const nuevoIndice = indiceImagenActual < todasLasImagenes.length - 1 ? indiceImagenActual + 1 : 0;
    setIndiceImagenActual(nuevoIndice);
    setImagenSeleccionada(todasLasImagenes[nuevoIndice]);
  };

  // Función para manejar la acción (aprobar o rechazar)
  const manejarAccion = (accion) => {
    setAccionConfirmar(accion);
    setShowConfirmModal(true);
  };

  // Función para confirmar la acción
  const confirmarAccion = () => {
    // Aquí puedes hacer algo con las observaciones si es necesario
    console.log(`Artículo ${accionConfirmar === 'aprobar' ? 'aprobado' : 'rechazado'} con observaciones:`, observaciones);
    
    // Cerrar modales
    setShowConfirmModal(false);
    setShowModal(false);

    let nuevoEstado;

    if (esSubasta) {
      nuevoEstado = accionConfirmar === 'aprobar' ? 8 : 10;
    } else {
      nuevoEstado = accionConfirmar === 'aprobar' ? 4 : 6;
    }

    cambiarEstado(id, nuevoEstado);
    
    // Resetear observaciones
    setObservaciones("");
    setAccionConfirmar(null);
  };

  // Función para cancelar la acción
  const cancelarAccion = () => {
    setShowConfirmModal(false);
    setAccionConfirmar(null);
    // No resetear observaciones para mantener lo escrito si vuelve a abrir
  };

  // Función para obtener el color del badge según el tipo
  const getBadgeStyle = () => {
    if (esSubasta) {
      return {
        bg: "bg-success bg-opacity-10",
        color: "text-success",
        border: "border-success"
      };
    } else {
      return {
        bg: "bg-success bg-opacity-10",
        color: "text-success",
        border: "border-success"
      };
    }
  };

  const badgeStyle = getBadgeStyle();

  // Resetear imagen seleccionada al cerrar el modal
  const cerrarModal = () => {
    setShowModal(false);
    setImagenSeleccionada(esSubasta ? img1 : foto1_url);
    setIndiceImagenActual(0);
  };

  return (
    <>
      {/* Card del artículo */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* <div className="px-3 pt-3 pb-2">
          <span className={`badge rounded-pill ${badgeStyle.bg} ${badgeStyle.color} border ${badgeStyle.border}`} style={{ fontSize: "12px" }}>
            {esSubasta ? "SUBASTA" : "ARTICULO"}
          </span>
        </div> */}

        <div className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ 
          height: '200px',
          backgroundImage: `url(${esSubasta ? img1 : foto1_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#f0f0f0' 
        }}>
        </div>

        <div className="px-3 py-3">
          <small className="color-3 fw-bold d-block" style={{ fontSize: "11px" }}>
            {categoria}
          </small>

          <h6 className="fw-bold color-1 mb-3">
            {titulo}
          </h6>

          <div className="border-top pt-3">
            <div className="d-flex justify-content-between">
              <small className="text-muted" style={{ fontSize: "11px" }}>
                {esSubasta ? "PUJA INICIAL" : "PRECIO"}
              </small>

              <small className="text-muted text-end" style={{ fontSize: "10px" }}>
                Por {vendedor_nombre}
              </small>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-1">
              <p className="fw-bold color-3 mb-0" style={{ fontSize: "14px" }}>
                ${esSubasta ? precio : precio_mxn} MXN
              </p>
              <button onClick={() => setShowModal(true)} className="btn btn-sm btn-linear-gradient fw-bold border-0 rounded-3 px-2 py-1 d-flex align-items-center gap-1" 
                style={{ fontSize: "11px" }}>
                <i className="bi bi-eye-fill"></i>
                REVISAR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Revisión con VISOR DE IMÁGENES */}
      {showModal && (
        <>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content rounded-4 shadow overflow-hidden">
                <div className="modal-header border-0 pb-0">
                  <span className="mt-1 px-2 py-1 fw-bold" style={{ backgroundColor: "#ff6e2070", borderRadius: "20px", fontSize: "15px", color: "#b23e00" }}>
                    EN REVISIÓN
                  </span>
                  <button className="btn-close" onClick={cerrarModal}></button>
                </div>

                <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      {/* VISOR DE IMÁGENES CON FLECHAS */}
                      <div className="position-relative">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <i className="bi bi-images color-3"></i>
                            <small className="fw-bold color-2">
                              Imagenes
                            </small>
                          </div>
                        {/* Imagen principal con flechas */}
                        <div className="bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center overflow-hidden rounded-4 position-relative" 
                             style={{ height: "220px", position: 'relative' }}>
                          <img 
                            src={imagenSeleccionada} 
                            alt="Vista ampliada"
                            style={{ 
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                          
                          {/* Flechas de navegación */}
                          {todasLasImagenes.length > 1 && (
                            <>
                              <button 
                                className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 shadow d-flex align-items-center justify-content-center"
                                style={{ width: '35px', height: '35px', zIndex: 10, padding: 0 }}
                                onClick={imagenAnterior}
                              >
                                <i className="bi bi-chevron-left"></i>
                              </button>
                              <button 
                                className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 shadow d-flex align-items-center justify-content-center"
                                style={{ width: '35px', height: '35px', zIndex: 10, padding: 0 }}
                                onClick={imagenSiguiente}
                              >
                                <i className="bi bi-chevron-right"></i>
                              </button>
                              
                              {/* Indicador de imagen actual */}
                              <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 bg-dark bg-opacity-50 text-white rounded-pill px-2 py-1 small">
                                {indiceImagenActual + 1} / {todasLasImagenes.length}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Miniaturas interactivas */}
                      <div className="d-flex gap-3 mt-3">
                        {todasLasImagenes.map((img, index) => (
                          <div 
                            key={index}
                            className={`flex-fill bg-secondary bg-opacity-25 d-flex justify-content-center align-items-center overflow-hidden rounded-3 ${imagenSeleccionada === img ? 'border border-3 border-primary' : ''}`}
                            style={{ 
                              height: "100px", 
                              cursor: 'pointer'
                            }}
                            onClick={() => seleccionarImagen(img, index)}
                          >
                            <img 
                              src={img} 
                              alt={`Miniatura ${index + 1}`}
                              style={{ 
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                     {/* VIDEO + DOCUMENTO */}
                    <div className="row g-3 mt-1">

                      {/* VIDEO */}
                      <div className="col-12 col-lg-6">

                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-play-circle-fill color-3"></i>
                          <small className="fw-bold color-2">
                            Video
                          </small>
                        </div>

                        <div
                          className="rounded-4 overflow-hidden shadow-sm border position-relative"
                          style={{
                            backgroundColor: '#f8f9fa',
                            height: '220px'
                          }}
                        >

                          {videoActual ? (
                            <video
                              controls
                              playsInline
                              preload="metadata"
                              className="w-100 h-100"
                              style={{
                                objectFit: 'contain'
                              }}
                            >
                              <source src={videoActual} type="video/mp4" />
                              Tu navegador no soporta videos.
                            </video>
                          ) : (
                            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                              <i className="bi bi-camera-video-off fs-1 mb-2"></i>
                              <small>No hay video disponible</small>
                            </div>
                          )}

                        </div>

                      </div>

                      {/* PDF */}
                      <div className="col-12 col-lg-6">

                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-file-earmark-pdf-fill color-3"></i>
                          <small className="fw-bold color-2">
                            Documento
                          </small>
                        </div>

                        <div
                          className="rounded-4 overflow-hidden shadow-sm border"
                          style={{
                            height: '220px',
                            backgroundColor: '#f8f9fa'
                          }}
                        >

                          {documentoActual ? (

                            <div className="position-relative h-100">

                              <iframe
                                src={`${documentoActual}#toolbar=0`}
                                title="Vista previa PDF"
                                width="100%"
                                height="100%"
                                style={{
                                  border: 'none'
                                }}
                              />

                              <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">

                                <button
                                  className="btn btn-sm btn-dark rounded-circle"
                                  onClick={() => abrirPDF(documentoActual, '_blank')}
                                >
                                  <i className="bi bi-arrows-fullscreen"></i>
                                </button>

                                <a
                                  href={documentoActual}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-danger rounded-circle"
                                >
                                  <i className="bi bi-download"></i>
                                </a>

                              </div>

                            </div>


                          ) : (

                            <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">
                              <i className="bi bi-file-earmark-x fs-1 mb-2"></i>
                              <small>No hay archivo disponible</small>
                            </div>

                          )}

                        </div>

                      </div>

                    </div>


                    </div>

                    <div className="col-md-6">
                      <h5 className="fw-bold mb-2 color-2">
                        {titulo}
                      </h5>
                      <small className="fw-bold d-block mb-3 color-1">
                        Presentado por {vendedor_nombre}
                      </small>

                      <p className="small text-muted mb-4">
                        {descripcion}
                      </p>

                      <div className="d-flex justify-content-between border-top pt-3 mt-3 color-1">
                        <div>
                          <small className="text-muted d-block fw-bold mb-1">
                            {esSubasta ? "Precio inicial" : "Precio"}
                          </small>
                          <strong className="fs-5">${esSubasta ? precio : precio_mxn} MXN</strong>
                        </div>
                        <div className="text-end color-1">
                          {esSubasta ? (
                            <>
                              <small className="text-muted d-block fw-bold mb-1">Duración</small>
                              <strong className="fs-5">{duracion} hrs</strong>
                            </>
                          ) : (
                            <>
                              <small className="text-muted d-block fw-bold mb-1">Publicación</small>
                              <strong className="fs-6">{formatearFecha(fecha_publicacion)}</strong>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <small className="text-muted d-block mb-2 fw-bold">
                          Observaciones del Administrador
                        </small>
                        <textarea 
                          className="form-control form-control-sm" 
                          rows="3" 
                          placeholder="Añade notas o razones del rechazo aquí..."
                          style={{ resize: 'none', borderRadius: '10px' }}
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                        >
                        </textarea>
                      </div>

                      <div className="d-flex justify-content-end gap-3 mt-4">
                        <button className="btn btn-sm btn-success px-4 py-2" onClick={() => manejarAccion('aprobar')} style={{ borderRadius: '10px' }}>
                          <i className="bi bi-check-circle me-2"></i>
                          APROBAR
                        </button>
                        <button className="btn btn-sm btn-danger px-4 py-2" onClick={() => manejarAccion('rechazar')} style={{ borderRadius: '10px' }}>
                          <i className="bi bi-x-circle me-2"></i>
                          RECHAZAR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FONDO OSCURO */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                
                {/* HEADER con gradiente */}
                <div className="p-3 text-white text-center fw-bold" style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px" }}>
                  Confirmar {accionConfirmar === 'aprobar' ? 'aprobación' : 'rechazo'}
                </div>

                {/* BODY */}
                <div className="modal-body text-center p-5 bg-light">
                  
                  {/* ICONO */}
                  <div className="d-flex justify-content-center align-items-center mx-auto mb-4" 
                      style={{ 
                        width: "90px", 
                        height: "90px", 
                        backgroundColor: accionConfirmar === 'aprobar' ? '#d4edda' : '#f8d7da', 
                        borderRadius: "30px" 
                      }}>
                    <i className={`bi ${accionConfirmar === 'aprobar' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} fs-1`}></i>
                  </div>
                  
                  {/* TÍTULO */}
                  <h3 className="fw-bold mb-3">
                    ¿{accionConfirmar === 'aprobar' ? 'Aprobar' : 'Rechazar'} {esSubasta ? 'Subasta' : 'Artículo'}?
                  </h3>
                  
                  {/* TEXTO DESCRIPTIVO */}
                  <p className="text-muted mb-4">
                    {accionConfirmar === 'aprobar' 
                      ? esSubasta 
                        ? 'La subasta será publicada y estará visible para todos los usuarios.' 
                        : 'El artículo será publicado y estará visible para todos los usuarios.'
                      : esSubasta
                        ? 'La subasta será rechazada y se notificará al artista.'
                        : 'El artículo será rechazado y se notificará al artista.'}
                  </p>

                  {/* OBSERVACIONES - si aplica */}
                  {accionConfirmar === 'rechazar' && observaciones && (
                    <div className="alert alert-warning mb-4 text-start" style={{ fontSize: '14px' }}>
                      <strong>Observaciones:</strong> {observaciones}
                    </div>
                  )}

                  {/* BOTONES */}
                  <div className="d-flex flex-column gap-3">
                    
                    {/* BOTÓN PRINCIPAL */}
                    <button className="btn-2" onClick={confirmarAccion} 
                      style={{borderRadius: "30px", padding: "10px", border: "none" }}>
                      {accionConfirmar === 'aprobar' ? 'Aprobar' : 'Rechazar'}
                    </button>
                    
                    {/* BOTÓN SECUNDARIO */}
                    <Button variant="outline-secondary" className="flex-grow-1 rounded-pill py-2" onClick={cancelarAccion} style={{ borderRadius: "30px" }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FONDO OSCURO */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}

export default VerificacionCard;