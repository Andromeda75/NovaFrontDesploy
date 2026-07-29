import { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatearPrecio(precio) {
  if (precio == null || isNaN(precio)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
}

function VerificacionCard({ 
  id, 
  vendedor_id, 
  vendedor_nombre, 
  titulo,
  descripcion,
  precio_mxn,
  precio_inicial_mxn,
  puja_minima_mxn,
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
  cambiarEstado,
  esMegaSubasta,
  total_articulos,
  portada,
  articulos
}) {

  const esSubasta = filtro === "Subastas";
  
  // ✅ CORREGIDO: Forzar valores booleanos y numéricos para evitar undefined
  const esMegaSubastaValue = esMegaSubasta === true || esMegaSubasta === 1 || esMegaSubasta === "1";
  const totalArticulosValue = total_articulos || 0;
  const esMega = esMegaSubastaValue || (totalArticulosValue > 0);
  const listaArticulos = articulos || [];

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showArticuloModal, setShowArticuloModal] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const [indiceArticulo, setIndiceArticulo] = useState(0);
  const [indiceImagenArticulo, setIndiceImagenArticulo] = useState(0);
  
  const [accionConfirmar, setAccionConfirmar] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  const [errorObservaciones, setErrorObservaciones] = useState("");
  
  // Imagen principal (portada para MegaSubasta)
  const imagenPrincipal = esMega ? (portada || foto1_url || img1) : (foto1_url || img1);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(imagenPrincipal);
  const [indiceImagenActual, setIndiceImagenActual] = useState(0);

  // Todas las imágenes para el carrusel de la portada
  const todasLasImagenes = esMega 
    ? [portada, foto1_url, foto2_url, foto3_url].filter(Boolean)
    : [foto1_url || img1, foto2_url || img2, foto3_url || img3].filter(Boolean);

  const videoActual = video_url || video;
  const documentoActual = documento_url || documento;

  const obtenerPrecio = () => {
    if (esSubasta) {
      return precio_inicial_mxn || precio || 0;
    } else {
      return precio_mxn || precio || 0;
    }
  };

  const abrirPDF = (base64PDF) => {
    if (!base64PDF) return;
    try {
      const byteCharacters = atob(base64PDF.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Error abriendo PDF:', error);
      window.open(base64PDF, '_blank');
    }
  };

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

  // ========== FUNCIONES PARA MODAL DE ARTÍCULO ==========
  const abrirArticuloModal = (articulo, index) => {
    setArticuloSeleccionado(articulo);
    setIndiceArticulo(index);
    setIndiceImagenArticulo(0);
    setShowArticuloModal(true);
  };

  const cerrarArticuloModal = () => {
    setShowArticuloModal(false);
    setArticuloSeleccionado(null);
    setIndiceArticulo(0);
    setIndiceImagenArticulo(0);
  };

  const anteriorArticulo = () => {
    if (!listaArticulos.length) return;
    const nuevoIndice = indiceArticulo > 0 ? indiceArticulo - 1 : listaArticulos.length - 1;
    setIndiceArticulo(nuevoIndice);
    setArticuloSeleccionado(listaArticulos[nuevoIndice]);
    setIndiceImagenArticulo(0);
  };

  const siguienteArticulo = () => {
    if (!listaArticulos.length) return;
    const nuevoIndice = indiceArticulo < listaArticulos.length - 1 ? indiceArticulo + 1 : 0;
    setIndiceArticulo(nuevoIndice);
    setArticuloSeleccionado(listaArticulos[nuevoIndice]);
    setIndiceImagenArticulo(0);
  };

  const imagenArticuloAnterior = () => {
    if (!articuloSeleccionado) return;
    const imagenes = [articuloSeleccionado.foto1_url, articuloSeleccionado.foto2_url, articuloSeleccionado.foto3_url].filter(Boolean);
    const total = imagenes.length + (articuloSeleccionado.video_url ? 1 : 0);
    const nuevoIndice = indiceImagenArticulo > 0 ? indiceImagenArticulo - 1 : total - 1;
    setIndiceImagenArticulo(nuevoIndice);
  };

  const imagenArticuloSiguiente = () => {
    if (!articuloSeleccionado) return;
    const imagenes = [articuloSeleccionado.foto1_url, articuloSeleccionado.foto2_url, articuloSeleccionado.foto3_url].filter(Boolean);
    const total = imagenes.length + (articuloSeleccionado.video_url ? 1 : 0);
    const nuevoIndice = indiceImagenArticulo < total - 1 ? indiceImagenArticulo + 1 : 0;
    setIndiceImagenArticulo(nuevoIndice);
  };

  // ========== FUNCIONES DE VALIDACIÓN ==========
  const validarYConfirmar = () => {
    if (accionConfirmar === 'rechazar' && observaciones.trim().length < 5) {
      setErrorObservaciones('⚠️ Las observaciones deben tener al menos 5 caracteres');
      return;
    }
    if (accionConfirmar === 'rechazar' && observaciones.length > 500) {
      setErrorObservaciones('⚠️ Las observaciones no deben exceder los 500 caracteres');
      return;
    }
    setErrorObservaciones('');
    confirmarAccion();
  };

  const confirmarAccion = async () => {
    setShowConfirmModal(false);
    setShowModal(false);

    let nuevoEstado;

    if (esSubasta) {
      nuevoEstado = accionConfirmar === 'aprobar' ? 8 : 10;
    } else {
      nuevoEstado = accionConfirmar === 'aprobar' ? 4 : 6;
    }

    await cambiarEstado(id, nuevoEstado, accionConfirmar === 'rechazar' ? observaciones : '');
    
    setObservaciones("");
    setAccionConfirmar(null);
    setErrorObservaciones('');
  };

  const cancelarAccion = () => {
    setShowConfirmModal(false);
    setAccionConfirmar(null);
    setErrorObservaciones('');
  };

  const cerrarModal = () => {
    setShowModal(false);
    setImagenSeleccionada(imagenPrincipal);
    setIndiceImagenActual(0);
    setObservaciones("");
    setErrorObservaciones('');
  };

  const precioMostrar = obtenerPrecio();

  // Calcular total de imágenes del artículo
  const totalImagenesArticulo = (art) => {
    return [art.foto1_url, art.foto2_url, art.foto3_url].filter(Boolean).length;
  };

  // ========== CIERRE CON TECLA ESC ==========
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (showModal) cerrarModal();
        if (showArticuloModal) cerrarArticuloModal();
        if (showConfirmModal) cancelarAccion();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showModal, showArticuloModal, showConfirmModal]);

  return (
    <>
      {/* Card del artículo */}
<div className="card border-0 shadow-sm rounded-4 overflow-hidden">
  <div className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center position-relative" 
    style={{
      height: '200px', 
      backgroundImage: `url(${esMega ? (portada || foto1_url || img1 || '') : (foto1_url || img1 || '')})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#f0f0f0' 
    }}
  >
    {/* ✅ BADGE "Colección" - ESQUINA INFERIOR IZQUIERDA */}
    {esMega && (
      <span className="position-absolute bottom-0 start-0 m-2 px-3 py-1 d-flex align-items-center gap-2"
        style={{
          backgroundColor: '#f9e7ca',
          color: '#8d4925',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <i className="bi bi-collection" style={{ fontSize: '14px' }}></i>
        Colección
      </span>
    )}
  </div>

  <div className="px-3 py-3">
    {/* Categoría */}
    <small className="color-3 fw-bold d-block" style={{ fontSize: "11px" }}>
      {categoria || 'Sin categoría'}
    </small>

    {/* TÍTULO - "MegaSubasta" para Mega, título normal para subastas normales */}
    <h6 className="fw-bold color-1 mb-0">
      {esMega ? 'MegaSubasta' : (titulo || 'Sin título')}
    </h6>

    {/* ✅ CANTIDAD DE ARTÍCULOS - SIN FONDO, SOLO TEXTO */}
    {esMega && totalArticulosValue > 0 && (
      <p className="text-muted mb-3" style={{ fontSize: '12px' }}>
        {totalArticulosValue} artículos
      </p>
    )}

    <div className="border-top pt-3">
      <div className="d-flex justify-content-between">
        <small className="text-muted" style={{ fontSize: "11px" }}>
          {esSubasta ? "PUJA INICIAL" : "PRECIO"}
        </small>

        <small className="text-muted text-end" style={{ fontSize: "10px" }}>
          Por {vendedor_nombre || 'Usuario'}
        </small>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-1">
        <p className="fw-bold color-3 mb-0" style={{ fontSize: "14px" }}>
          {formatearPrecio(precioMostrar)}
        </p>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-sm btn-linear-gradient fw-bold border-0 rounded-3 px-2 py-1 d-flex align-items-center gap-1" 
          style={{ fontSize: "11px" }}
        >
          <i className="bi bi-eye-fill"></i>
          REVISAR
        </button>
      </div>
    </div>
  </div>
</div>

      {/* ========== MODAL PRINCIPAL DE REVISIÓN ========== */}
      {showModal && (
        <>
          <div className="modal d-block" tabIndex="-1" style={{backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content rounded-4 shadow overflow-hidden">
                <div className="modal-header border-0 pb-0">
                  <span className="mt-1 px-2 py-1 fw-bold d-flex align-items-center gap-1"
                    style={{
                      backgroundColor: "#fff3e0", 
                      color: "#e65100", 
                      border: "1px solid #e65100", 
                      borderRadius: "20px",
                      fontSize: "10px",
                      background: "rgba(255, 255, 255, 0.9)"
                    }}
                  >
                    <i className="bi bi-clock-history" style={{ fontSize: '10px' }}></i>
                    EN REVISIÓN
                  </span>
                  <button className="btn-close" onClick={cerrarModal}></button>
                </div>

                <div className="modal-body">
                  <div className="row g-4">
                    {/* ========== COLUMNA IZQUIERDA ========== */}
                    <div className="col-lg-6">
                      
                      {/* Portada */}
                      <div className="position-relative mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-images color-3"></i>
                          <small className="fw-bold color-2">
                            {esMega ? 'Portada de la colección' : 'Imagenes'}
                          </small>
                        </div>
                        <div className="bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center overflow-hidden rounded-4 position-relative" 
                          style={{ height: "250px", position: 'relative' }}
                        >
                          {imagenSeleccionada ? (
                            <img 
                              src={imagenSeleccionada} 
                              alt="Vista ampliada"
                              style={{ 
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <div className="text-muted">
                              <i className="bi bi-image fs-1"></i>
                              <p className="small">Sin imagen</p>
                            </div>
                          )}
                          
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
                              
                              <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 bg-dark bg-opacity-50 text-white rounded-pill px-2 py-1 small">
                                {indiceImagenActual + 1} / {todasLasImagenes.length}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* ========== MINIATURAS (SOLO PARA SUBASTAS NORMALES) ========== */}
                      {!esMega && todasLasImagenes.length > 0 && (
                        <div className="d-flex gap-3 mb-4">
                          {todasLasImagenes.map((img, index) => (
                            <div 
                              key={index}
                              className={`flex-fill bg-secondary bg-opacity-25 d-flex justify-content-center align-items-center overflow-hidden rounded-3 ${imagenSeleccionada === img ? 'border border-3 border-primary' : ''}`}
                              style={{ 
                                height: "80px", 
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
                      )}

                      {/* ========== OBRAS INCLUIDAS (SOLO MEGA) ========== */}
                      {esMega && listaArticulos.length > 0 && (
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold color-1 mb-0">
                              <i className="bi bi-collection me-2"></i>
                              Obras incluidas ({listaArticulos.length})
                            </h6>
                          </div>

                          <div className="d-flex flex-column gap-3">
                            {listaArticulos.map((articulo, index) => {
                              const imagenes = [
                                articulo.foto1_url,
                                articulo.foto2_url,
                                articulo.foto3_url
                              ].filter(Boolean);
                              const imagenPrincipalArt = imagenes[0] || null;

                              return (
                                <div 
                                  key={index} 
                                  className="card border-0 shadow-sm rounded-4 overflow-hidden cursor-pointer"
                                  style={{ 
                                    cursor: 'pointer', 
                                    transition: 'transform 0.2s',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    position: 'relative'
                                  }}
                                  onClick={() => abrirArticuloModal(articulo, index)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                                  }}
                                >
                                  <div className="d-flex flex-row">
                                    <div 
                                      className="flex-shrink-0 position-relative"
                                      style={{ 
                                        width: '120px',
                                        height: '120px',
                                        backgroundColor: '#f5f5f5',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      {imagenPrincipalArt ? (
                                        <img 
                                          src={imagenPrincipalArt} 
                                          alt={articulo.titulo}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                        />
                                      ) : (
                                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                          <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                                        </div>
                                      )}
                                    </div>

                                    <div 
                                      className="position-absolute bottom-0 end-0 m-2 d-flex align-items-center justify-content-center"
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: '#b0b0b0',
                                        borderRadius: '50%',
                                        zIndex: 5,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                      }}
                                    >
                                      <i 
                                        className="bi bi-chevron-right" 
                                        style={{ 
                                          fontSize: '16px',
                                          color: 'white',
                                        }}
                                      ></i>
                                    </div>

                                    <div className="card-body p-3 d-flex flex-column justify-content-between flex-grow-1" style={{ minWidth: 0 }}>
                                      <div>
                                        <div className="d-flex justify-content-between align-items-start">
                                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                            <h6 className="fw-bold color-1 mb-1" style={{ 
                                              fontSize: '14px',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}>
                                              {articulo.titulo || 'Sin título'}
                                            </h6>
                                          </div>
                                          {imagenes.length > 1 && (
                                            <span className="badge bg-light text-muted small flex-shrink-0">
                                              <i className="bi bi-images me-1"></i> {imagenes.length}
                                            </span>
                                          )}
                                        </div>
                                        <p className="small text-muted mb-0" style={{ 
                                          fontSize: '12px', 
                                          lineHeight: '1.4',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          wordBreak: 'break-word',
                                          overflowWrap: 'break-word',
                                          maxHeight: '2.8em'
                                        }}>
                                          {articulo.descripcion || 'Sin descripción'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ========== VIDEO Y DOCUMENTO (PARA SUBASTAS NORMALES) ========== */}
                      {!esMega && (
                        <div className="row g-3 mt-3">
                          <div className="col-12 col-lg-6">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <i className="bi bi-play-circle-fill color-3"></i>
                              <small className="fw-bold color-2">Video</small>
                            </div>
                            <div className="rounded-4 overflow-hidden shadow-sm border position-relative"
                              style={{ backgroundColor: '#f8f9fa', height: '220px' }}
                            >
                              {videoActual ? (
                                <video controls playsInline preload="metadata" className="w-100 h-100" style={{ objectFit: 'contain' }}>
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

                          <div className="col-12 col-lg-6">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <i className="bi bi-file-earmark-pdf-fill color-3"></i>
                              <small className="fw-bold color-2">Documento</small>
                            </div>
                            <div className="rounded-4 overflow-hidden shadow-sm border"
                              style={{ height: '220px', backgroundColor: '#f8f9fa' }}
                            >
                              {documentoActual ? (
                                <div className="position-relative h-100">
                                  <iframe src={`${documentoActual}#toolbar=0`} title="Vista previa PDF" width="100%" height="100%" style={{ border: 'none' }} />
                                  <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
                                    <button className="btn btn-sm btn-dark rounded-circle" onClick={() => abrirPDF(documentoActual)}>
                                      <i className="bi bi-arrows-fullscreen"></i>
                                    </button>
                                    <a href={documentoActual} download target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-danger rounded-circle">
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
                      )}
                    </div>

                    {/* ========== COLUMNA DERECHA ========== */}
                    <div className="col-lg-6">
                      
                      {/* TÍTULO */}
                      <h4 className="fw-bold color-2 mb-1">
                        {esMega ? 'MegaSubasta' : (titulo || 'Sin título')}
                      </h4>
                      
                      {/* Presentado por */}
                      <small className="fw-bold d-block mb-3 color-1">
                        Presentado por {vendedor_nombre || 'Usuario'}
                      </small>

                      {/* Cantidad de artículos (SOLO para Mega) */}
                      {esMega && listaArticulos.length > 0 && (
                        <p className="small text-muted mb-3">
                          {listaArticulos.length} artículos
                        </p>
                      )}

                      {/* Precios y duración */}
                      <div className="d-flex justify-content-between border-top pt-3 mt-3 color-1">
                        <div>
                          <small className="text-muted d-block fw-bold mb-1">
                            Precio inicial
                          </small>
                          <strong className="fs-5">{formatearPrecio(precioMostrar)}</strong>
                          {esSubasta && puja_minima_mxn > 0 && (
                            <div>
                              <small className="text-muted d-block fw-bold mt-1">Puja mínima</small>
                              <strong className="fs-6">{formatearPrecio(puja_minima_mxn)}</strong>
                            </div>
                          )}
                        </div>
                        <div className="text-end color-1">
                          <small className="text-muted d-block fw-bold mb-1">Duración</small>
                          <strong className="fs-5">{duracion || 'N/A'} hrs</strong>
                        </div>
                      </div>

                      {/* ========== OBSERVACIONES ========== */}
                      <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted fw-bold">
                            Observaciones del Administrador <span className="text-danger">*</span>
                          </small>
                          <small className={`fw-bold ${observaciones.length > 500 ? 'text-danger' : 'text-muted'}`}>
                            {observaciones.length}/500
                          </small>
                        </div>
                        
                        <textarea 
                          className={`form-control form-control-sm ${
                            (accionConfirmar === 'rechazar' && observaciones.trim().length < 5 && observaciones.length > 0) ||
                            (accionConfirmar === 'rechazar' && observaciones.length > 500)
                              ? 'is-invalid' 
                              : ''
                          }`}
                          rows="3" 
                          placeholder="Añade notas o razones del rechazo aquí..."
                          style={{ resize: 'none', borderRadius: '10px' }}
                          value={observaciones}
                          onChange={(e) => {
                            if (e.target.value.length <= 500) {
                              setObservaciones(e.target.value);
                            }
                          }}
                          maxLength="500"
                          required
                        />
                        
                        {accionConfirmar === 'rechazar' && observaciones.trim().length < 5 && observaciones.length > 0 && (
                          <div className="invalid-feedback" style={{ fontSize: '11px', display: 'block' }}>
                            <i className="bi bi-exclamation-circle me-1"></i>
                            Las observaciones deben tener al menos 5 caracteres
                          </div>
                        )}
                        
                        {accionConfirmar === 'rechazar' && observaciones.length > 500 && (
                          <div className="invalid-feedback" style={{ fontSize: '11px', display: 'block' }}>
                            <i className="bi bi-exclamation-circle me-1"></i>
                            Las observaciones no deben exceder los 500 caracteres
                          </div>
                        )}
                      </div>

                      {/* ========== BOTONES ========== */}
                      <div className="d-flex justify-content-end gap-3 mt-4">
                        <button 
                          className="btn btn-sm btn-success px-4 py-2" 
                          onClick={() => {
                            setErrorObservaciones('');
                            setAccionConfirmar('aprobar');
                            setShowConfirmModal(true);
                          }} 
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          APROBAR
                        </button>
                        <button 
                          className="btn btn-sm btn-danger px-4 py-2" 
                          onClick={() => {
                            if (observaciones.trim().length < 5) {
                              document.querySelector('textarea')?.focus();
                              setErrorObservaciones('⚠️ Las observaciones deben tener al menos 5 caracteres');
                              return;
                            }
                            if (observaciones.length > 500) {
                              document.querySelector('textarea')?.focus();
                              setErrorObservaciones('⚠️ Las observaciones no deben exceder los 500 caracteres');
                              return;
                            }
                            setErrorObservaciones('');
                            setAccionConfirmar('rechazar');
                            setShowConfirmModal(true);
                          }} 
                          style={{ borderRadius: '10px' }}
                        >
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

          {/* BACKDROP CON onClick PARA CERRAR */}
          <div className="modal-backdrop fade show" onClick={cerrarModal}></div>
        </>
      )}

      {/* ========== MODAL DE ARTÍCULO (MEGASUBASTA) ========== */}
      {showArticuloModal && articuloSeleccionado && (
        <>
          <div className="modal d-block" tabIndex="-1" style={{backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-4 shadow overflow-hidden">
                <div className="modal-header border-0 pb-0">
                  {/* Badge gris - SOLO SI ES MEGA Y HAY ARTÍCULOS */}
                  {esMega && listaArticulos.length > 0 && (
                    <span className="mt-1 px-2 py-1 fw-bold d-flex align-items-center gap-1"
                      style={{
                        backgroundColor: "#f8f9fa", 
                        color: "#6c757d", 
                        border: "1px solid #dee2e6", 
                        borderRadius: "20px",
                        fontSize: "10px",
                        background: "rgba(255, 255, 255, 0.9)"
                      }}
                    >
                      <i className="bi bi-collection me-1"></i>
                      Artículo {indiceArticulo + 1} de {listaArticulos.length}
                    </span>
                  )}
                  <button className="btn-close" onClick={cerrarArticuloModal}></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-4">
                    {/* Columna izquierda - Imágenes con miniaturas */}
                    <div className="col-lg-7">
                      <div className="position-relative">
                        <div 
                          className="bg-light rounded-4 d-flex align-items-center justify-content-center overflow-hidden"
                          style={{ height: '300px', backgroundColor: '#f8f9fa' }}
                        >
                          {articuloSeleccionado.foto1_url ? (
                            <img 
                              src={[
                                articuloSeleccionado.foto1_url,
                                articuloSeleccionado.foto2_url,
                                articuloSeleccionado.foto3_url
                              ].filter(Boolean)[indiceImagenArticulo] || articuloSeleccionado.foto1_url}
                              alt={articuloSeleccionado.titulo}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <div className="text-muted text-center">
                              <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                              <p className="mt-2 small">Sin imágenes</p>
                            </div>
                          )}
                        </div>

                        {/* Contador de imágenes */}
                        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-dark bg-opacity-50 text-white rounded-pill px-3 py-1 small">
                          {indiceImagenArticulo + 1} / {totalImagenesArticulo(articuloSeleccionado)}
                        </div>

                        {/* Flechas de navegación */}
                        {totalImagenesArticulo(articuloSeleccionado) > 1 && (
                          <>
                            <button
                              className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 shadow-sm d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px', zIndex: 10, border: 'none' }}
                              onClick={imagenArticuloAnterior}
                            >
                              <i className="bi bi-chevron-left" style={{ fontSize: '12px' }}></i>
                            </button>
                            <button
                              className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 shadow-sm d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px', zIndex: 10, border: 'none' }}
                              onClick={imagenArticuloSiguiente}
                            >
                              <i className="bi bi-chevron-right" style={{ fontSize: '12px' }}></i>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Miniaturas del artículo */}
                      <div className="d-flex gap-2 mt-2 overflow-auto pb-1" style={{ flexWrap: 'nowrap' }}>
                        {[articuloSeleccionado.foto1_url, articuloSeleccionado.foto2_url, articuloSeleccionado.foto3_url]
                          .filter(Boolean)
                          .map((img, idx) => (
                            <div
                              key={`img-${idx}`}
                              className={`rounded-3 overflow-hidden flex-shrink-0 cursor-pointer ${
                                idx === indiceImagenArticulo ? 'border border-2 border-warning' : 'border border-2 border-transparent'
                              }`}
                              style={{ width: '70px', height: '60px', backgroundColor: '#f5f5f5', cursor: 'pointer', transition: 'all 0.2s' }}
                              onClick={() => setIndiceImagenArticulo(idx)}
                            >
                              <img src={img} alt={`Imagen ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                      </div>

                      {/* VIDEO Y DOCUMENTO DEL ARTÍCULO */}
                      <div className="row g-3 mt-3">
                        <div className="col-12 col-lg-6">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <i className="bi bi-play-circle-fill color-3"></i>
                            <small className="fw-bold color-2">Video</small>
                          </div>
                          <div className="rounded-4 overflow-hidden shadow-sm border position-relative"
                            style={{ backgroundColor: '#f8f9fa', height: '220px' }}
                          >
                            {articuloSeleccionado.video_url ? (
                              <video controls playsInline preload="metadata" className="w-100 h-100" style={{ objectFit: 'contain' }}>
                                <source src={articuloSeleccionado.video_url} type="video/mp4" />
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

                        <div className="col-12 col-lg-6">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <i className="bi bi-file-earmark-pdf-fill color-3"></i>
                            <small className="fw-bold color-2">Documento</small>
                          </div>
                          <div className="rounded-4 overflow-hidden shadow-sm border"
                            style={{ height: '220px', backgroundColor: '#f8f9fa' }}
                          >
                            {articuloSeleccionado.documento_url ? (
                              <div className="position-relative h-100">
                                <iframe src={`${articuloSeleccionado.documento_url}#toolbar=0`} title="Vista previa PDF" width="100%" height="100%" style={{ border: 'none' }} />
                                <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
                                  <button className="btn btn-sm btn-dark rounded-circle" onClick={() => abrirPDF(articuloSeleccionado.documento_url)}>
                                    <i className="bi bi-arrows-fullscreen"></i>
                                  </button>
                                  <a href={articuloSeleccionado.documento_url} download target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-danger rounded-circle">
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

                    {/* Columna derecha - Información del artículo */}
                    <div className="col-lg-5">
                      <h5 className="fw-bold color-1 mb-2" style={{ fontSize: '20px' }}>
                        {articuloSeleccionado.titulo || 'Sin título'}
                      </h5>
                      
                      <div className="mb-3">
                        <h6 style={{ fontSize: '14px', color: '#9A5F25' }}>
                          {articuloSeleccionado.categoria || 'Sin categoría'}
                        </h6>
                      </div>

                      <div className="mb-3">
                        <h6 className="fw-bold color-1 mb-1" style={{ fontSize: '15px' }}>
                          Descripción
                        </h6>
                        <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                          {articuloSeleccionado.descripcion || 'Sin descripción'}
                        </p>
                      </div>

                      {/* Navegación entre artículos - SOLO SI ES MEGA Y HAY ARTÍCULOS */}
                      {esMega && listaArticulos.length > 0 && (
                        <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                          <button
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                            onClick={anteriorArticulo}
                            disabled={listaArticulos.length <= 1}
                          >
                            <i className="bi bi-chevron-left me-1"></i> Anterior
                          </button>
                          <span className="small text-muted align-self-center">
                            {indiceArticulo + 1} / {listaArticulos.length}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                            onClick={siguienteArticulo}
                            disabled={listaArticulos.length <= 1}
                          >
                            Siguiente <i className="bi bi-chevron-right ms-1"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BACKDROP CON onClick PARA CERRAR */}
          <div className="modal-backdrop fade show" onClick={cerrarArticuloModal}></div>
        </>
      )}

      {/* ========== MODAL DE CONFIRMACIÓN ========== */}
      {showConfirmModal && (
        <>
          <div className="modal d-block" tabIndex="-1" style={{backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                
                <div className="p-3 text-white text-center fw-bold" style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px" }}>
                  Confirmar {accionConfirmar === 'aprobar' ? 'aprobación' : 'rechazo'}
                </div>

                <div className="modal-body text-center p-5 bg-light">
                  
                  {errorObservaciones && (
                    <div className="alert alert-danger mb-4" style={{ fontSize: '14px' }}>
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {errorObservaciones}
                    </div>
                  )}

                  <div className="d-flex justify-content-center align-items-center mx-auto mb-4" 
                    style={{ 
                      width: "90px", 
                      height: "90px", 
                      backgroundColor: accionConfirmar === 'aprobar' ? '#d4edda' : '#f8d7da', 
                      borderRadius: "30px" 
                    }}
                  >
                    <i className={`bi ${accionConfirmar === 'aprobar' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} fs-1`}></i>
                  </div>
                  
                  <h3 className="fw-bold mb-3">
                    ¿{accionConfirmar === 'aprobar' ? 'Aprobar' : 'Rechazar'} {esSubasta ? 'Subasta' : 'Artículo'}?
                  </h3>
                  
                  <p className="text-muted mb-4">
                    {accionConfirmar === 'aprobar' 
                      ? esSubasta 
                        ? 'La subasta será publicada y estará visible para todos los usuarios.' 
                        : 'El artículo será publicado y estará visible para todos los usuarios.'
                      : esSubasta
                        ? 'La subasta será rechazada y se notificará al artista.'
                        : 'El artículo será rechazado y se notificará al artista.'}
                  </p>

                  {accionConfirmar === 'rechazar' && observaciones && (
                    <div className="alert alert-warning mb-4 text-start" style={{ fontSize: '14px' }}>
                      <strong>Observaciones:</strong> {observaciones}
                      <br />
                      <small className="text-muted">
                        ({observaciones.length} / 500 caracteres)
                      </small>
                    </div>
                  )}

                  <div className="d-flex flex-column gap-3">
                    <button className="btn-2" onClick={validarYConfirmar} 
                      style={{borderRadius: "30px", padding: "10px", border: "none" }}
                    >
                      {accionConfirmar === 'aprobar' ? 'Aprobar' : 'Rechazar'}
                    </button>
                    
                    <Button variant="outline-secondary" className="flex-grow-1 rounded-pill py-2" onClick={cancelarAccion} style={{ borderRadius: "30px" }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BACKDROP CON onClick PARA CERRAR */}
          <div className="modal-backdrop fade show" onClick={cancelarAccion}></div>
        </>
      )}
    </>
  );
}

export default VerificacionCard;