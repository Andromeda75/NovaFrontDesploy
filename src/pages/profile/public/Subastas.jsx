import React, { useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import { Modal, Card, Button } from 'react-bootstrap';
import SubastaCard from '../../../components/cards/subastas/SubastaCardR.jsx';
import { subastaService } from '../../../services/subastaService';
import MensajeModal from '../../../components/modals/MensajeModal';
import { useModal } from '../../../components/modals/useModal';

// Función para formatear precios
function formatearPrecio(precio) {
    if (precio == null || isNaN(precio)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(precio);
}

const MisSubastas = () => {
  const { modal, showModalMessage, hideModal } = useModal();
  const [paso, setPaso] = useState(1);
  const [tabActiva, setTabActiva] = useState("activos");
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

  const [tipoSubasta, setTipoSubasta] = useState(null);
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [ticketsUsuario, setTicketsUsuario] = useState(50);

  const [subastaEditando, setSubastaEditando] = useState(null);
  const [modalEditando, setModalEditando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    categoriaId: null,
    categoriaMega: '',
    descripcion: '',
    precio: '',
    duracion: '',
    duracionPersonalizada: 0,
    pujaMinima: null,
    imagenes: [],
    video: null,
    documento: null,
    articulos: [],
    esMegaSubasta: false,
    portada: null
  });

  // Estado para el modal de validación
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Estados para el modal de artículos de MegaSubasta
  const [showArticuloModal, setShowArticuloModal] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const [indiceArticuloModal, setIndiceArticuloModal] = useState(0);
  const [indiceImagenArticulo, setIndiceImagenArticulo] = useState(0);

useEffect(() => {
    const user = authService.getCurrentUser();
    console.log('👤 Usuario actual en Subastas.jsx:', user);
    console.log('👤 ID del usuario:', user?.id);
    console.log('👤 Tipo de ID:', typeof user?.id);
    
    cargarSubastas();
    cargarTicketsUsuario();
}, []);

  const cargarTicketsUsuario = async () => {};

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

  // ========== REENVIAR SUBASTA RECHAZADA ==========
  const reenviarSubasta = async (id) => {
    try {
      await subastaService.reenviarSubasta(id);
      await cargarSubastas();
      showModalMessage('¡Éxito!', 'Subasta reenviada para revisión', 'success');
    } catch (err) {
      console.error('Error reenviando subasta:', err);
      showModalMessage('Error', err.response?.data?.message || 'Error al reenviar la subasta', 'error');
    }
  };

  // ========== FILTROS ==========
  const subastasFiltradas = subastas.filter((subasta) => {
    if (tabActiva === "activos") {
      return subasta.estadoPrincipal === "ACTIVA";
    }
    if (tabActiva === "publicados") {
      return subasta.estadoPrincipal === "PENDIENTE" || 
             subasta.estadoPrincipal === "RECHAZADA";
    }
    if (tabActiva === "vendidos") {
      return subasta.estadoPrincipal === "FINALIZADA";
    }
    return true;
  });

  const indiceUltimo = paginaActual * subastasPorPagina;
  const indicePrimero = indiceUltimo - subastasPorPagina;
  const subastasActuales = subastasFiltradas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(subastasFiltradas.length / subastasPorPagina);

  const puedeEditar = (subasta) => {
    return subasta.estadoPrincipal === "PENDIENTE" || 
           subasta.estadoPrincipal === "RECHAZADA";
  };
  
  // ========== VER DETALLE CON HISTORIAL DE PUJAS ==========
  const verDetalle = async (subasta) => {
    try {
      setLoading(true);
      const detalleCompleto = await subastaService.getSubastaById(subasta.id);
      
      setSubastaDetalle(detalleCompleto);
      setImagenSeleccionada(detalleCompleto.foto1_url);
      setIndiceImagenActual(0);
      setIndiceArticuloModal(0);
      setIndiceImagenArticulo(0);
      setShowDetalleModal(true);
      
      console.log('Detalle completo con historial:', detalleCompleto);
    } catch (error) {
      console.error('Error obteniendo detalle:', error);
      showModalMessage('Error', 'No se pudo cargar el detalle de la subasta', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const todasLasImagenes = subastaDetalle 
    ? [subastaDetalle.foto1_url, subastaDetalle.foto2_url, subastaDetalle.foto3_url, subastaDetalle.video_url].filter(Boolean)
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

  // ========== FUNCIONES PARA EL MODAL DE ARTÍCULOS DE MEGASUBASTA ==========
  const anteriorArticuloModal = () => {
    if (!subastaDetalle?.articulos || subastaDetalle.articulos.length === 0) return;
    const total = subastaDetalle.articulos.length;
    const nuevoIndice = indiceArticuloModal > 0 ? indiceArticuloModal - 1 : total - 1;
    setIndiceArticuloModal(nuevoIndice);
    setArticuloSeleccionado(subastaDetalle.articulos[nuevoIndice]);
    setIndiceImagenArticulo(0);
  };

  const siguienteArticuloModal = () => {
    if (!subastaDetalle?.articulos || subastaDetalle.articulos.length === 0) return;
    const total = subastaDetalle.articulos.length;
    const nuevoIndice = indiceArticuloModal < total - 1 ? indiceArticuloModal + 1 : 0;
    setIndiceArticuloModal(nuevoIndice);
    setArticuloSeleccionado(subastaDetalle.articulos[nuevoIndice]);
    setIndiceImagenArticulo(0);
  };

  const abrirModalArticulo = (articulo, index) => {
    setArticuloSeleccionado(articulo);
    setIndiceArticuloModal(index);
    setIndiceImagenArticulo(0);
    setShowArticuloModal(true);
  };

  // ========== RENDER DE ARTÍCULOS DE MEGASUBASTA ==========
  const renderArticulosMegaSubasta = () => {
    if (!subastaDetalle?.esMegaSubasta || !subastaDetalle?.articulos || subastaDetalle.articulos.length === 0) return null;

    const totalArticulos = subastaDetalle.articulos.length;

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold color-1 mb-0">
            <i className="bi bi-collection me-2"></i>
            Obras incluidas ({totalArticulos})
          </h6>
        </div>

        <div className="d-flex flex-column gap-3">
          {subastaDetalle.articulos.map((articulo, index) => {
            const imagenes = [
              articulo.foto1_url,
              articulo.foto2_url,
              articulo.foto3_url
            ].filter(Boolean);
            const imagenPrincipal = imagenes[0] || null;
            
            const isSelected = indiceArticuloModal === index;

            return (
              <div 
                key={index} 
                className="card border-0 shadow-sm rounded-4 overflow-hidden cursor-pointer"
                style={{ 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s',
                  backgroundColor: '#fff',
                  border: isSelected ? '2px solid #b0b0b0' : '2px solid transparent',
                  boxShadow: isSelected 
                    ? '0 8px 30px rgba(0,0,0,0.15)' 
                    : '0 2px 10px rgba(0,0,0,0.05)',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  position: 'relative'
                }}
                onClick={() => abrirModalArticulo(articulo, index)}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = '#d4d4d4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
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
                    {imagenPrincipal ? (
                      <img 
                        src={imagenPrincipal} 
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
                    
                    {isSelected && (
                      <div 
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                          background: 'rgba(0,0,0,0.05)'
                        }}
                      />
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
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'none'
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
                    <div className="mt-2">
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ========== RENDER DE ARTÍCULOS EN MODAL DE MEGASUBASTA ==========
  const renderModalArticulosMegaSubasta = () => {
    if (!articuloSeleccionado) return null;

    const imagenesArticuloModal = [
      articuloSeleccionado.foto1_url,
      articuloSeleccionado.foto2_url,
      articuloSeleccionado.foto3_url
    ].filter(Boolean);

    const totalImagenes = imagenesArticuloModal.length;
    const totalArticulos = subastaDetalle?.articulos?.length || 0;
    const esVideo = indiceImagenArticulo === 3 && articuloSeleccionado.video_url;

    const imagenAnteriorArticulo = () => {
      if (totalImagenes === 0 && !articuloSeleccionado.video_url) return;
      const totalItems = totalImagenes + (articuloSeleccionado.video_url ? 1 : 0);
      const nuevoIndice = indiceImagenArticulo > 0 ? indiceImagenArticulo - 1 : totalItems - 1;
      setIndiceImagenArticulo(nuevoIndice);
    };

    const imagenSiguienteArticulo = () => {
      if (totalImagenes === 0 && !articuloSeleccionado.video_url) return;
      const totalItems = totalImagenes + (articuloSeleccionado.video_url ? 1 : 0);
      const nuevoIndice = indiceImagenArticulo < totalItems - 1 ? indiceImagenArticulo + 1 : 0;
      setIndiceImagenArticulo(nuevoIndice);
    };

    const seleccionarImagenArticulo = (index) => {
      setIndiceImagenArticulo(index);
    };

    return (
      <div className="position-relative" style={{ backgroundColor: '#ffffff' }}>
        <button
          className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow d-flex align-items-center justify-content-center"
          style={{ width: '36px', height: '36px', zIndex: 10, border: 'none' }}
          onClick={() => {
            setShowArticuloModal(false);
            setArticuloSeleccionado(null);
            setIndiceArticuloModal(0);
            setIndiceImagenArticulo(0);
          }}
        >
          <i className="bi bi-x-lg" style={{ fontSize: '14px' }}></i>
        </button>
        <div className="p-4 p-lg-5">
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="position-relative">
                <div 
                  className="bg-light rounded-4 d-flex align-items-center justify-content-center overflow-hidden"
                  style={{ 
                    height: '400px',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  {esVideo ? (
                    <video
                      src={articuloSeleccionado.video_url}
                      controls
                      autoPlay
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : totalImagenes > 0 && indiceImagenArticulo < totalImagenes ? (
                    <img 
                      src={imagenesArticuloModal[indiceImagenArticulo]} 
                      alt={articuloSeleccionado.titulo}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div className="text-muted text-center">
                      <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                      <p className="mt-2 small">Sin imágenes</p>
                    </div>
                  )}
                </div>

                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-dark bg-opacity-50 text-white rounded-pill px-3 py-1 small">
                  {esVideo ? ' 4/4' : `${indiceImagenArticulo + 1} / ${totalImagenes + (articuloSeleccionado.video_url ? 1 : 0)}`}
                </div>

                {(totalImagenes > 1 || articuloSeleccionado.video_url) && (
                  <>
                    <button
                      className="btn btn-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 shadow-sm d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px', zIndex: 10, border: 'none' }}
                      onClick={imagenAnteriorArticulo}
                    >
                      <i className="bi bi-chevron-left" style={{ fontSize: '12px' }}></i>
                    </button>
                    <button
                      className="btn btn-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 shadow-sm d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px', zIndex: 10, border: 'none' }}
                      onClick={imagenSiguienteArticulo}
                    >
                      <i className="bi bi-chevron-right" style={{ fontSize: '12px' }}></i>
                    </button>
                  </>
                )}
              </div>

              <div className="d-flex gap-2 mt-2 overflow-auto pb-1" style={{ flexWrap: 'nowrap' }}>
                {imagenesArticuloModal.map((img, idx) => (
                  <div
                    key={`img-${idx}`}
                    className={`rounded-3 overflow-hidden flex-shrink-0 cursor-pointer ${
                      indiceImagenArticulo === idx && !esVideo ? 'border border-2 border-warning' : 'border border-2 border-transparent'
                    }`}
                    style={{ 
                      width: '70px', 
                      height: '60px', 
                      backgroundColor: '#f5f5f5', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => seleccionarImagenArticulo(idx)}
                  >
                    <img
                      src={img}
                      alt={`Imagen ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}

                {articuloSeleccionado.video_url && (
                  <div
                    className={`rounded-3 overflow-hidden flex-shrink-0 cursor-pointer d-flex flex-column align-items-center justify-content-center ${
                      esVideo ? 'border border-2 border-warning' : 'border border-2 border-transparent'
                    }`}
                    style={{ 
                      width: '70px', 
                      height: '60px', 
                      backgroundColor: '#f5f5f5', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setIndiceImagenArticulo(3)}
                  >
                    <i className="bi bi-play-circle-fill fs-2 text-secondary"></i>
                    <small className="text-muted" style={{ fontSize: '7px' }}>Video</small>
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-5">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="badge bg-secondary bg-opacity-10 text-secondary">
                  Artículo {indiceArticuloModal + 1} de {totalArticulos}
                </span>
              </div>

              <h5 className="fw-bold color-1 mb-2" style={{ fontSize: '25px' }}>
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

              <div className="bg-light p-3 rounded-4 mt-3">
                <div className="d-flex justify-content-between">
                  <div>
                    <small className="text-muted d-block small fw-bold">TIEMPO RESTANTE</small>
                    <h6 className="text-muted fw-normal m-0">
                      {subastaDetalle?.tiempo || 'No disponible'}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPaso(1);
    setSubastaEditando(null);
    setModalEditando(false);
    setTipoSubasta(null);
    setFormData({
      titulo: '',
      categoria: '',
      categoriaId: null,
      categoriaMega: '',
      descripcion: '',
      precio: '',
      duracion: '',
      pujaMinima: null,
      imagenes: [],
      video: null,
      documento: null,
      articulos: [],
      esMegaSubasta: false,
      portada: null
    });
  };

  const handleOpenCreateModal = () => {
    setShowTipoModal(true);
  };

  const handleSeleccionarTipo = (tipo) => {
    if (tipo === 'mega') {
      if (ticketsUsuario < 30) {
        showModalMessage('Tickets insuficientes', 
          'Necesitas 30 tickets para crear una MegaSubasta. Actualmente tienes ' + ticketsUsuario + ' tickets.', 
          'warning');
        return;
      }
    }

    setTipoSubasta(tipo);
    setShowTipoModal(false);
    setModalEditando(false);
    setPaso(1);
    
    if (tipo === 'mega') {
      setFormData({
        ...formData,
        esMegaSubasta: true,
        categoriaMega: '',
        categoriaId: null,
        duracion: '',
        pujaMinima: null,
        portada: null,
        articulos: [
          { titulo: '', categoria: '', descripcion: '', imagenes: [], video: null, documento: null }
        ]
      });
    } else {
      setFormData({
        ...formData,
        esMegaSubasta: false,
        titulo: '',
        categoria: '',
        categoriaId: null,
        descripcion: '',
        duracion: '',
        pujaMinima: null,
        imagenes: [],
        video: null
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArticuloChange = (index, field, value) => {
    setFormData(prev => {
      const nuevosArticulos = [...prev.articulos];
      if (field === 'categoria' && prev.esMegaSubasta) {
        return prev;
      }
      nuevosArticulos[index] = {
        ...nuevosArticulos[index],
        [field]: value
      };
      return {
        ...prev,
        articulos: nuevosArticulos
      };
    });
  };

  const handleAgregarArticulo = () => {
    if (formData.articulos.length >= 5) {
      showModalMessage('Límite alcanzado', 'Máximo 5 artículos por MegaSubasta', 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      articulos: [
        ...prev.articulos,
        { titulo: '', categoria: prev.categoriaMega || '', descripcion: '', imagenes: [], video: null, documento: null }
      ]
    }));
  };

  const handleEliminarArticulo = (index) => {
    if (formData.articulos.length <= 1) {
      showModalMessage('Error', 'Debes tener al menos 1 artículo', 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      articulos: prev.articulos.filter((_, i) => i !== index)
    }));
  };

  const handlePujaMinimaChange = (monto) => {
    setFormData(prev => ({
      ...prev,
      pujaMinima: prev.pujaMinima === monto ? null : monto
    }));
  };

  const handleImageUpload = (e, index, articuloIndex = null) => {
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
        if (formData.esMegaSubasta && articuloIndex !== null) {
          setFormData(prev => {
            const nuevosArticulos = [...prev.articulos];
            if (!nuevosArticulos[articuloIndex].imagenes) {
              nuevosArticulos[articuloIndex].imagenes = [];
            }
            nuevosArticulos[articuloIndex].imagenes[index] = reader.result;
            return {
              ...prev,
              articulos: nuevosArticulos
            };
          });
        } else {
          setFormData(prev => {
            const nuevasImagenes = [...prev.imagenes];
            nuevasImagenes[index] = reader.result;
            return {
              ...prev,
              imagenes: nuevasImagenes
            };
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArticuloDocumentUpload = (e, index) => {
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
        setFormData(prev => {
          const nuevosArticulos = [...prev.articulos];
          nuevosArticulos[index].documento = reader.result;
          return {
            ...prev,
            articulos: nuevosArticulos
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e, articuloIndex = null) => {
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
      
      const maxDuration = formData.esMegaSubasta ? 60 : 30;
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > maxDuration) {
          showModalMessage('Atención', `El video no debe durar más de ${maxDuration} segundos`, 'warning');
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          if (formData.esMegaSubasta && articuloIndex !== null) {
            setFormData(prev => {
              const nuevosArticulos = [...prev.articulos];
              nuevosArticulos[articuloIndex].video = reader.result;
              return {
                ...prev,
                articulos: nuevosArticulos
              };
            });
          } else {
            setFormData(prev => ({
              ...prev,
              video: reader.result
            }));
          }
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

  // ========== SUBIR PORTADA DE MEGASUBASTA ==========
  const handlePortadaUpload = (e) => {
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
        setFormData(prev => ({
          ...prev,
          portada: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePortada = () => {
    setFormData(prev => ({
      ...prev,
      portada: null
    }));
  };

  // ========== ELIMINAR VIDEO DE SUBASTA NORMAL ==========
  const handleRemoveVideo = () => {
    console.log('🗑️ ELIMINANDO VIDEO...');
    console.log('📹 Video ANTES de eliminar:', formData.video);
    console.log('📹 Tipo de video ANTES:', typeof formData.video);
    
    setFormData(prev => {
      console.log('📹 Video DESPUÉS de eliminar: NULL');
      return { ...prev, video: null };
    });
  };

  const handleRemoveImage = (index, articuloIndex = null) => {
    if (formData.esMegaSubasta && articuloIndex !== null) {
      setFormData(prev => {
        const nuevosArticulos = [...prev.articulos];
        nuevosArticulos[articuloIndex].imagenes = 
          nuevosArticulos[articuloIndex].imagenes.filter((_, i) => i !== index);
        return {
          ...prev,
          articulos: nuevosArticulos
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        imagenes: prev.imagenes.filter((_, i) => i !== index)
      }));
    }
  };

  // ========== HANDLE EDITAR CORREGIDO ==========
  const handleEditar = async (subasta) => {
    console.log('🔍 EDITANDO SUBASTA:', subasta);
    
    try {
      setLoading(true);
      
      const detalleCompleto = await subastaService.getSubastaById(subasta.id);
      console.log('DETALLE COMPLETO:', detalleCompleto);
      console.log('📹 Video cargado desde detalle:', detalleCompleto.video_url);
      console.log('📹 Video cargado desde subasta:', subasta.video);
      
      setSubastaEditando(subasta);
      setModalEditando(true);
      setPaso(1);
      
      const esMega = detalleCompleto.esMegaSubasta == true || detalleCompleto.esMegaSubasta === 1;
      setTipoSubasta(esMega ? 'mega' : 'individual');
      
      const getDuracionTexto = (horas) => {
          if (!horas) return '';
          const map = {
              24: '24 Horas',
              48: '48 Horas',
              72: '72 Horas',
              96: '96 Horas',
              120: '120 Horas',
              168: '168 Horas',
              336: '336 Horas'
          };
          return map[horas] || '';
      };

      const duracionEnHoras = detalleCompleto.duracion_horas || subasta.duracion;
      const categoriaId = detalleCompleto.categoria_id || subasta.categoria_id || null;
      const categoriaNombre = detalleCompleto.categoria || subasta.categoria || '';

      if (esMega) {
          let articulosParaEditar = [];
          
          if (detalleCompleto.articulos && detalleCompleto.articulos.length > 0) {
              articulosParaEditar = detalleCompleto.articulos.map(art => {
                  const imagenes = [];
                  if (art.foto1_url) imagenes.push(art.foto1_url);
                  if (art.foto2_url) imagenes.push(art.foto2_url);
                  if (art.foto3_url) imagenes.push(art.foto3_url);
                  
                  return {
                      titulo: art.titulo || '',
                      categoria: art.categoria || categoriaNombre,
                      descripcion: art.descripcion || '',
                      imagenes: art.imagenes || imagenes,
                      video: art.video || art.video_url || null,
                      documento: art.documento || art.documento_url || null,
                      _foto1_url: art.foto1_url || null,
                      _foto2_url: art.foto2_url || null,
                      _foto3_url: art.foto3_url || null,
                      _video_url: art.video_url || null,
                      _documento_url: art.documento_url || null
                  };
              });
          } else {
              articulosParaEditar = [{
                  titulo: '',
                  categoria: categoriaNombre,
                  descripcion: '',
                  imagenes: [],
                  video: null,
                  documento: null
              }];
          }

          setFormData({
              titulo: detalleCompleto.titulo || '',
              categoria: categoriaNombre,
              categoriaId: categoriaId,
              categoriaMega: categoriaNombre,
              descripcion: detalleCompleto.descripcion || '',
              precio: detalleCompleto.precio_inicial_mxn ? detalleCompleto.precio_inicial_mxn.toString().replace(/,/g, '') : '',
              duracion: getDuracionTexto(duracionEnHoras),
              pujaMinima: parseFloat(detalleCompleto.puja_minima_mxn) || null,
              imagenes: [
                  detalleCompleto.foto1_url || subasta.img1, 
                  detalleCompleto.foto2_url || subasta.img2, 
                  detalleCompleto.foto3_url || subasta.img3
              ].filter(Boolean),
              video: detalleCompleto.video_url || null,
              documento: null,
              esMegaSubasta: true,
              portada: detalleCompleto.portada || subasta.portada || null,
              articulos: articulosParaEditar
          });
      } else {
          setFormData({
              titulo: detalleCompleto.titulo || subasta.titulo || '',
              categoria: categoriaNombre,
              categoriaId: categoriaId,
              categoriaMega: '',
              descripcion: detalleCompleto.descripcion || subasta.descripcion || '',
              precio: detalleCompleto.precio_inicial_mxn 
                  ? detalleCompleto.precio_inicial_mxn.toString().replace(/,/g, '') 
                  : (subasta.precio ? subasta.precio.toString().replace(/,/g, '') : ''),
              duracion: getDuracionTexto(duracionEnHoras),
              pujaMinima: parseFloat(detalleCompleto.puja_minima_mxn) || parseFloat(subasta.pujaMinima) || null,
              imagenes: [
                  detalleCompleto.foto1_url || subasta.img1, 
                  detalleCompleto.foto2_url || subasta.img2, 
                  detalleCompleto.foto3_url || subasta.img3
              ].filter(Boolean),
              video: detalleCompleto.video_url || subasta.video || null,
              documento: null,
              esMegaSubasta: false,
              portada: null,
              articulos: []
          });
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Error cargando datos para editar:', error);
      showModalMessage('Error', 'No se pudieron cargar los datos de la subasta', 'error');
    } finally {
      setLoading(false);
    }
  };

// ========== ELIMINAR SUBASTA ==========
const handleEliminarClick = (subasta) => {
    // ✅ OBTENER USUARIO ACTUAL
    const user = authService.getCurrentUser();
    
    if (!user) {
        showModalMessage('Error', 'No has iniciado sesión', 'error');
        return;
    }

    // ✅ BUSCAR EL VENDEDOR_ID EN VARIAS PROPIEDADES POSIBLES
    const vendedorId = subasta.vendedor_id || subasta.vendedorId || subasta.vendedor?.id || subasta.user_id || subasta.usuario_id;
    
    console.log('🔍 Subasta completa:', subasta);
    console.log('🔍 Todas las propiedades:', Object.keys(subasta));
    console.log('🔍 Vendedor ID encontrado:', vendedorId);
    
    if (!vendedorId) {
        showModalMessage('Error', 'No se pudo identificar al vendedor de esta subasta', 'error');
        return;
    }

    // ✅ CONVERTIR AMBOS A NÚMERO PARA COMPARACIÓN SEGURA
    const userId = Number(user.id);
    const vendedorIdNum = Number(vendedorId);
    
    console.log('🔍 userId (número):', userId);
    console.log('🔍 vendedorId (número):', vendedorIdNum);
    console.log('🔍 Son iguales?', userId === vendedorIdNum);

    if (userId !== vendedorIdNum) {
        showModalMessage('Error', 'No puedes eliminar una subasta que no te pertenece', 'error');
        return;
    }

    // ✅ VERIFICAR QUE ESTÉ EN ESTADO PERMITIDO
    if (subasta.estadoPrincipal !== 'PENDIENTE' && subasta.estadoPrincipal !== 'RECHAZADA') {
        showModalMessage('Error', 
            `Solo puedes eliminar subastas en estado "Pendiente" o "Rechazada". 
            Estado actual: "${subasta.estadoPrincipal}"`, 
            'error'
        );
        return;
    }

    // ✅ MOSTRAR MODAL DE CONFIRMACIÓN
    console.log('✅ Abriendo modal de confirmación para subasta:', subasta.id);
    setSubastaAEliminar(subasta.id);
    setShowDeleteModal(true);
};

// ========== CONFIRMAR ELIMINACIÓN ==========
const handleEliminarConfirm = async () => {
    if (!subastaAEliminar) return;

    try {
        console.log('✅ Confirmando eliminación de subasta:', subastaAEliminar);
        const response = await subastaService.eliminarSubasta(subastaAEliminar);
        
        // ✅ Mostrar mensaje de éxito
        showModalMessage('¡Éxito!', response.message || 'Subasta eliminada exitosamente', 'success');
        
        // ✅ Recargar la lista
        await cargarSubastas();
        
        // ✅ Cerrar modal
        setShowDeleteModal(false);
        setSubastaAEliminar(null);
        
    } catch (error) {
        console.error('Error eliminando subasta:', error);
        
        // ✅ Manejar errores específicos
        let errorMessage = 'Error al eliminar la subasta';
        
        if (error.response?.status === 403) {
            errorMessage = error.response?.data?.message || 'No tienes permisos para eliminar esta subasta';
        } else if (error.response?.status === 404) {
            errorMessage = 'La subasta ya no existe';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        
        showModalMessage('Error', errorMessage, 'error');
    }
};

  // ========== HANDLE GUARDAR EDICION (MODIFICADO - CON VALIDACIÓN Y LOGS) ==========
  const handleGuardarEdicion = async () => {
    //  PRIMERO VALIDAR EL FORMULARIO
    if (!validarFormulario()) {
      return;
    }

    try {
      let dataToSend;

      if (formData.esMegaSubasta) {
        const categoriaId = formData.categoriaId;
        if (!categoriaId) {
          showModalMessage('Error', 'Categoría no válida', 'error');
          return;
        }
        
        const articulosParaEnviar = formData.articulos.map(art => ({
          titulo: art.titulo || '',
          categoria_id: categoriaId,
          descripcion: art.descripcion || '',
          imagenes: art.imagenes || [],
          video: art.video || null,
          documento: art.documento || null,
          _foto1_url: art._foto1_url || null,
          _foto2_url: art._foto2_url || null,
          _foto3_url: art._foto3_url || null,
          _video_url: art._video_url || null,
          _documento_url: art._documento_url || null
        }));

        dataToSend = {
          titulo: `MegaSubasta: ${formData.articulos[0]?.titulo || 'Sin título'}${formData.articulos.length > 1 ? ` y ${formData.articulos.length - 1} más` : ''}`,
          categoria_id: categoriaId,
          descripcion: formData.articulos.map((a, i) => `${i + 1}. ${a.titulo}: ${a.descripcion}`).join('\n\n'),
          precio_inicial: parseFloat(formData.precio) || 0,
          puja_minima: formData.pujaMinima || 0,
          duracion_horas: formData.duracion === '24 Horas' ? 24 : 
                        formData.duracion === '48 Horas' ? 48 : 
                        formData.duracion === '72 Horas' ? 72 : 
                        formData.duracion === '96 Horas' ? 96 : 
                        formData.duracion === '120 Horas' ? 120 :
                        formData.duracion === '168 Horas' ? 168 :
                        formData.duracion === '336 Horas' ? 336 :
                        formData.duracion === 'personalizada' ? Math.ceil(formData.duracionPersonalizada / 60) : 72,
          imagenes: [null, null, null],
          video: null,
          documento: formData.documento || null,
          esMegaSubasta: true,
          portada: formData.portada || null,
          articulos: articulosParaEnviar
        };
      } else {
        const categoriaId = formData.categoriaId;
        if (!categoriaId) {
          showModalMessage('Error', 'Categoría no válida', 'error');
          return;
        }

        dataToSend = {
          titulo: formData.titulo,
          categoria_id: categoriaId,
          descripcion: formData.descripcion,
          precio_inicial: parseFloat(formData.precio) || 0,
          puja_minima: formData.pujaMinima || 0,
          duracion_horas: formData.duracion === '24 Horas' ? 24 : 
                        formData.duracion === '48 Horas' ? 48 : 
                        formData.duracion === '72 Horas' ? 72 : 
                        formData.duracion === '96 Horas' ? 96 : 
                        formData.duracion === '120 Horas' ? 120 :
                        formData.duracion === '168 Horas' ? 168 :
                        formData.duracion === '336 Horas' ? 336 : 72,
          imagenes: formData.imagenes,
          video: formData.video,
          documento: formData.documento,
          esMegaSubasta: false,
          portada: null,
          articulos: []
        };
      }

      // ========== LOGS PARA DEPURAR EL VIDEO ==========
      console.log('========================================');
      console.log('📦 DATA A ENVIAR AL BACKEND:');
      console.log('📹 Video en dataToSend:', dataToSend.video);
      console.log('📹 Tipo de video:', typeof dataToSend.video);
      console.log('📹 Es null?', dataToSend.video === null);
      console.log('📹 Es undefined?', dataToSend.video === undefined);
      console.log('📹 JSON:', JSON.stringify(dataToSend.video));
      console.log('📦 Data completa:', dataToSend);
      console.log('========================================');
      // ===============================================

      await subastaService.actualizarSubasta(subastaEditando.id, dataToSend);
      await cargarSubastas();
      handleCloseModal();
      showModalMessage('¡Éxito!', 'Subasta actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error actualizando subasta:', error);
      showModalMessage('Error', error.response?.data?.message || 'Error al actualizar la subasta', 'error');
    }
  };

  // ========== VALIDACIÓN COMPLETA DEL FORMULARIO (MODIFICADA) ==========
  const validarFormulario = () => {
    if (formData.esMegaSubasta) {
      //  VALIDACIÓN DE PORTADA OBLIGATORIA
      if (!formData.portada) {
        setValidationMessage('La MegaSubasta necesita una portada. Sube una imagen que represente tu colección.');
        setShowValidationModal(true);
        return false;
      }

      if (!formData.categoriaMega && !formData.categoriaId) {
        setValidationMessage('Por favor, selecciona una categoría para la MegaSubasta');
        setShowValidationModal(true);
        return false;
      }

      for (let i = 0; i < formData.articulos.length; i++) {
        const articulo = formData.articulos[i];
        if (!articulo.titulo?.trim()) {
          setValidationMessage(`El artículo #${i + 1} necesita un título`);
          setShowValidationModal(true);
          return false;
        }
        if (!articulo.descripcion?.trim()) {
          setValidationMessage(`El artículo #${i + 1} necesita una descripción`);
          setShowValidationModal(true);
          return false;
        }
        //  VALIDACIÓN DE IMÁGENES DE CADA ARTÍCULO
        if (!articulo.imagenes || articulo.imagenes.length < 3) {
          setValidationMessage(`El artículo #${i + 1} necesita al menos 3 imágenes (tienes ${articulo.imagenes?.length || 0})`);
          setShowValidationModal(true);
          return false;
        }
      }
    } else {
      if (!formData.titulo.trim()) {
        setValidationMessage('Por favor, ingresa un título para la obra');
        setShowValidationModal(true);
        return false;
      }
      if (!formData.categoriaId) {
        setValidationMessage('Por favor, selecciona una categoría');
        setShowValidationModal(true);
        return false;
      }
      if (!formData.descripcion.trim()) {
        setValidationMessage('Por favor, ingresa una descripción');
        setShowValidationModal(true);
        return false;
      }
      if (formData.imagenes.length < 3) {
        setShowErrorModal(true);
        return false;
      }
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      setValidationMessage('Por favor, ingresa un precio inicial válido');
      setShowValidationModal(true);
      return false;
    }

    if (!formData.duracion) {
      setValidationMessage('Por favor, selecciona una duración para la subasta');
      setShowValidationModal(true);
      return false;
    }

    if (!formData.pujaMinima) {
      setValidationMessage('Por favor, selecciona una puja mínima');
      setShowValidationModal(true);
      return false;
    }

    return true;
  };

  const handleCrearSubasta = async () => {
    //  PRIMERO VALIDAR EL FORMULARIO
    if (!validarFormulario()) {
      return;
    }

    setShowValidationModal(false);

    let dataToSend;

    if (formData.esMegaSubasta) {
      const categoriaId = formData.categoriaId;
      if (!categoriaId) {
        showModalMessage('Error', 'Categoría no válida', 'error');
        return;
      }

      dataToSend = {
        esMegaSubasta: true,
        categoriaMega: formData.categoriaMega,
        portada: formData.portada || null,
        articulos: formData.articulos.map(articulo => ({
          titulo: articulo.titulo.trim(),
          categoria_id: categoriaId,
          descripcion: articulo.descripcion.trim(),
          imagenes: articulo.imagenes,
          video: articulo.video || null,
          documento: articulo.documento || null
        })),
        precio_inicial: parseFloat(formData.precio) || 0,
        puja_minima: formData.pujaMinima || 0,
        duracion_horas: 
        formData.duracion === '24 Horas' ? 24 :
        formData.duracion === '48 Horas' ? 48 :
        formData.duracion === '72 Horas' ? 72 :
        formData.duracion === '96 Horas' ? 96 :
        formData.duracion === '120 Horas' ? 120 :
        formData.duracion === '168 Horas' ? 168 :
        formData.duracion === '336 Horas' ? 336 :
        formData.duracion === 'personalizada' ? Math.ceil(formData.duracionPersonalizada / 60) : 0,
        documento: formData.documento || null
      };
    } else {
      const categoriaId = formData.categoriaId;
      if (!categoriaId) {
        showModalMessage('Error', 'Categoría no válida', 'error');
        return;
      }

      dataToSend = {
        titulo: formData.titulo.trim(),
        categoria_id: categoriaId,
        descripcion: formData.descripcion.trim(),
        precio_inicial: parseFloat(formData.precio) || 0,
        puja_minima: formData.pujaMinima || 0,
        duracion_horas: 
          formData.duracion === '24 Horas' ? 24 :
          formData.duracion === '48 Horas' ? 48 :
          formData.duracion === '72 Horas' ? 72 :
          formData.duracion === '96 Horas' ? 96 :
          formData.duracion === '120 Horas' ? 120 :
          formData.duracion === '168 Horas' ? 168 :
          formData.duracion === '336 Horas' ? 336 : 72,
        imagenes: formData.imagenes,
        video: formData.video || null,
        documento: formData.documento || null,
        esMegaSubasta: false
      };
    }

    try {
      await subastaService.crearSubasta(dataToSend);
      
      if (formData.esMegaSubasta) {
        showModalMessage('¡Éxito!', 'MegaSubasta creada exitosamente -30 tickets.', 'success');
      } else {
        showModalMessage('¡Éxito!', 'Subasta creada exitosamente', 'success');
      }
      
      await cargarSubastas();
      handleCloseModal();
    } catch (error) {
      console.error('Error creando subasta:', error);
      showModalMessage('Error', error.response?.data?.message || 'Error al crear la subasta', 'error');
    }
  };

  const renderPasoContenido = () => {
    if (paso === 1) {
      return renderPaso1();
    } else if (paso === 2) {
      return renderPaso2();
    } else if (paso === 3) {
      return renderPaso3();
    }
    return null;
  };

  // ========== RENDER PASO 1 (MODIFICADO - PORTADA OBLIGATORIA) ==========
  const renderPaso1 = () => {
    if (formData.esMegaSubasta) {
      return (
        <div className="text-start">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold color-1 mb-0">Detalles de la MegaSubasta</h5>
            <span className="badge bg-secondary">
              {formData.articulos.length}/5
            </span>
          </div>

          <div className="mb-3">
            <label className="fw-bold mb-1 small color-2">
              Categoría <span className="text-danger">*</span>
            </label>
            <select 
              className="form-select rounded-pill border-2"
              value={formData.categoriaId || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedText = e.target.options[e.target.selectedIndex]?.text || '';
                setFormData(prev => ({
                  ...prev,
                  categoriaId: selectedId,
                  categoriaMega: selectedText,
                  articulos: prev.articulos.map(art => ({
                    ...art,
                    categoria: selectedText
                  }))
                }));
              }}
            >
              <option value="">Selecciona una categoría</option>
              <option value="1">ARTE VISUAL</option>
              <option value="2">ARTE DIGITAL</option>
              <option value="3">FOTOGRAFÍA</option>
              <option value="4">ESCULTURA</option>
              <option value="5">ARTESANÍAS</option>
              <option value="6">COLECCIONABLES</option>
            </select>
            <small className="text-muted">Esta categoría aplicará a todos los artículos de la MegaSubasta</small>
          </div>

          {/*  PORTADA DE LA MEGASUBASTA - OBLIGATORIA */}
          <div className="mb-3">
            <label className="fw-bold mb-1 small color-2">
              Portada de la MegaSubasta <span className="text-danger">*</span>
            </label>
            <div
              className={`border rounded-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative ${
                !formData.portada ? 'border-danger border-2' : ''
              }`}
              style={{ 
                height: "120px",
                backgroundColor: formData.portada ? 'transparent' : '#f8f9fa',
                cursor: formData.portada ? 'default' : 'pointer',
                overflow: 'hidden',
                backgroundImage: formData.portada ? `url(${formData.portada})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '12px'
              }}
            >
              {formData.portada ? (
                <>
                  <button 
                    type="button"
                    className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '28px', height: '28px', padding: 0, zIndex: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, portada: null }));
                    }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                  <div 
                    className="position-absolute bottom-0 start-0 w-100 p-2"
                    style={{
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                      color: 'white'
                    }}
                  >
                    <small className="d-block text-center">Portada cargada</small>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="position-absolute w-100 h-100 opacity-0"
                    style={{ top: 0, left: 0, cursor: 'pointer', zIndex: 2 }}
                    onChange={handlePortadaUpload}
                  />
                  <i className="bi bi-image fs-2 color-2"></i>
                  <small className="text-muted">Haz clic para subir portada</small>
                  <small className="text-muted" style={{ fontSize: '10px' }}>Recomendado: 1200x630px</small>
                  <small className="text-danger" style={{ fontSize: '10px' }}>Obligatoria</small>
                </>
              )}
            </div>
            {!formData.portada && (
              <small className="text-danger">La portada es obligatoria para MegaSubastas</small>
            )}
          </div>
          
          {formData.articulos.map((articulo, index) => {
            const tieneImagenes = articulo.imagenes && articulo.imagenes.length > 0;
            
            return (
              <div key={index} className="border rounded-4 p-3 mb-3" style={{ borderColor: '#e0e0e0' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold color-1 mb-0">Artículo #{index + 1}</h6>
                  {formData.articulos.length > 1 && (
                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill"
                      onClick={() => handleEliminarArticulo(index)}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
                
                <div className="mb-2">
                  <label className="fw-bold mb-1 small color-2">Título de la Obra</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-pill border-2"
                    placeholder="Ej: Escultura Orgánica de Nogal #5"
                    value={articulo.titulo || ''}
                    onChange={(e) => handleArticuloChange(index, 'titulo', e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="fw-bold mb-1 small color-2">Descripción Detallada</label>
                  <textarea
                    className="form-control rounded-3 border-2 small"
                    rows="2"
                    placeholder="Cuéntanos la historia de tu pieza..."
                    value={articulo.descripcion || ''}
                    onChange={(e) => handleArticuloChange(index, 'descripcion', e.target.value)}
                  />
                </div>

                {tieneImagenes && (
                  <div className="mb-2">
                    <label className="fw-bold small color-2">Imágenes actuales:</label>
                    <div className="d-flex gap-2 mt-1 flex-wrap">
                      {articulo.imagenes.map((img, imgIdx) => (
                        <div key={imgIdx} className="position-relative">
                          <img 
                            src={img} 
                            alt={`Imagen ${imgIdx + 1}`}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #ddd'
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-0 d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '18px', height: '18px', padding: 0, fontSize: '8px' }}
                            onClick={() => {
                              setFormData(prev => {
                                const nuevosArticulos = [...prev.articulos];
                                nuevosArticulos[index].imagenes = nuevosArticulos[index].imagenes.filter((_, i) => i !== imgIdx);
                                return { ...prev, articulos: nuevosArticulos };
                              });
                            }}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <small className="text-muted" style={{ fontSize: '10px' }}>
                      Puedes eliminar imágenes existentes o subir nuevas en el paso 2
                    </small>
                  </div>
                )}
              </div>
            );
          })}
          
          <button
            className="btn-2 rounded-pill w-100 py-2"
            onClick={handleAgregarArticulo}
            disabled={formData.articulos.length >= 5}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Añadir Artículo ({formData.articulos.length}/5)
          </button>
        </div>
      );
    } else {
      return (
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
                value={formData.categoriaId || ''}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedText = e.target.options[e.target.selectedIndex]?.text || '';
                  setFormData(prev => ({
                    ...prev,
                    categoriaId: selectedId,
                    categoria: selectedText
                  }));
                }}
              >
                <option value="">Selecciona una categoría</option>
                <option value="1">ARTE VISUAL</option>
                <option value="2">ARTE DIGITAL</option>
                <option value="3">FOTOGRAFÍA</option>
                <option value="4">ESCULTURA</option>
                <option value="5">ARTESANÍAS</option>
                <option value="6">COLECCIONABLES</option>
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
      );
    }
  };

  // ========== RENDER PASO 2 (MODIFICADO - VALIDACIÓN VISUAL DE IMÁGENES) ==========
  const renderPaso2 = () => {
    if (formData.esMegaSubasta) {
      return (
        <div className="text-start">
          <h5 className="fw-bold mb-1 color-1">Multimedia Obligatoria</h5>
          <p className="small text-muted mb-3">Necesitamos ver tu pieza desde todos los ángulos para verificarla.</p>
          
          {formData.articulos.map((articulo, index) => {
            const imagenesCount = articulo.imagenes?.length || 0;
            const faltanImagenes = imagenesCount < 3;
            
            return (
              <div key={index} className="border rounded-4 p-3 mb-3" style={{ borderColor: '#e0e0e0' }}>
                <h6 className="fw-bold color-1 mb-2">Artículo #{index + 1}</h6>
                
                <div className="row g-2">
                  <div className="col-12">
                    <label className="fw-bold small color-2 mb-1 d-block">
                      Subir Fotos <span className="text-danger">*</span>
                      <span className="text-muted ms-2" style={{ fontSize: '10px' }}>
                        ({imagenesCount}/3)
                      </span>
                    </label>
                    
                    <div className="row g-2">
                      {[0, 1, 2].map((imgIndex) => (
                        <div className="col-4" key={imgIndex}>
                          <div
                            className={`border rounded-3 position-relative ${
                              !articulo.imagenes?.[imgIndex] ? 'border-dashed' : ''
                            }`}
                            style={{ 
                              height: "70px",
                              backgroundImage: articulo.imagenes?.[imgIndex] ? `url(${articulo.imagenes[imgIndex]})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundColor: articulo.imagenes?.[imgIndex] ? 'transparent' : '#f8f9fa',
                              cursor: articulo.imagenes?.[imgIndex] ? 'default' : 'pointer',
                              overflow: 'hidden',
                              borderStyle: articulo.imagenes?.[imgIndex] ? 'solid' : 'dashed',
                              borderColor: articulo.imagenes?.[imgIndex] ? '#dee2e6' : '#ff6b6b'
                            }}
                          >
                            {articulo.imagenes?.[imgIndex] ? (
                              <>
                                <img 
                                  src={articulo.imagenes[imgIndex]} 
                                  alt={`Foto ${imgIndex + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <button 
                                  type="button"
                                  className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                                  style={{ width: '20px', height: '20px', padding: 0, zIndex: 2 }}
                                  onClick={() => handleRemoveImage(imgIndex, index)}
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
                                  onChange={(e) => handleImageUpload(e, imgIndex, index)}
                                />
                                <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
                                  <i className="bi bi-plus-circle fs-5 color-2"></i>
                                  <small className="text-muted" style={{ fontSize: "0.5rem" }}>Foto {imgIndex + 1}</small>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="fw-bold small color-2 mb-1 d-block">Video de Verificación</label>
                    <div
                      className="border rounded-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative"
                      style={{ 
                        height: "60px",
                        backgroundColor: articulo.video ? '#e8f5e9' : '#f8f9fa',
                        cursor: articulo.video ? 'default' : 'pointer',
                        overflow: 'hidden'
                      }}
                    >
                      {articulo.video ? (
                        <>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-check-circle-fill text-success"></i>
                            <span className="text-muted small">Video cargado</span>
                          </div>
                          <button 
                            type="button"
                            className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '20px', height: '20px', padding: 0 }}
                            onClick={() => {
                              setFormData(prev => {
                                const nuevosArticulos = [...prev.articulos];
                                nuevosArticulos[index].video = null;
                                return { ...prev, articulos: nuevosArticulos };
                              });
                            }}
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
                            onChange={(e) => handleVideoUpload(e, index)}
                          />
                          <i className="bi bi-upload fs-5 color-2"></i>
                          <small className="text-muted">Opcional (Máx. 60 seg)</small>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="fw-bold small color-2 mb-1 d-block">Documento PDF (Opcional)</label>
                    <div
                      className="border rounded-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative"
                      style={{ 
                        height: "60px",
                        backgroundColor: articulo.documento ? '#e8f5e9' : '#f8f9fa',
                        cursor: articulo.documento ? 'default' : 'pointer',
                        overflow: 'hidden'
                      }}
                    >
                      {articulo.documento ? (
                        <>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                            <span className="text-muted small">PDF cargado</span>
                          </div>
                          <button 
                            type="button"
                            className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '20px', height: '20px', padding: 0 }}
                            onClick={() => {
                              setFormData(prev => {
                                const nuevosArticulos = [...prev.articulos];
                                nuevosArticulos[index].documento = null;
                                return { ...prev, articulos: nuevosArticulos };
                              });
                            }}
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
                            onChange={(e) => handleArticuloDocumentUpload(e, index)}
                          />
                          <i className="bi bi-upload fs-5 color-2"></i>
                          <small className="text-muted">Haz clic para subir PDF</small>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="alert alert-info mt-3 small rounded-3" style={{ border: '1px solid #b8d4e3', background: "#e8f4f8" }}>
            <i className="bi bi-info-circle me-2"></i>
            Los videos que muestran el proceso de creación o la textura del material suelen atraer un 40% más de participación.
          </div>
        </div>
      );
    } else {
      return (
        <div className="animate__animated animate__fadeIn text-start">
          <h5 className="fw-bold mb-1 color-1">Multimedia</h5>
          <p className="small text-muted mb-4">Fotos, video y certificado para verificación.</p>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="border rounded-4 p-4 bg-white shadow-sm" style={{ border: '1px solid #e0e0e0' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-light rounded-3 p-2">
                    <i className="bi bi-images fs-3 color-2"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 color-1">Subir Fotos <span className="text-danger">*</span></h6>
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
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <button 
                              type="button"
                              className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow-sm"
                              style={{ width: '22px', height: '22px', padding: 0, zIndex: 2 }}
                              onClick={() => handleRemoveImage(index)}
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

            <div className="col-md-6">
              <div className="border rounded-4 p-4 bg-white shadow-sm" style={{ border: '1px solid #e0e0e0' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-light rounded-3 p-2">
                    <i className="bi bi-camera-video fs-3 color-2"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 color-1">Video de Verificación</h6>
                    <p className="text-muted small mb-0">Opcional (Máx. 30 seg)</p>
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
                        onClick={handleRemoveVideo}
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
        </div>
      );
    }
  };

  // ========== RENDER PASO 3 (MODIFICADO - OCULTAR TICKETS EN EDICIÓN) ==========
  const renderPaso3 = () => {
    return (
      <div className="animate__animated animate__fadeIn text-start">
        <h5 className="fw-bold mb-1 color-1">Precio y Duración</h5>

        <div className="row mb-4">
          <div className="col-6">
            <label className="fw-bold mb-1 small color-2">
              Precio Inicial (MXN) <span className="text-danger">*</span>
            </label>
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
            <label className="fw-bold mb-1 small color-2">
              Duración de la Subasta <span className="text-danger">*</span>
            </label>
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
                  <option value="">Selecciona una duración</option>
                  <option value="24 Horas">24 Horas</option>
                  <option value="48 Horas">48 Horas</option>
                  <option value="72 Horas">72 Horas</option>
                  <option value="96 Horas">96 Horas (4 días)</option>
                  <option value="120 Horas">120 Horas (5 días)</option>
                  {formData.esMegaSubasta && (
                    <>
                      <option value="168 Horas">168 Horas (7 días / 1 semana)</option>
                      <option value="336 Horas">336 Horas (14 días / 2 semanas)</option>
                    </>
                  )}
                  <option value="personalizada">Personalizada (minutos)</option>
                </select>
                  {formData.duracion === 'personalizada' && (
                    <div className="mb-3">
                      <label className="fw-bold mb-1 small color-2">
                        Duración en minutos <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control p-3 border-color-1"
                        placeholder="Ej: 180 (3 horas)"
                        value={formData.duracionPersonalizada || ''}
                        onChange={(e) => {
                          const minutos = parseInt(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            duracionPersonalizada: minutos
                          }));
                        }}
                        min="1"
                        style={{ borderRadius: "12px" }}
                      />
                      <small className="text-muted d-block mt-1">
                        Ejemplos: 60 = 1 hora, 180 = 3 horas, 1440 = 24 horas, 2880 = 48 horas
                      </small>
                      {formData.duracionPersonalizada < 1 && (
                        <small className="text-danger d-block mt-1">
                          La duración debe ser al menos 1 minuto
                        </small>
                      )}
                    </div>
                  )}
            </div>
          </div>
        </div>

        <label className="fw-bold mb-2 small color-2">
          Puja Mínima <span className="text-danger">*</span>
        </label>
        <div className="d-flex gap-4 mb-3 flex-wrap">
          {formData.esMegaSubasta ? (
            [1000, 1500, 2000, 2500, 3000].map((monto, index) => (
              <div key={index} className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id={`puja${index}`}
                  checked={Number(formData.pujaMinima) === Number(monto)}
                  onChange={() => handlePujaMinimaChange(monto)}
                />
                <label className="form-check-label small color-2" htmlFor={`puja${index}`}>
                  $ {monto.toLocaleString("es-MX")}.00
                </label>
              </div>
            ))
          ) : (
            [200, 500, 1000, 1500, 2000].map((monto, index) => (
              <div key={index} className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id={`puja${index}`}
                  checked={Number(formData.pujaMinima) === Number(monto)}
                  onChange={() => handlePujaMinimaChange(monto)}
                />
                <label className="form-check-label small color-2" htmlFor={`puja${index}`}>
                  $ {monto.toLocaleString("es-MX")}.00
                </label>
              </div>
            ))
          )}
        </div>

       
        

        <div className="alert py-2 px-3 small border-0 color-2" style={{ backgroundColor: "#f9e7ca", borderRadius: "12px" }}>
          <h6 className="fw-bold mb-1">
            <i className="bi bi-shield-check me-1"></i>
            Tu seguridad es nuestra prioridad
          </h6>
          <p className="mb-0">Todos los artículos pasan por un proceso de verificación.</p>
          <p className="py-0">Una vez aprobado, recibirás una notificación y tu pieza aparecerá en el feed principal.</p>
        </div>
      </div>
    );
  };

  const getTituloModal = () => {
    if (modalEditando) return 'Editar obra maestra';
    if (formData.esMegaSubasta) return 'NUEVA MEGASUBASTA';
    return 'Publica tu obra maestra';
  };

  const getSubtituloModal = () => {
    if (modalEditando) return 'EDITAR SUBASTA';
    if (formData.esMegaSubasta) return 'CREAR MEGA SUBASTA';
    return 'CREAR NUEVA SUBASTA';
  };

  // ========== FUNCIÓN PARA OBTENER CONFIGURACIÓN DE ESTADO ==========
  const getEstadoConfig = (estado, subasta = null) => {
    if (estado === "FINALIZADA") {
      if (subasta?.ganador_id || subasta?.ganador_nombre) {
        return { 
          bg: "#fffffff5", 
          color: "#198754", 
          border: "#198754", 
          icon: "bi-check-circle-fill",
          label: "VENDIDA" 
        };
      } else {
        return { 
          bg: "#fffffff5", 
          color: "#b02a37", 
          border: "#b02a37", 
          icon: "bi-x-circle-fill",
          label: "NO VENDIDA" 
        };
      }
    }

    switch (estado) {
      case "ACTIVA":
        return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-check-circle-fill", label: "ACTIVA" };
      case "PENDIENTE":
        return { bg: "#fffffff5", color: "#6c757d", border: "#6c757d", icon: "bi-clock-history", label: "PENDIENTE" };
      case "RECHAZADA":
        return { bg: "#fffffff5", color: "#b02a37", border: "#b02a37", icon: "bi-x-circle-fill", label: "RECHAZADA" };
      default:
        return { bg: "#fffffff5", color: "#495057", border: "#495057", icon: "bi-question-circle", label: estado };
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

            {/* FILTROS PRINCIPALES - ESTILO PESTAÑAS CON LÍNEA */}
            <div className="d-flex gap-4 border-bottom border-2 pb-2 mb-4" style={{ borderColor: '#e0e0e0' }}>
              <button
                onClick={() => {
                  setTabActiva("activos");
                  setPaginaActual(1);
                }}
                className="btn btn-link text-decoration-none p-0 position-relative"
                style={{ 
                  fontSize: '16px',
                  fontWeight: tabActiva === "activos" ? 600 : 400,
                  color: tabActiva === "activos" ? '#9A5F25' : '#6c757d',
                  transition: 'all 0.3s ease',
                  paddingBottom: '10px'
                }}
              >
                Activos
                {tabActiva === "activos" && (
                  <span 
                    className="position-absolute"
                    style={{
                      bottom: '-10px',
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: '#9A5F25',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </button>

              <button
                onClick={() => {
                  setTabActiva("publicados");
                  setPaginaActual(1);
                }}
                className="btn btn-link text-decoration-none p-0 position-relative"
                style={{ 
                  fontSize: '16px',
                  fontWeight: tabActiva === "publicados" ? 600 : 400,
                  color: tabActiva === "publicados" ? '#9A5F25' : '#6c757d',
                  transition: 'all 0.3s ease',
                  paddingBottom: '10px'
                }}
              >
                Publicados
                {tabActiva === "publicados" && (
                  <span 
                    className="position-absolute"
                    style={{
                      bottom: '-10px',
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: '#9A5F25',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </button>

              <button
                onClick={() => {
                  setTabActiva("vendidos");
                  setPaginaActual(1);
                }}
                className="btn btn-link text-decoration-none p-0 position-relative"
                style={{ 
                  fontSize: '16px',
                  fontWeight: tabActiva === "vendidos" ? 600 : 400,
                  color: tabActiva === "vendidos" ? '#9A5F25' : '#6c757d',
                  transition: 'all 0.3s ease',
                  paddingBottom: '10px'
                }}
              >
                Vendidos
                {tabActiva === "vendidos" && (
                  <span 
                    className="position-absolute"
                    style={{
                      bottom: '-10px',
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: '#9A5F25',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </button>
            </div>

            {/* ========== RENDER DE TARJETAS ========== */}
            <div className="row g-3">
              {subastasActuales.length > 0 ? (
                subastasActuales.map((subasta) => {
                  const estadoConfig = getEstadoConfig(subasta.estadoPrincipal, subasta);
                  const esMega = subasta.esMegaSubasta === true || subasta.esMegaSubasta === 1;

                  return (
                    <div key={subasta.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                      <div
                        className="card border-0 shadow-sm overflow-hidden position-relative h-100 d-flex flex-column"
                        style={{
                          borderRadius: '20px',
                          minHeight: '300px',
                          cursor: 'pointer'
                        }}
                        onClick={() => verDetalle(subasta)}
                      >
                        <div
                          className="position-relative"
                          style={{
                            height: '140px',
                            backgroundImage: `url(${
                              esMega && subasta.portada 
                                ? subasta.portada 
                                : subasta.img1 || ''
                            })`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: '#f0f0f0'
                          }}
                        >
                          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}></div>

                          <span className="position-absolute m-2 px-2 py-1 fw-bold d-flex align-items-center gap-1"
                            style={{
                              backgroundColor: estadoConfig.bg,
                              color: estadoConfig.color,
                              border: `1px solid ${estadoConfig.border}`,
                              borderRadius: "20px",
                              fontSize: "9px",
                              background: "rgba(255, 255, 255, 0.9)"
                            }}
                          >
                            <i className={`bi ${estadoConfig.icon}`} style={{ fontSize: '8px' }}></i>
                            <span>{estadoConfig.label}</span>
                          </span>
                          
                          {esMega && (
                            <span className="position-absolute bottom-0 start-0 m-2 px-2 py-1 d-flex align-items-center gap-1" style={{
                              fontSize: '11px', 
                              color: '#8d4925', 
                              backgroundColor: '#f9e7ca', 
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}>
                              <i className="bi bi-collection" style={{ fontSize: '10px' }}></i>
                              Colección
                            </span>
                          )}

                          <div className="position-absolute top-0 end-0 m-2 d-flex gap-1" style={{ zIndex: 2 }}>
                            {puedeEditar(subasta) && (
                              <button
                                className="btn btn-sm rounded-circle text-white shadow d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: '#009575', width: '26px', height: '26px', border: 'none' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleEditar(subasta);
                                }}
                              >
                                <i className="bi bi-pencil" style={{ fontSize: '11px' }}></i>
                              </button>
                            )}
                            <button
                              className="btn btn-sm rounded-circle text-white shadow d-flex align-items-center justify-content-center"
                              style={{ backgroundColor: "#C50003", width: '26px', height: '26px', border: 'none' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleEliminarClick(subasta.id);
                              }}
                            >
                              <i className="bi bi-trash" style={{ fontSize: '11px' }}></i>
                            </button>
                          </div>
                        </div>

                        <div className="card-body p-3 d-flex flex-column flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="fw-bold color-3" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{subasta.categoria}</small>
                          </div>
                          
                          {esMega ? (
                            <h5 
                              className="fw-bold mb-1" 
                              style={{ 
                                color: '#a0742f',
                                fontSize: '18px',
                                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                              }}
                            >MegaSubasta
                            </h5>
                          ) : (
                            <h6 className="fw-bold mb-1" style={{ color: '#4a2311', fontSize: '14px' }}>
                              {subasta.titulo}
                            </h6>
                          )}
                          
                          <p className="small text-muted mb-2 flex-grow-1" style={{ fontSize: '10px', lineHeight: '1.3' }}>
                            {esMega 
                              ? '' 
                              : (subasta.descripcion?.length > 50 ? subasta.descripcion.substring(0, 50) + '...' : subasta.descripcion)
                            }
                          </p>
                          
                          {esMega && (
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span style={{ 
                                fontSize: '10px', 
                                color: '#6c757d',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {subasta.total_articulos || 0} artículos
                              </span>
                            </div>
                          )}

                          {subasta.estadoPrincipal === 'RECHAZADA' && subasta.observacion && (
                            <div 
                              className="mt-2 p-2 rounded-3 border border-danger" 
                              style={{ 
                                backgroundColor: '#fff5f5', 
                                fontSize: '10px',
                                borderLeft: '3px solid #dc3545'
                              }}
                            >
                              <div className="d-flex align-items-start gap-1">
                                <i className="bi bi-exclamation-circle text-danger mt-1" style={{ fontSize: '11px' }}></i>
                                <div>
                                  <small className="text-danger fw-bold d-block">Observaciones del revisor:</small>
                                  <small className="text-muted">{subasta.observacion}</small>
                                  {subasta.fecha_rechazo && (
                                    <small className="text-muted d-block mt-1" style={{ fontSize: '8px' }}>
                                      Rechazado: {new Date(subasta.fecha_rechazo).toLocaleDateString('es-ES')}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {subasta.estadoPrincipal === 'RECHAZADA' && (
                            <button
                              className="btn-linear-gradient btn btn-sm w-100 mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                reenviarSubasta(subasta.id);
                              }}
                              style={{ borderRadius: '20px', fontSize: '10px' }}
                            >
                              <i className="bi bi-arrow-repeat me-1"></i> Corregir y Reenviar
                            </button>
                          )}

                          <div className="d-flex justify-content-between align-items-center mt-auto pt-1 border-top">
                            <div>
                              <small className="text-muted d-block" style={{ fontSize: '8px' }}>FECHA</small>
                              <span className="fw-bold color-1" style={{ fontSize: '10px' }}>{subasta.fechaInicio || 'Pendiente'}</span>
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-block" style={{ fontSize: '8px' }}>PRECIO</small>
                              <span className="fw-bold color-2" style={{ fontSize: '10px' }}> ${subasta.precio} MXN</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">No hay subastas en esta categoría</p>
                </div>
              )}
            </div>

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

      {/* MODAL DE SELECCIÓN DE TIPO DE SUBASTA */}
      <Modal 
        show={showTipoModal} 
        onHide={() => setShowTipoModal(false)}
        centered
        contentClassName="border-0 shadow-lg overflow-hidden"
        style={{ borderRadius: "25px", backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
      >
        <div className="p-4 text-center text-white" style={{ background: "linear-gradient(to right, #2a140a, #8d4925)" }}>
          <h2 className="fw-bold mb-1 fs-4">Publica tu obra maestra</h2>
          <p className="mb-0 small opacity-75">Elige el formato de tu subasta</p>
        </div>

        <div className="modal-body p-4 bg-white">
          <div className="row g-4">
            <div className="col-md-6">
              <div 
                className="border rounded-4 p-4 text-center h-100 cursor-pointer hover-shadow"
                style={{ 
                  border: '2px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleSeleccionarTipo('individual')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8d4925';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(141,73,37,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                  style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-hammer fs-3 fs-2 color-2"></i>
                </div>
                <h5 className="fw-bold color-1">Subasta Individual</h5>
                <p className="text-muted small mb-2">Ideal para una pieza única.</p>
              </div>
            </div>

            <div className="col-md-6">
              <div 
                className="border rounded-4 p-4 text-center h-100 cursor-pointer hover-shadow position-relative"
                style={{ 
                  border: '2px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleSeleccionarTipo('mega')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8d4925';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(141,73,37,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span className="position-absolute top-0 end-0 m-2 badge" 
                  style={{ background: '#8d4925', color: 'white' }}>
                  - 30 tickets
                </span>
                <div className="bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                  style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-collection fs-2 color-2"></i>
                </div>
                <h5 className="fw-bold color-1">MegaSubasta</h5>
                <p className="text-muted small mb-2">Crea una colección de hasta 5 artículos.</p>
                <p className="text-muted small mb-3">Vende tu serie completa.</p>

                {ticketsUsuario < 30 && (
                  <div className="mt-2 small text-danger">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Tickets insuficientes ({ticketsUsuario}/30)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL DE DETALLE DE SUBASTA */}
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
                {/* Columna izquierda - Tarjetas de MegaSubasta o Imagen principal */}
                <div className="col-lg-6">
                  {subastaDetalle.esMegaSubasta ? (
                    renderArticulosMegaSubasta()
                  ) : (
                    <>
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
                            imagenSeleccionada === subastaDetalle.video_url ? (
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
                        
                        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 bg-dark bg-opacity-50 text-white rounded-pill px-3 py-1 small">
                          {indiceImagenActual + 1} / {todasLasImagenes.length}
                        </div>
                      </div>

                      <div className="row g-2">
                        {[subastaDetalle.foto1_url, subastaDetalle.foto2_url, subastaDetalle.foto3_url].map((img, idx) => (
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
                          {subastaDetalle.video_url ? (
                            <div 
                              className={`rounded-3 shadow-sm cursor-pointer overflow-hidden d-flex flex-column align-items-center justify-content-center ${imagenSeleccionada === subastaDetalle.video_url ? 'border border-3 border-primary' : ''}`}
                              style={{ height: '70px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                              onClick={() => seleccionarImagen(subastaDetalle.video_url, 3)}
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
                    </>
                  )}
                </div>
                              
                {/* Columna derecha - Información de la subasta */}
                <div className="col-lg-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-light rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-hammer fs-3 text-secondary"></i>
                      </div>
                      <div>
                        <h6 className="m-0 fw-bold color-2">
                          {subastaDetalle.esMegaSubasta ? 'Mega Subasta' : 'Subasta'}
                        </h6>
                        {(() => {
                          const estadoConfig = getEstadoConfig(subastaDetalle.estadoPrincipal, subastaDetalle);
                          return (
                            <span className="px-2 py-1 fw-bold text-uppercase d-inline-flex align-items-center gap-1"
                              style={{
                                backgroundColor: estadoConfig.bg,
                                color: estadoConfig.color,
                                border: `1px solid ${estadoConfig.border}`,
                                borderRadius: "20px",
                                fontSize: "10px",
                                background: "rgba(255, 255, 255, 0.9)"
                              }}
                            >
                              <i className={`bi ${estadoConfig.icon}`} style={{ fontSize: '10px' }}></i>
                              {estadoConfig.label}
                            </span>
                          );
                        })()}
                      </div>
                      <div className='ms-auto'>
                        <small className="color-2 fw-bold"> 
                          <i className="bi bi-people me-1 text-muted"></i> {subastaDetalle.total_pujas || 0} Pujas
                        </small>
                      </div>
                    </div>

                    {subastaDetalle.esMegaSubasta && (
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="badge px-3 py-2" style={{ fontSize: '14px', color: '#8d4925', backgroundColor: '#f9e7ca', borderRadius: '8px' }}>
                          <i className="bi bi-collection me-1"></i> MegaSubasta
                        </span>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary">
                          {subastaDetalle.articulos?.length || 0} artículos
                        </span>
                      </div>
                    )}

                    {!subastaDetalle.esMegaSubasta && (
                      <>
                        <span className="fw-bold color-3 mb-1" style={{ fontSize: '12px', textTransform: 'uppercase' }}>{subastaDetalle.categoria}</span>
                        <h2 className="fw-bold color-1 mb-2" style={{ fontSize: '28px' }}>{subastaDetalle.titulo}</h2>
                      </>
                    )}

                    {subastaDetalle.estadoPrincipal === 'FINALIZADA' && (
                      subastaDetalle.ganador_nombre ? (
                        <div className="alert alert-success p-2 mb-3 d-flex align-items-center gap-2" style={{ borderRadius: '12px', fontSize: '14px' }}>
                          <i className="bi bi-trophy-fill fs-5"></i>
                          <span>
                            <strong>¡Subasta vendida!</strong> Ganador: <strong>{subastaDetalle.ganador_nombre}</strong>
                            <br />
                            <small>Monto final: <strong>{formatearPrecio(subastaDetalle.puja_actual_mxn)}</strong></small>
                          </span>
                        </div>
                      ) : (
                        <div className="alert alert-danger p-2 mb-3 d-flex align-items-center gap-2" style={{ borderRadius: '12px', fontSize: '14px' }}>
                          <i className="bi bi-x-circle fs-5"></i>
                          <span>
                            <strong>Subasta finalizada</strong> - No se vendió
                            <br />
                            <small>No hubo pujas registradas</small>
                          </span>
                        </div>
                      )
                    )}

                    <div className="bg-light p-3 rounded-4 my-3 d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block small fw-bold">PUJA ACTUAL</small>
                        <h5 className="color-1 fw-bold m-0">{formatearPrecio(subastaDetalle.puja_actual_mxn)}</h5>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block small fw-bold">CIERRA EN</small>
                        <h5 className="text-muted fw-normal m-0">{subastaDetalle.tiempo || 'No disponible'}</h5>
                      </div>
                    </div>

                    <small className="text-center d-block text-muted fw-bold py-1">PUJA MÍNIMA: {formatearPrecio(subastaDetalle.puja_minima_mxn)}</small>

                    <Card className="border-0 shadow-sm rounded-4 p-4">
                      <h6 className="color-1 fw-bold mb-3">
                        <i className="bi bi-clock-history me-2"></i> Historial de pujas
                      </h6>

                      {subastaDetalle.historial_pujas && subastaDetalle.historial_pujas.length > 0 ? (
                        subastaDetalle.historial_pujas.map((puja, idx) => (
                          <div key={idx} className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                            <div className="d-flex align-items-center">
                              <div className="d-flex justify-content-center align-items-center me-2 overflow-hidden" 
                                style={{ 
                                  width: '35px', 
                                  height: '35px', 
                                  backgroundColor: '#f3e1c7', 
                                  borderRadius: '10%',
                                  flexShrink: 0
                                }}>
                                {puja.foto_perfil_url ? (
                                  <img 
                                    src={puja.foto_perfil_url} 
                                    alt={`Foto de ${puja.nombre || 'Usuario'}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  <i className="bi bi-person color-1"></i>
                                )}
                              </div>
                              <div>
                                <p className="m-0 small fw-bold">{puja.nombre || 'Usuario'}</p>
                                <small className="text-muted" style={{ fontSize: '10px' }}>{puja.tiempo || 'Hace unos segundos'}</small>
                              </div>
                            </div>
                            <span className="fw-bold color-1">{puja.montoFormateado || formatearPrecio(puja.monto)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted text-center small">No hay pujas aún. ¡Sé el primero!</p>
                      )}
                    </Card>
                  </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL DE ARTÍCULO DE MEGASUBASTA */}
      <Modal
        show={showArticuloModal}
        onHide={() => {
          setShowArticuloModal(false);
          setArticuloSeleccionado(null);
          setIndiceArticuloModal(0);
          setIndiceImagenArticulo(0);
        }}
        centered
        size="lg"
        contentClassName="border-0 shadow-lg"
        style={{ borderRadius: '20px' }}
      >
        {renderModalArticulosMegaSubasta()}
      </Modal>

      {/* MODAL DE CREAR/EDITAR SUBASTA */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        dialogClassName="modal-lg"
        contentClassName="border-0 shadow-lg overflow-hidden"
        centered
        style={{borderRadius: "25px", backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}>
          <div className="p-4 text-center text-white" style={{ background: "linear-gradient(to right, #2a140a, #8d4925)" }}>
            <h2 className="fw-bold mb-1 fs-4">{getTituloModal()}</h2>
            <p className="mb-0 small opacity-75">{getSubtituloModal()}</p>
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
            {renderPasoContenido()}
          </div>

          {/* ========== FOOTER DEL MODAL (MODIFICADO) ========== */}
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
                  //  VALIDACIÓN PARA MEGASUBASTA EN EL PASO 2
                  if (paso === 2) {
                    if (formData.esMegaSubasta) {
                      // Verificar que todos los artículos tengan 3 imágenes
                      let tieneError = false;
                      for (let i = 0; i < formData.articulos.length; i++) {
                        const articulo = formData.articulos[i];
                        if (!articulo.imagenes || articulo.imagenes.length < 3) {
                          setValidationMessage(`El artículo #${i + 1} necesita al menos 3 imágenes (tienes ${articulo.imagenes?.length || 0})`);
                          setShowValidationModal(true);
                          tieneError = true;
                          break;
                        }
                      }
                      if (tieneError) return;
                    } else {
                      // Subasta normal: validar 3 imágenes
                      if (formData.imagenes.length < 3) {
                        setShowErrorModal(true);
                        return;
                      }
                    }
                  }
                  setPaso(paso + 1);
                }}
              >
                Siguiente
                <i className="bi bi-arrow-right ms-1"></i>
              </button>
            ) : (
              <div className="d-flex align-items-center gap-3">
                {/*  TICKETS SOLO SI NO ESTÁ EDITANDO */}
                {!modalEditando && formData.esMegaSubasta && (
                  <span className="badge px-3 py-2 rounded-pill fw-bold small color-2" style={{ backgroundColor: "#f6d8a8" }}>
                    30 Tickets
                  </span>
                )}
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

      {/* MODAL DE VALIDACIÓN PERSONALIZADO */}
      <Modal 
        show={showValidationModal} 
        onHide={() => setShowValidationModal(false)}
        centered
        contentClassName="rounded-5"
        style={{backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}
      >
        <div className="p-3 text-white text-center fw-bold rounded-top-5" 
          style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px" }}>
          Campos incompletos
        </div>
        <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
          <div className="d-flex justify-content-center align-items-center mx-auto mb-4" 
            style={{ width: "90px", height: "90px", backgroundColor: "#fff3cd", borderRadius: "30px" }}>
            <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
          </div>
          <h3 className="mb-3" style={{ fontSize: "18px" }}>
            {validationMessage || 'Por favor, completa todos los campos obligatorios'}
          </h3>
          <div className="d-flex flex-column gap-3">
            <button 
              onClick={() => setShowValidationModal(false)} 
              className="btn-2" 
              style={{ borderRadius: "30px", padding: "10px", border: "none", color: "white" }}
            >
              Entendido
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="rounded-5">
          <div className="p-3 text-white text-center fw-bold rounded-top-5" 
              style={{ 
                  background: "linear-gradient(to right, #2a140a, #8d4925)", 
                  fontSize: "20px",
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)'
              }}
          >
              Confirmar eliminación
          </div>

          <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
              <div className="d-flex justify-content-center align-items-center mx-auto mb-4" 
                  style={{ width: "90px", height: "90px", backgroundColor: "#f8d7da", borderRadius: "30px" }}
              >
                  <i className="bi bi-trash fs-1 text-danger"></i>
              </div>

              <h3 className="mb-3" style={{ fontSize: "18px" }}>
                  ¿Estás seguro de que deseas eliminar la Subasta?
              </h3>
              
              <p className="text-muted mb-4">
                  Esta acción no se puede deshacer.
                  <br />
                  <small className="text-warning">
                      <i className="bi bi-info-circle me-1"></i>
                      Solo se pueden eliminar subastas en estado "Pendiente" o "Rechazada".
                  </small>
              </p>

              <div className="d-flex flex-column gap-3">
                  <button 
                      onClick={handleEliminarConfirm} 
                      className="btn-2" 
                      style={{ 
                          borderRadius: "30px", 
                          padding: "10px", 
                          border: "none", 
                          color: "white",
                          backgroundColor: "#C50003"
                      }}
                      disabled={!subastaAEliminar}
                  >
                      <i className="bi bi-trash me-2"></i>
                      Eliminar
                  </button>
                  <Button 
                      variant="outline-secondary"
                      className="flex-grow-1 rounded-pill py-2" 
                      onClick={() => setShowDeleteModal(false)}
                  >
                      Cancelar
                  </Button>
              </div>
          </Modal.Body>
      </Modal>

      {/* MODAL DE ERROR PARA IMÁGENES */}
      <Modal style={{backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}} show={showErrorModal} onHide={() => setShowErrorModal(false)} centered contentClassName="rounded-5">
        <div className="p-3 text-white text-center fw-bold rounded-top-5" 
          style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px", backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}>
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