import React, { useState, useEffect } from 'react';
import { Modal, Card, Button } from 'react-bootstrap';
import SubastaCard from '../../../components/cards/subastas/SubastaCardR.jsx';
import { subastaService } from '../../../services/subastaService';
import MensajeModal from '../../../components/modals/MensajeModal';
import { useModal } from '../../../components/modals/useModal';

const MisSubastas = () => {
  const { modal, showModalMessage, hideModal } = useModal();
  const [paso, setPaso] = useState(1);
  const [tabActiva, setTabActiva] = useState("Activas");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [subastaAEliminar, setSubastaAEliminar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(true);
  const subastasPorPagina = 8;
  
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [subastaDetalle, setSubastaDetalle] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [indiceImagenActual, setIndiceImagenActual] = useState(0);
  
  const [subastas, setSubastas] = useState([]);

  const [subastaEditando, setSubastaEditando] = useState(null);
  const [modalEditando, setModalEditando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    precio: '',
    duracion: '72 Horas',
    pujaMinima: null,
    terminos: false,
    imagenes: [],
    video: null,
    documento: null
  });

  useEffect(() => {
    cargarSubastas();
  }, []);

  const cargarSubastas = async () => {
    setLoading(true);
    try {
      const data = await subastaService.getMisSubastas();
      setSubastas(data);
    } catch (error) {
      console.error('Error cargando subastas:', error);
    } finally {
      setLoading(false);
    }
  };

  const subastasFiltradas = subastas.filter((subasta) => {
    if (tabActiva === "Activas") {
      return subasta.estadoPrincipal === "ACTIVA";
    }
    if (tabActiva === "Programadas") {
      return subasta.estadoPrincipal === "EN ESPERA";
    }
    if (tabActiva === "Finalizadas") {
      return subasta.estadoPrincipal === "FINALIZADA";
    }
    return true;
  });

  const indiceUltimo = paginaActual * subastasPorPagina;
  const indicePrimero = indiceUltimo - subastasPorPagina;
  const subastasActuales = subastasFiltradas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(subastasFiltradas.length / subastasPorPagina);

  const puedeEditar = (subasta) => {
    return subasta.estadoPrincipal === "EN ESPERA" || 
           subasta.subEstado === "RECHAZADO";
  };
  
  const verDetalle = (subasta) => {
    setSubastaDetalle(subasta);
    setImagenSeleccionada(subasta.img1);
    setIndiceImagenActual(0);
    setShowDetalleModal(true);
  };
  const todasLasImagenes = subastaDetalle 
    ? [subastaDetalle.img1, subastaDetalle.img2, subastaDetalle.img3, subastaDetalle.video].filter(Boolean)
    : [];

  const imagenAnterior = () => {
    const nuevoIndice = indiceImagenActual > 0 ? indiceImagenActual - 1 : todasLasImagenes.length - 1;
    setIndiceImagenActual(nuevoIndice);
    setImagenSeleccionada(todasLasImagenes[nuevoIndice]);
  };

  const imagenSiguiente = () => {
    const nuevoIndice = indiceImagenActual < todasLasImagenes.length - 1 ? indiceImagenActual + 1 : 0;
    setIndiceImagenActual(nuevoIndice);
    setImagenSeleccionada(todasLasImagenes[nuevoIndice]);
  };

  const seleccionarImagen = (img, index) => {
    setImagenSeleccionada(img);
    setIndiceImagenActual(index);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setPaso(1);
    setSubastaEditando(null);
    setModalEditando(false);
    setFormData({
      titulo: '',
      categoria: '',
      descripcion: '',
      precio: '',
      duracion: '72 Horas',
      pujaMinima: null,
      terminos: false,
      imagenes: [],
      video: null,
      documento: null
    });
  };

  const handleOpenCreateModal = () => {
    setModalEditando(false);
    setPaso(1);
    setFormData({
      titulo: '',
      categoria: '',
      descripcion: '',
      precio: '',
      duracion: '72 Horas',
      pujaMinima: null,
      terminos: false,
      imagenes: [],
      video: null,
      documento: null
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePujaMinimaChange = (monto) => {
    setFormData(prev => ({
      ...prev,
      pujaMinima: prev.pujaMinima === monto ? null : monto
    }));
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showModalMessage('Atención', 'Por favor, selecciona un archivo de imagen válido', 'warning');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showModalMessage('Atención', 'La imagen no debe superar los 5MB', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => {
          const nuevasImagenes = [...prev.imagenes];
          nuevasImagenes[index] = reader.result;
          return {
            ...prev,
            imagenes: nuevasImagenes
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        showModalMessage('Atención', 'Por favor, selecciona un archivo de video válido', 'warning');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        showModalMessage('Atención', 'El video no debe superar los 50MB', 'warning');
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          showModalMessage('Atención', 'El video no debe durar más de 30 segundos', 'warning');
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            video: reader.result
          }));
        };
        reader.readAsDataURL(file);
      };

      video.src = URL.createObjectURL(file);
    }
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showModalMessage('Atención', 'Por favor, selecciona un archivo PDF válido', 'warning');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showModalMessage('Atención', 'El documento no debe superar los 10MB', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          documento: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  const handleEditar = (subasta) => {
    setSubastaEditando(subasta);
    setModalEditando(true);
    setPaso(1);
    setFormData({
      titulo: subasta.titulo || '',
      categoria: subasta.categoria || '',
      descripcion: subasta.descripcion || '',
      precio: subasta.precio ? subasta.precio.toString().replace(/,/g, '') : '',
      duracion: '72 Horas',
      pujaMinima: subasta.pujaMinima || null,
      terminos: true,
      imagenes: [subasta.img1, subasta.img2, subasta.img3].filter(Boolean),
      video: subasta.video || null,
      documento: null
    });
    setShowModal(true);
  };

  const handleEliminarClick = (id) => {
    setSubastaAEliminar(id);
    setShowDeleteModal(true);
  };

  const handleEliminarConfirm = async () => {
    if (subastaAEliminar) {
      try {
        await subastaService.eliminarSubasta(subastaAEliminar);
        await cargarSubastas();
        setShowDeleteModal(false);
        setSubastaAEliminar(null);
      } catch (error) {
        console.error('Error eliminando subasta:', error);
        showModalMessage('Error', 'Error al eliminar la subasta', 'error');
      }
    }
  };

  const handleGuardarEdicion = async () => {
    try {
      const categoriaMap = {
        'ARTE VISUAL': 1,
        'ARTE DIGITAL': 2,
        'FOTOGRAFÍA': 3,
        'ESCULTURA': 4,
        'ARTESANÍAS': 5,
        'COLECCIONABLES': 6
      };

      const dataToSend = {
        titulo: formData.titulo,
        categoria_id: categoriaMap[formData.categoria] || null,
        descripcion: formData.descripcion,
        precio_inicial: parseFloat(formData.precio) || 0,
        puja_minima: formData.pujaMinima || 0,
        duracion_horas: formData.duracion === '24 Horas' ? 24 : formData.duracion === '48 Horas' ? 48 : 72,
        imagenes: formData.imagenes,
        video: formData.video,
        documento: formData.documento
      };

      await subastaService.actualizarSubasta(subastaEditando.id, dataToSend);
      await cargarSubastas();
      handleCloseModal();
    } catch (error) {
      console.error('Error actualizando subasta:', error);
      showModalMessage('Error', 'Error al actualizar la subasta', 'error');
    }
  };

  const handleCrearSubasta = async () => {
    if (!formData.titulo.trim()) {
      showModalMessage('Atención', 'Por favor, ingresa un título para la obra', 'warning');
      return;
    }

    if (!formData.categoria) {
      showModalMessage('Atención', 'Por favor, selecciona una categoría', 'warning');
      return;
    }

    if (!formData.descripcion.trim()) {
      showModalMessage('Atención', 'Por favor, ingresa una descripción', 'warning');
      return;
    }

    if (formData.imagenes.length < 3) {
      setShowErrorModal(true);
      return;
    }

    if (!formData.terminos) {
      showModalMessage('Atención', 'Debes aceptar los términos y condiciones', 'warning');
      return;
    }

    const categoriaMap = {
      'ARTE VISUAL': 1,
      'ARTE DIGITAL': 2,
      'FOTOGRAFÍA': 3,
      'ESCULTURA': 4,
      'ARTESANÍAS': 5,
      'COLECCIONABLES': 6
    };

    const categoriaId = categoriaMap[formData.categoria];

    if (!categoriaId) {
      showModalMessage('Error', 'Categoría no válida', 'error');
      return;
    }

    const dataToSend = {
      titulo: formData.titulo.trim(),
      categoria_id: categoriaId,
      descripcion: formData.descripcion.trim(),
      precio_inicial: parseFloat(formData.precio) || 0,
      puja_minima: formData.pujaMinima || 0,
      duracion_horas: formData.duracion === '24 Horas' ? 24 : formData.duracion === '48 Horas' ? 48 : 72,
      imagenes: formData.imagenes,
      video: formData.video || null,
      documento: formData.documento || null
    };

    console.log('Enviando datos:', dataToSend);

    try {
      const response = await subastaService.crearSubasta(dataToSend);
      console.log('Respuesta:', response);
      await cargarSubastas();
      handleCloseModal();
      showModalMessage('¡Éxito!', 'Subasta creada exitosamente', 'success');
    } catch (error) {
      console.error('Error creando subasta:', error);
      console.error('Detalles del error:', error.response?.data);
      showModalMessage('Error', error.response?.data?.message || 'Error al crear la subasta', 'error');
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

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="fw-bold color-1 mb-0">Mis Subastas</h3>
                <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}>
                  Gestiona las ventas de tus subastas en vivo.
                </p>
              </div>
              <button 
                className="btn-linear-gradient py-2 px-4" 
                style={{ borderRadius: '8px' }} 
                onClick={handleOpenCreateModal}
              >
                <i className="bi bi-plus-lg"></i> Crear Subasta
              </button>
            </div>
            <div className="d-flex mb-4 p-1 gap-2 rounded-pill shadow-sm color-2"
              style={{ backgroundColor: '#f6d8a8', width: 'fit-content' }}>
              {["Activas", "Programadas", "Finalizadas"].map((tab) => (
                <button 
                  key={tab} 
                  className={`btn rounded-pill px-4 fw-bold small color-2 ${tabActiva === tab ? 'bg-white shadow-sm' : 'opacity-75'}`}
                  onClick={() => {
                    setTabActiva(tab);
                    setPaginaActual(1);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Cards - 4 por fila en desktop */}
            <div className="row g-3">
              {subastasActuales.length > 0 ? (
                subastasActuales.map((subasta) => (
                  <div key={subasta.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <SubastaCard
                      {...subasta}
                      onEditar={puedeEditar(subasta) ? () => handleEditar(subasta) : null}
                      onEliminar={handleEliminarClick}
                      puedeEditar={puedeEditar(subasta)}
                      onVerDetalle={() => verDetalle(subasta)}
                    />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">No hay subastas en esta categoría</p>
                </div>
              )}
            </div>

            {/* PAGINACIÓN */}
            {totalPaginas > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination pagination-sm">
                    <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setPaginaActual(paginaActual - 1)}
                        style={{ color: '#8d4925' }}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>

                    {[...Array(totalPaginas)].map((_, i) => (
                      <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setPaginaActual(i + 1)}
                          style={
                            paginaActual === i + 1 
                              ? { backgroundColor: '#8d4925', borderColor: '#8d4925', color: 'white' } 
                              : { color: '#8d4925' }
                          }
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setPaginaActual(paginaActual + 1)}
                        style={{ color: '#8d4925' }}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE DE SUBASTA - mantiene el mismo diseño */}
      <Modal 
        show={showDetalleModal} 
        onHide={() => setShowDetalleModal(false)}
        dialogClassName="modal-lg"
        centered
      >
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
          <div className="bg-white p-2 p-lg-5 py-lg-4">
            <button 
              className="btn p-0 mb-4 fw-bold border-0 bg-transparent d-flex align-items-center" 
              onClick={() => setShowDetalleModal(false)}
              style={{ color: '#8d4925' }}
              type="button"
            >
              <i className="bi bi-arrow-left me-2"></i> Volver
            </button>

            {subastaDetalle && (
              <div className="row g-4 text-start">
                <div className="col-lg-6">
                  {/* VISOR DE IMÁGENES */}
                  <div className="position-relative mb-3">
                    <div 
                      className="rounded-4 shadow-sm d-flex align-items-center justify-content-center overflow-hidden" 
                      style={{  
                        height: '300px',
                        backgroundColor: '#f8f9fa',
                        position: 'relative'
                      }}
                    >
                      {imagenSeleccionada ? (
                        imagenSeleccionada === subastaDetalle.video ? (
                          <video 
                            src={imagenSeleccionada} 
                            controls
                            style={{ 
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <img 
                            src={imagenSeleccionada} 
                            alt="Vista ampliada"
                            style={{ 
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        )
                      ) : (
                        <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                      )}
                    </div>
                    
                    {/* Flechas de navegación */}
                    {todasLasImagenes.length > 1 && (
                      <>
                        <button 
                          className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 shadow d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', zIndex: 10 }}
                          onClick={imagenAnterior}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        <button 
                          className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 shadow d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', zIndex: 10 }}
                          onClick={imagenSiguiente}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </>
                    )}
                    
                    {/* Indicador de imagen */}
                    <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 bg-dark bg-opacity-50 text-white rounded-pill px-3 py-1 small">
                      {indiceImagenActual + 1} / {todasLasImagenes.length}
                    </div>
                  </div>

                  {/* Miniaturas */}
                  <div className="row g-2">
                    {[subastaDetalle.img1, subastaDetalle.img2, subastaDetalle.img3].map((img, idx) => (
                      <div className="col-3" key={idx}>
                        <div 
                          className={`rounded-3 shadow-sm cursor-pointer overflow-hidden ${imagenSeleccionada === img ? 'border border-3 border-primary' : ''}`}
                          style={{ height: '70px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                          onClick={() => seleccionarImagen(img, idx)}
                        >
                          <img 
                            src={img} 
                            alt={`Imagen ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="col-3">
                      {subastaDetalle.video ? (
                        <div 
                          className={`rounded-3 shadow-sm cursor-pointer overflow-hidden d-flex flex-column align-items-center justify-content-center ${imagenSeleccionada === subastaDetalle.video ? 'border border-3 border-primary' : ''}`}
                          style={{ height: '70px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                          onClick={() => seleccionarImagen(subastaDetalle.video, 3)}
                        >
                          <i className="bi bi-camera-video-fill fs-2 text-secondary"></i>
                          <small className="text-muted" style={{ fontSize: '8px' }}>Video</small>
                        </div>
                      ) : (
                        <div className="rounded-3 shadow-sm d-flex flex-column align-items-center justify-content-center" style={{ height: '70px', backgroundColor: '#f8f9fa', opacity: 0.5 }}>
                          <i className="bi bi-camera-video-off fs-2 text-secondary"></i>
                          <small className="text-muted" style={{ fontSize: '8px' }}>Sin video</small>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h6 className="fw-bold color-1 mb-2">Descripción Detallada</h6>
                    <p className="text-muted small lh-base mb-4">
                      {subastaDetalle.descripcion}
                    </p>
                  </div>
                </div>
                              
                <div className="col-lg-6">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-light rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-hammer fs-3 text-secondary"></i>
                    </div>
                    <div>
                      <h6 className="m-0 fw-bold color-2">Subasta</h6>
                      <span className="px-3 py-1 fw-bold text-uppercase me-2" style={{
                        backgroundColor: "#6c757d", 
                        color: "white", 
                        borderRadius: "8px", 
                        fontSize: "12px"
                      }}>
                        <i className="bi bi-circle-fill me-1" style={{fontSize: '8px'}}></i> {subastaDetalle.estadoPrincipal}
                      </span>
                    </div>
                    <div className='ms-auto'>
                      <small className="color-2 fw-bold"> 
                        <i className="bi bi-people me-1 text-muted"></i> {subastaDetalle.pujas} Pujas
                      </small>
                    </div>
                  </div>

                  <span className="fw-bold color-3 mb-1" style={{ fontSize: '12px' }}>{subastaDetalle.categoria}</span>
                  <h2 className="fw-bold color-1 mb-2" style={{ fontSize: '28px' }}>{subastaDetalle.titulo}</h2>
                  
                  <div className="bg-light p-3 rounded-4 my-3 d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block small fw-bold">PUJA ACTUAL</small>
                      <h5 className="color-1 fw-bold m-0">${subastaDetalle.precio} MXN</h5>
                    </div>
                    <div className="text-end">
                      <small className="text-muted d-block small fw-bold">CIERRA EN</small>
                      <h5 className="text-muted fw-normal m-0">{subastaDetalle.tiempo || 'No disponible'}</h5>
                    </div>
                  </div>

                  <small className="text-center d-block text-muted fw-bold py-1">PUJA MÍNIMA: ${subastaDetalle.pujaMinima} MXN</small>

                  <Card className="border-0 shadow-sm rounded-4 p-4">
                    <h6 className="color-1 fw-bold mb-3">
                      <i className="bi bi-clock"></i> Historial de pujas
                    </h6>

                    {subastaDetalle.historialPujas?.length > 0 ? (
                      subastaDetalle.historialPujas.map((puja, idx) => (
                        <div key={idx} className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                          <div className="d-flex align-items-center">                   
                            <div className="bg-light rounded-circle me-2" style={{ width: '35px', height: '35px' }}></div>
                            <div>
                              <p className="m-0 small fw-bold">{puja.nombre}</p>
                              <small className="text-muted" style={{ fontSize: '10px' }}>{puja.tiempo}</small>
                            </div>
                          </div>
                          <span className="fw-bold color-1">{puja.precio}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted text-center small">No hay pujas aún</p>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de Crear/Editar Subasta - mantiene el mismo diseño */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        dialogClassName="modal-lg"
        contentClassName="border-0 shadow-lg overflow-hidden"
        centered
        style={{borderRadius: "25px"}}>
          <div className="p-4 text-center text-white" style={{ background: "linear-gradient(to right, #2a140a, #8d4925)" }}>
            <h2 className="fw-bold mb-1 fs-4">
              {modalEditando ? 'Editar obra maestra' : 'Publica tu obra maestra'}
            </h2>
            <p className="mb-0 small opacity-75">
              {modalEditando ? 'EDITAR SUBASTA' : 'CREAR NUEVA SUBASTA'}
            </p>
            <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
              {[1, 2, 3].map((num) => (
                <div 
                  key={num} 
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: "32px", 
                    height: "32px", 
                    fontSize: "0.85rem", 
                    backgroundColor: paso === num ? "#E8B767" : "white",
                    color: paso === num ? "white" : "#8d4925"
                  }}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-body p-4 bg-white" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {/* Paso 1: Información Básica */}
            {paso === 1 && (
              <div className="row g-3 animate__animated animate__fadeIn">
                <div className="col-12 text-start">
                  <h5 className="fw-bold mb-3 color-1">Información Básica</h5>

                  <div className="mb-3">
                    <label className="fw-bold mb-1 small color-2">Título de la Obra</label>
                    <input
                      type="text"
                      name="titulo"
                      className="form-control form-control-sm rounded-pill border-2"
                      placeholder="Ej: Escultura Orgánica de Nogal"
                      value={formData.titulo}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="fw-bold mb-1 small color-2">Categoría</label>
                    <select 
                      name="categoria"
                      className="form-select form-select-sm rounded-pill border-2"
                      value={formData.categoria}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecciona una categoría</option>
                      <option>ARTE VISUAL</option>
                      <option>ARTE DIGITAL</option>
                      <option>FOTOGRAFÍA</option>
                      <option>ESCULTURA</option>
                      <option>ARTESANÍAS</option>
                      <option>COLECCIONABLES</option>
                    </select>
                  </div>

                  <div>
                    <label className="fw-bold mb-1 small color-2">Descripción Detallada</label>
                    <textarea
                      name="descripcion"
                      className="form-control rounded-3 border-2 small"
                      rows="3"
                      placeholder="Cuéntanos la historia de tu pieza..."
                      value={formData.descripcion}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Multimedia */}
            {paso === 2 && (
              <div className="animate__animated animate__fadeIn text-start">
                <h5 className="fw-bold mb-1 color-1">Multimedia</h5>
                <p className="small text-muted mb-4">Fotos, video y certificado para verificación.</p>

                <div className="row g-4">
                  {/* Subir Fotos */}
                  <div className="col-md-6">
                    <div className="border rounded-4 p-4 bg-white shadow-sm" style={{ border: '1px solid #e0e0e0' }}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-light rounded-3 p-2">
                          <i className="bi bi-images fs-3 color-2"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1 color-1">Subir Fotos</h6>
                          <p className="text-muted small mb-0">Mínimo 3 fotos de alta resolución</p>
                        </div>
                      </div>
                      
                      <div className="row g-2">
                        {[0, 1, 2].map((index) => (
                          <div className="col-4" key={index}>
                            <div
                              className="border rounded-3 position-relative"
                              style={{ 
                                height: "80px",
                                backgroundImage: formData.imagenes[index] ? `url(${formData.imagenes[index]})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundColor: formData.imagenes[index] ? 'transparent' : '#f8f9fa',
                                cursor: formData.imagenes[index] ? 'default' : 'pointer',
                                overflow: 'hidden'
                              }}
                            >
                              {formData.imagenes[index] ? (
                                <>
                                  <img 
                                    src={formData.imagenes[index]} 
                                    alt={`Foto ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                  <button 
                                    type="button"
                                    className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                                    style={{ width: '22px', height: '22px', padding: 0, zIndex: 2 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(index);
                                    }}
                                  >
                                    <i className="bi bi-x small"></i>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="position-absolute w-100 h-100 opacity-0"
                                    style={{ top: 0, left: 0, cursor: 'pointer', zIndex: 2 }}
                                    onChange={(e) => handleImageUpload(e, index)}
                                  />
                                  <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
                                    <i className="bi bi-plus-circle fs-5 color-2"></i>
                                    <small className="text-muted" style={{ fontSize: "0.6rem" }}>Foto {index + 1}</small>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Video de Verificación */}
                  <div className="col-md-6">
                    <div className="border rounded-4 p-4 bg-white shadow-sm" style={{ border: '1px solid #e0e0e0' }}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-light rounded-3 p-2">
                          <i className="bi bi-camera-video fs-3 color-2"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1 color-1">Video de Verificación</h6>
                          <p className="text-muted small mb-0">Obligatorio (máx. 30 seg)</p>
                        </div>
                      </div>
                      
                      <div
                        className="border rounded-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative"
                        style={{ 
                          height: "80px",
                          backgroundColor: formData.video ? '#e8f5e9' : '#f8f9fa',
                          cursor: formData.video ? 'default' : 'pointer',
                          overflow: 'hidden'
                        }}
                      >
                        {formData.video ? (
                          <>
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-check-circle-fill text-success"></i>
                              <span className="text-muted small">Video cargado</span>
                            </div>
                            <button 
                              type="button"
                              className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                              style={{ width: '22px', height: '22px', padding: 0 }}
                              onClick={() => setFormData(prev => ({...prev, video: null}))}
                            >
                              <i className="bi bi-x small"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="video/*"
                              className="position-absolute w-100 h-100 opacity-0"
                              style={{ top: 0, left: 0, cursor: 'pointer' }}
                              onChange={handleVideoUpload}
                            />
                            <i className="bi bi-upload fs-5 color-2"></i>
                            <small className="text-muted">Haz clic para subir</small>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Documento PDF */}
                  <div className="col-md-12">
                    <div className="border rounded-4 p-4 bg-white shadow-sm" style={{ border: '1px solid #e0e0e0' }}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-light rounded-3 p-2">
                          <i className="bi bi-file-pdf fs-3 color-2"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1 color-1">Documento</h6>
                          <p className="text-muted small mb-0">Certificado / Constancia (PDF)</p>
                        </div>
                      </div>
                      
                      <div
                        className="border rounded-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative"
                        style={{ 
                          height: "80px",
                          backgroundColor: formData.documento ? '#e8f5e9' : '#f8f9fa',
                          cursor: formData.documento ? 'default' : 'pointer'
                        }}
                      >
                        {formData.documento ? (
                          <>
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                              <span className="text-muted small">PDF cargado</span>
                            </div>
                            <button 
                              type="button"
                              className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                              style={{ width: '22px', height: '22px', padding: 0 }}
                              onClick={() => setFormData(prev => ({...prev, documento: null}))}
                            >
                              <i className="bi bi-x small"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept=".pdf"
                              className="position-absolute w-100 h-100 opacity-0"
                              style={{ top: 0, left: 0, cursor: 'pointer' }}
                              onChange={handleDocumentUpload}
                            />
                            <i className="bi bi-upload fs-5 color-2"></i>
                            <small className="text-muted">Haz clic para subir</small>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {formData.imagenes.length < 3 && (
                  <div className="alert alert-warning mt-4 small rounded-3" style={{ border: '1px solid #ffeeba', background:"#fff3cd" }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Debes subir al menos <strong>3 fotos</strong> para continuar
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Precio y Duración */}
            {paso === 3 && (
              <div className="animate__animated animate__fadeIn text-start">
                <h5 className="fw-bold mb-1 color-1">Precio y Duración</h5>

                <div className="row mb-4">
                  <div className="col-6">
                    <label className="fw-bold mb-1 small color-2">Precio Inicial (MXN)</label>
                    <input
                      type="text"
                      name="precio"
                      className="form-control p-3 border-color-1"
                      placeholder="$ 0.00"
                      value={formData.precio}
                      onChange={handleInputChange}
                      style={{ borderRadius: "12px" }}
                    />
                  </div>

                  <div className="col-6">
                    <label className="fw-bold mb-1 small color-2">Duración de la Subasta</label>
                    <div className="input-group">
                      <span className="input-group-text border-color-1 bg-light" style={{ borderRadius: "12px 0 0 12px" }}>
                        <i className="bi bi-calendar-event"></i>
                      </span>
                      <select 
                        name="duracion"
                        className="form-select p-3 border-color-1"
                        value={formData.duracion}
                        onChange={handleInputChange}
                      >
                        <option>72 Horas</option>
                        <option>48 Horas</option>
                        <option>24 Horas</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="terminos"
                    name="terminos"
                    checked={formData.terminos}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label small fw-bold color-2" htmlFor="terminos">
                    Acepto los términos de la subasta y las comisiones de la plataforma (3%)
                  </label>
                </div>

                <label className="fw-bold mb-2 small color-2">Puja Mínima (selecciona una)</label>
                <div className="d-flex gap-4 mb-3 flex-wrap">
                  {[200, 500, 1000, 1500, 2000].map((monto, index) => (
                    <div key={index} className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`puja${index}`}
                        checked={formData.pujaMinima === monto}
                        onChange={() => handlePujaMinimaChange(monto)}
                      />
                      <label className="form-check-label small color-2" htmlFor={`puja${index}`}>
                        $ {monto.toLocaleString("es-MX")}.00
                      </label>
                    </div>
                  ))}
                </div>

                <div
                  className="alert py-2 px-3 small border-0 color-2"
                  style={{ backgroundColor: "#f6d8a8", borderRadius: "12px" }}
                >
                  <h6 className="fw-bold mb-1">
                    <i className="bi bi-shield-check me-2"></i>
                    Tu seguridad es nuestra prioridad
                  </h6>
                  <p className="mb-0">
                    Todos los artículos pasan por un proceso de verificación manual.
                    Una vez aprobado, recibirás una notificación y tu pieza aparecerá
                    en el feed principal.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-0 p-3 d-flex justify-content-between">
            {paso > 1 ? (
              <button
                className="btn-linear-gradient py-2 px-3"
                style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                onClick={() => setPaso(paso - 1)}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Anterior
              </button>
            ) : (
              <button
                className="btn-linear-gradient py-2 px-3"
                style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
            )}

            {paso < 3 ? (
              <button
                className="btn-linear-gradient py-2 px-3"
                style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                onClick={() => {
                  if (paso === 2 && formData.imagenes.length < 3) {
                    setShowErrorModal(true);
                  } else {
                    setPaso(paso + 1);
                  }
                }}
              >
                Siguiente
                <i className="bi bi-arrow-right ms-1"></i>
              </button>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <span className="badge px-3 py-2 rounded-pill fw-bold small color-2" style={{ backgroundColor: "#f6d8a8" }}>
                  - 50 Tickets
                </span>
                <button
                  className="btn-linear-gradient py-2 px-3"
                  style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                  onClick={modalEditando ? handleGuardarEdicion : handleCrearSubasta}
                >
                  {modalEditando ? 'Guardar Cambios' : 'Publicar'}
                  <i className="bi bi-check-lg ms-1"></i>
                </button>
              </div>
            )}
          </div>
      
      </Modal>

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="rounded-5">
        <div className="p-3 text-white text-center fw-bold rounded-top-5" 
          style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px"}}>
          Confirmar eliminación
        </div>

        <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
          <div className="d-flex justify-content-center align-items-center mx-auto mb-4" style={{width: "90px", height: "90px", backgroundColor: "#f8d7da", borderRadius: "30px"}}>
            <i className="bi bi-trash fs-1 text-danger"></i>
          </div>

          <h3 className="mb-3" style={{fontSize:"18px"}}>
            ¿Estás seguro de que deseas eliminar la Subasta?
          </h3>    
          <p className="text-muted mb-4">Esta acción no se puede deshacer.</p>

          <div className="d-flex flex-column gap-3">
            <button 
              onClick={handleEliminarConfirm} 
              className="btn-2" 
              style={{ borderRadius: "30px", padding: "10px", border: "none", color: "white" }}
            >
              Eliminar
            </button>
            <Button  variant="outline-secondary"
                    className="flex-grow-1 rounded-pill py-2" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* MODAL DE ERROR PARA IMÁGENES */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered contentClassName="rounded-5">
        <div className="p-3 text-white text-center fw-bold rounded-top-5" 
          style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px"}}>
          Imágenes insuficientes
        </div>

        <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
          <div className="d-flex justify-content-center align-items-center mx-auto mb-4" style={{width: "90px", height: "90px", backgroundColor: "#fff3cd", borderRadius: "30px"}}>
            <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
          </div>

          <h3 className="mb-3" style={{fontSize:"18px"}}>
            Faltan imágenes por subir
          </h3>    
          <p className="text-muted mb-4">
            Debes subir al menos 3 imágenes de tu obra antes de continuar.
            <br />
            <strong>Has subido: {formData.imagenes.length} de 3</strong>
          </p>

          <div className="d-flex flex-column gap-3">
            <button 
              onClick={() => setShowErrorModal(false)} 
              className="btn-2" 
              style={{ borderRadius: "30px", padding: "10px", border: "none", color: "white" }}
            >
              Entendido
            </button>
          </div>
        </Modal.Body>
      </Modal>

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
};

export default MisSubastas;