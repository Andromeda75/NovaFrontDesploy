import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { articuloService } from "../../../services/articuloService";
import { authService } from '../../../services/authService';
import MensajeModal from '../../../components/modals/MensajeModal';
import { useModal } from '../../../components/modals/useModal';

const MisArticulos = () => {
  const { modal, showModalMessage, hideModal } = useModal();
  const [paso, setPaso] = useState(1);
  const [tabActiva, setTabActiva] = useState("activos");
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const articulosPorPagina = 8;

  // Estados para formulario
  const [editando, setEditando] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [articuloEliminar, setArticuloEliminar] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const [showModalArticulo, setShowModalArticulo] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [indiceImagenActual, setIndiceImagenActual] = useState(0);
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "",
    descripcion: "",
    precio: "",
    imagenes: [],
    video: null,
    documento: null
  });

  // Mapeo de categorías a IDs
  const categoriaMap = {
    'ARTE VISUAL': 1,
    'ARTE DIGITAL': 2,
    'FOTOGRAFÍA': 3,
    'ESCULTURA': 4,
    'ARTESANÍAS': 5,
    'COLECCIONABLES': 6
  };

  // Mapeo inverso de IDs a nombres
  const categoriaNombreMap = {
    1: 'ARTE VISUAL',
    2: 'ARTE DIGITAL',
    3: 'FOTOGRAFÍA',
    4: 'ESCULTURA',
    5: 'ARTESANÍAS',
    6: 'COLECCIONABLES'
  };

  // Mapeo de estados
  const estadoMap = {
      'En revisión': 'PENDIENTE',
      'Publicado': 'APROBADO',
      'Rechazado': 'RECHAZADO',
      'Vendido': 'VENDIDO'
  };

  // Cargar artículos al montar el componente
  useEffect(() => {
    cargarArticulos();
  }, []);

  // Función para comprimir imagen
  const comprimirImagen = (file, maxWidth = 800, maxHeight = 800, calidad = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', calidad);
          resolve(base64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const cargarArticulos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await articuloService.getMisArticulos();
      const articulosFormateados = data.map(art => ({
        id: art.id,
        titulo: art.titulo,
        categoria: categoriaNombreMap[art.categoria_id] || 'ARTE VISUAL',
        fecha: art.fecha_publicacion ? new Date(art.fecha_publicacion).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
        precio: art.precio_mxn ? art.precio_mxn.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00",
        estado: estadoMap[art.estado_nombre] || 'EN REVISION',
        tipo: obtenerTipoPorEstado(art.estado_nombre),
        img1: art.foto1_url || null,
        img2: art.foto2_url || null,
        img3: art.foto3_url || null,
        video: art.video_url || null,
        documento: art.documento_url || null,
        descripcion: art.descripcion || "Sin descripción"
      }));
      setArticulos(articulosFormateados);
    } catch (err) {
      console.error('Error cargando artículos:', err);
      setError('Error al cargar los artículos');
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar el tipo de pestaña según el estado
const obtenerTipoPorEstado = (estadoNombre) => {
    switch (estadoNombre) {
        case 'Publicado':
            return 'activos';      // Artículos publicados y disponibles
        case 'En revisión':
            return 'publicados';      // ← CAMBIADO: ahora también aparecen en "activos"
        case 'Rechazado':
            return 'pendientes';   // Artículos rechazados (se pueden editar)
        case 'Vendido':
            return 'vendidos';     // Artículos ya vendidos
        default:
            return 'pendientes';
    }
};

  // Filtrar artículos por pestaña
  const articulosFiltrados = articulos.filter(
    (articulo) => articulo.tipo === tabActiva
  );

  // Calcular paginación
  const indiceUltimo = paginaActual * articulosPorPagina;
  const indicePrimero = indiceUltimo - articulosPorPagina;
  const articulosActuales = articulosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(articulosFiltrados.length / articulosPorPagina);

  // Resetear formulario
  const resetFormulario = () => {
    setFormData({
      titulo: "",
      categoria: "",
      descripcion: "",
      precio: "",
      imagenes: [],
      video: null,
      documento: null
    });
  };

  // Manejar cambios en formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar subida de imágenes
  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showModalMessage('Atención', 'Por favor, selecciona un archivo de imagen válido', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showModalMessage('Atención', 'La imagen no debe superar los 5MB', 'warning');
      return;
    }

    try {
      const imagenComprimida = await comprimirImagen(file, 800, 800, 0.7);

      setFormData(prev => {
        const nuevasImagenes = [...prev.imagenes];
        nuevasImagenes[index] = imagenComprimida;
        return { ...prev, imagenes: nuevasImagenes };
      });
    } catch (error) {
      console.error('Error comprimiendo imagen:', error);
      showModalMessage('Error', 'Error al procesar la imagen', 'error');
    }
  };

  // Manejar subida de video
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        setFormData(prev => ({ ...prev, video: reader.result }));
      };
      reader.readAsDataURL(file);
    };

    video.src = URL.createObjectURL(file);
  };

  // Manejar subida de documento
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      setFormData(prev => ({ ...prev, documento: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Publicar/Guardar artículo
  const publicarArticulo = async () => {
    if (!formData.titulo.trim()) {
      showModalMessage('Atención', 'Por favor, ingresa un título para el artículo', 'warning');
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

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      showModalMessage('Atención', 'Por favor, ingresa un precio válido', 'warning');
      return;
    }

    if (formData.imagenes.length < 3) {
      setShowErrorModal(true);
      return;
    }

    try {
      const categoriaId = categoriaMap[formData.categoria];

      if (!categoriaId) {
        showModalMessage('Error', 'Categoría no válida', 'error');
        return;
      }

      const dataToSend = {
        titulo: formData.titulo.trim(),
        categoria_id: categoriaId,
        descripcion: formData.descripcion.trim(),
        precio_mxn: parseFloat(formData.precio),
        imagenes: formData.imagenes,
        video: formData.video || null,
        documento: formData.documento || null
      };

      if (editando) {
        await articuloService.actualizarArticulo(editando, dataToSend);
      } else {
        await articuloService.crearArticulo(dataToSend);
      }

      await cargarArticulos();
      resetFormulario();
      setEditando(null);
      setShowModalArticulo(false);
      setPaso(1);
      showModalMessage('¡Éxito!', 'Artículo publicado exitosamente', 'success');
    } catch (err) {
      console.error('Error publicando artículo:', err);
      showModalMessage('Error', err.response?.data?.message || 'Error al publicar el artículo', 'error');
    }
  };

  // Editar artículo
  const handleEdit = (articulo) => {
    if (articulo.tipo !== "publicados") return;

    setShowDetalleModal(false);

    setEditando(articulo.id);
    setFormData({
      titulo: articulo.titulo,
      categoria: articulo.categoria,
      descripcion: articulo.descripcion,
      precio: articulo.precio.replace(/,/g, ''),
      imagenes: [articulo.img1, articulo.img2, articulo.img3].filter(Boolean),
      video: articulo.video || null,
      documento: articulo.documento || null
    });
    setPaso(1);
    setShowModalArticulo(true);
  };

  // Abrir modal para crear nuevo artículo
  const handleNuevoArticulo = () => {
    resetFormulario();
    setEditando(null);
    setPaso(1);
    setShowModalArticulo(true);
  };

  // Ver detalle del artículo
  const verDetalle = (articulo) => {
    setArticuloSeleccionado(articulo);
    setImagenSeleccionada(articulo.img1);
    setIndiceImagenActual(0);
    setShowDetalleModal(true);
  };

  // Seleccionar imagen para ver en grande
  const seleccionarImagen = (img, index) => {
    setImagenSeleccionada(img);
    setIndiceImagenActual(index);
  };

  // Navegar entre imágenes
  const todasLasImagenes = articuloSeleccionado
    ? [articuloSeleccionado.img1, articuloSeleccionado.img2, articuloSeleccionado.img3, articuloSeleccionado.video].filter(Boolean)
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

  // Eliminar artículo
  const confirmarEliminar = (id) => {
    setArticuloEliminar(id);
    setShowDeleteModal(true);
    setShowDetalleModal(false);
  };

  const eliminarArticulo = async () => {
    if (articuloEliminar) {
      try {
        await articuloService.eliminarArticulo(articuloEliminar);
        await cargarArticulos();
        setShowDeleteModal(false);
        setArticuloEliminar(null);

        const nuevosFiltrados = articulos.filter(a => a.tipo === tabActiva);
        const nuevasTotalPaginas = Math.ceil(nuevosFiltrados.length / articulosPorPagina);
        if (paginaActual > nuevasTotalPaginas && nuevasTotalPaginas > 0) {
          setPaginaActual(nuevasTotalPaginas);
        } else if (nuevosFiltrados.length === 0) {
          setPaginaActual(1);
        }
      } catch (err) {
        console.error('Error eliminando artículo:', err);
        showModalMessage('Error', 'Error al eliminar el artículo', 'error');
      }
    }
  };

  // Eliminar imagen individual
  const eliminarImagen = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  // Verificar si se puede editar
  const puedeEditar = (tipo) => tipo === "publicados";

  // Función para obtener configuración de estado
  const getEstadoConfig = (estado) => {
    switch (estado) {
      case "APROBADO":
        return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-check-circle-fill" };
      case "EN REVISION":
        return { bg: "#fffffff5", color: "#e65100", border: "#e65100", icon: "bi-clock-history" };
      case "RECHAZADO":
        return { bg: "#fffffff5", color: "#b02a37", border: "#b02a37", icon: "bi-x-circle-fill" };
      case "VENDIDO":
        return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-cart-check-fill" };
      default:
        return { bg: "#fffffff5", color: "#495057", border: "#495057", icon: "bi-question-circle" };
    }
  };

  if (loading && articulos.length === 0) {
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
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={cargarArticulos}>
          Reintentar
        </button>
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
                <h3 className="fw-bold color-1 mb-0">Mis Artículos</h3>
                <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}> Gestiona las ventas de tus artículos.</p>
              </div>

              <button
                className="btn-linear-gradient py-2 px-4"
                style={{ borderRadius: '8px' }}
                onClick={handleNuevoArticulo}
              >
                <i className="bi bi-upload me-2"></i> Subir Artículo
              </button>
            </div>

            <div className="d-flex mb-4 p-1 gap-2 rounded-pill shadow-sm color-2" style={{ backgroundColor: '#f6d8a8', width: 'fit-content' }} >
              {["activos", "publicados", "vendidos"].map((tab) => (
                <button
                  key={tab}
                  className={`btn rounded-pill px-4 fw-bold small color-2 ${tabActiva === tab ? 'bg-white shadow-sm' : 'opacity-75'}`}
                  onClick={() => {
                    setTabActiva(tab);
                    setPaginaActual(1);
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="row g-3">
              {articulosActuales.length > 0 ? (
                articulosActuales.map((articulo) => {
                  const estadoConfig = getEstadoConfig(articulo.estado);

                  return (
                    <div key={articulo.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                      <div
                        className="card border-0 shadow-sm overflow-hidden position-relative h-100 d-flex flex-column"
                        style={{
                          borderRadius: '20px',
                          minHeight: '300px',
                          cursor: 'pointer'
                        }}
                        onClick={() => verDetalle(articulo)}
                      >
                        <div
                          className="position-relative"
                          style={{
                            height: '140px',
                            backgroundImage: `url(${articulo.img1 || ''})`,
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
                            <span>{articulo.estado}</span>
                          </span>

                          <div className="position-absolute top-0 end-0 m-2 d-flex gap-1" style={{ zIndex: 2 }}>
                            {puedeEditar(articulo.tipo) && (
                              <button
                                className="btn btn-sm rounded-circle text-white shadow d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: '#009575', width: '26px', height: '26px', border: 'none' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleEdit(articulo);
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
                                confirmarEliminar(articulo.id);
                              }}
                            >
                              <i className="bi bi-trash" style={{ fontSize: '11px' }}></i>
                            </button>
                          </div>
                        </div>

                        <div className="card-body p-3 d-flex flex-column flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="fw-bold color-3" style={{ fontSize: '9px' }}>{articulo.categoria}</small>
                          </div>
                          <h6 className="fw-bold mb-1" style={{ color: '#4a2311', fontSize: '14px' }}>{articulo.titulo}</h6>
                          <p className="small text-muted mb-2 flex-grow-1" style={{ fontSize: '10px', lineHeight: '1.3' }}>
                            {articulo.descripcion.length > 50 ? articulo.descripcion.substring(0, 50) + '...' : articulo.descripcion}
                          </p>
                          <div className="d-flex justify-content-between align-items-center mt-auto pt-1 border-top">
                            <div>
                              <small className="text-muted d-block" style={{ fontSize: '8px' }}>FECHA</small>
                              <span className="fw-bold color-1" style={{ fontSize: '10px' }}>{articulo.fecha}</span>
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-block" style={{ fontSize: '8px' }}>PRECIO</small>
                              <span className="fw-bold color-2" style={{ fontSize: '10px' }}> ${articulo.precio} MXN</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted">No hay artículos en esta sección.</p>
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

      {/* MODAL DE DETALLE */}
      <Modal
        show={showDetalleModal}
        onHide={() => setShowDetalleModal(false)}
        dialogClassName="modal-xl"
        contentClassName="border-0 shadow-lg overflow-hidden"
        centered
        style={{ borderRadius: '25px' }}
      >
        <div className="bg-white p-4">
          <button
            className="btn p-0 mb-3 fw-bold border-0 bg-transparent d-flex align-items-center"
            onClick={() => setShowDetalleModal(false)}
            style={{ color: '#8d4925' }}
          >
            <i className="bi bi-arrow-left me-2"></i> Volver
          </button>

          {articuloSeleccionado && (() => {
            const estadoConfig = getEstadoConfig(articuloSeleccionado.estado);

            return (
              <div className="row g-4">
                <div className="col-lg-7">
                  <div className="position-relative mb-3">
                    <div
                      className="bg-light rounded-4 d-flex align-items-center justify-content-center shadow-sm overflow-hidden"
                      style={{
                        height: '400px',
                        backgroundColor: '#f8f9fa',
                        position: 'relative'
                      }}
                    >
                      {imagenSeleccionada ? (
                        imagenSeleccionada === articuloSeleccionado.video ? (
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
                    <div className="col-3">
                      <div
                        className={`bg-light rounded-3 shadow-sm border d-flex align-items-center justify-content-center overflow-hidden ${imagenSeleccionada === articuloSeleccionado.img1 ? 'border border-3 border-primary' : ''}`}
                        style={{ height: '70px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                        onClick={() => seleccionarImagen(articuloSeleccionado.img1, 0)}
                      >
                        <img
                          src={articuloSeleccionado.img1}
                          alt="Imagen 1"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                    <div className="col-3">
                      <div
                        className={`bg-light rounded-3 shadow-sm border d-flex align-items-center justify-content-center overflow-hidden ${imagenSeleccionada === articuloSeleccionado.img2 ? 'border border-3 border-primary' : ''}`}
                        style={{ height: '70px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                        onClick={() => seleccionarImagen(articuloSeleccionado.img2, 1)}
                      >
                        <img
                          src={articuloSeleccionado.img2}
                          alt="Imagen 2"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                    <div className="col-3">
                      <div
                        className={`bg-light rounded-3 shadow-sm border d-flex align-items-center justify-content-center overflow-hidden ${imagenSeleccionada === articuloSeleccionado.img3 ? 'border border-3 border-primary' : ''}`}
                        style={{ height: '70px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                        onClick={() => seleccionarImagen(articuloSeleccionado.img3, 2)}
                      >
                        <img
                          src={articuloSeleccionado.img3}
                          alt="Imagen 3"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                    {articuloSeleccionado.video ? (
                      <div className="col-3">
                        <div
                          className={`bg-light rounded-3 shadow-sm border d-flex flex-column align-items-center justify-content-center overflow-hidden ${imagenSeleccionada === articuloSeleccionado.video ? 'border border-3 border-primary' : ''}`}
                          style={{ height: '70px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                          onClick={() => seleccionarImagen(articuloSeleccionado.video, 3)}
                        >
                          <i className="bi bi-camera-video-fill fs-2 text-secondary"></i>
                          <small className="text-muted" style={{ fontSize: '8px' }}>Video</small>
                        </div>
                      </div>
                    ) : (
                      <div className="col-3">
                        <div
                          className="bg-light rounded-3 shadow-sm d-flex flex-column align-items-center justify-content-center"
                          style={{ height: '70px', backgroundColor: '#f8f9fa', opacity: 0.5 }}
                        >
                          <i className="bi bi-camera-video-off fs-2 text-secondary"></i>
                          <small className="text-muted" style={{ fontSize: '8px' }}>Sin video</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-bag fs-4 text-secondary"></i>
                    </div>
                    <div>
                      <h6 className="m-0 fw-bold color-2">Artículo</h6>
                      <span className="px-2 py-1 fw-bold text-uppercase d-inline-flex align-items-center gap-1"
                        style={{
                          backgroundColor: estadoConfig.bg,
                          color: estadoConfig.color,
                          border: `1px solid ${estadoConfig.border}`,
                          borderRadius: "20px",
                          fontSize: "10px"
                        }}
                      >
                        <i className={`bi ${estadoConfig.icon}`} style={{ fontSize: '10px' }}></i>
                        <span>{articuloSeleccionado.estado}</span>
                      </span>
                    </div>
                  </div>

                  <span className="fw-bold d-block mb-1" style={{ color: '#8d4925', fontSize: '11px' }}>
                    {articuloSeleccionado.categoria}
                  </span>
                  <h2 className="fw-bold mb-2" style={{ fontSize: '22px', color: '#4a2311' }}>
                    {articuloSeleccionado.titulo}
                  </h2>
                  <p className="text-muted small mb-2">Publicado: {articuloSeleccionado.fecha}</p>

                  <div className="bg-light p-3 rounded-4 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block small fw-bold">PRECIO</small>
                        <h4 className="color-1 fw-bold m-0">${articuloSeleccionado.precio} MXN</h4>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="fw-bold mb-2" style={{ color: '#4a2311', fontSize: '18px' }}>Descripción detallada</h6>
                    <p className="text-muted small lh-base" style={{ fontSize: '15px' }}>
                      {articuloSeleccionado.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* MODAL DE ARTÍCULO (CREAR/EDITAR) */}
      <Modal
        show={showModalArticulo}
        onHide={() => setShowModalArticulo(false)}
        dialogClassName="modal-lg"
        contentClassName="border-0 shadow-lg overflow-hidden"
        centered
        style={{ borderRadius: "25px" }}
      >
        <div className="p-4 text-center text-white" style={{ background: 'linear-gradient(to right, #2a140a, #8d4925)' }}>
          <h2 className="fw-bold mb-1 fs-4">{editando ? "Editar Artículo" : "Publica tu obra maestra"}</h2>
          <p className="mb-0 small opacity-75">{editando ? "EDITAR ARTÍCULO" : "SUBIR NUEVO ARTÍCULO"}</p>
          <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
            {[1, 2, 3].map(num => (
              <div key={num} className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '32px',
                  height: '32px',
                  fontSize: '0.85rem',
                  backgroundColor: paso === num ? '#E8B767' : 'white',
                  color: paso === num ? 'white' : '#8d4925'
                }}> {num} </div>
            ))}
          </div>
        </div>

        <div className="modal-body p-4 bg-white" style={{ overflowY: 'auto', maxHeight: "60vh" }}>
          {paso === 1 && (
            <div className="row g-3 animate__animated animate__fadeIn">
              <div className="col-12 text-start">
                <h5 className="fw-bold mb-3 color-1">Información Básica</h5>

                <div className="mb-3">
                  <label className="fw-bold mb-1 small color-2">Título del Artículo</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className="form-control form-control-sm rounded-pill border-2"
                    placeholder="Ej: Escultura Orgánica de Nogal"
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-bold mb-1 small color-2">Categoría</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="form-select form-select-sm rounded-pill border-2"
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="ARTE VISUAL">ARTE VISUAL</option>
                    <option value="ARTE DIGITAL">ARTE DIGITAL</option>
                    <option value="FOTOGRAFÍA">FOTOGRAFÍA</option>
                    <option value="ESCULTURA">ESCULTURA</option>
                    <option value="ARTESANÍAS">ARTESANÍAS</option>
                    <option value="COLECCIONABLES">COLECCIONABLES</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="fw-bold mb-1 small color-2">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className="form-control rounded-3 border-2 small"
                    rows="3"
                    placeholder="Cuéntanos la historia de tu pieza..."
                  />
                </div>
              </div>
            </div>
          )}

          {paso === 2 && (
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
                                    eliminarImagen(index);
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

                <div className="col-md-6">
                  <div className="border rounded-4 p-4 bg-white shadow-sm" style={{ border: '1px solid #e0e0e0' }}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="bg-light rounded-3 p-2">
                        <i className="bi bi-camera-video fs-3 color-2"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1 color-1">Video de Verificación</h6>
                        <p className="text-muted small mb-0">Opcional (máx. 30 seg)</p>
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
                            onClick={() => setFormData(prev => ({ ...prev, video: null }))}
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
                            onClick={() => setFormData(prev => ({ ...prev, documento: null }))}
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
                <div className="alert alert-warning mt-4 small rounded-3" style={{ border: '1px solid #ffeeba' }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Debes subir al menos <strong>3 fotos</strong> para continuar
                </div>
              )}
            </div>
          )}

          {paso === 3 && (
            <div className="animate__animated animate__fadeIn text-start">
              <div className="mb-3">
                <label className="fw-bold mb-1 small color-2">Precio (MXN)</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  className="form-control form-control-sm rounded-pill border-2"
                  placeholder="$ 0.00"
                  min="0"
                  step="100"
                />
              </div>

              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="terminos" />
                <label className="form-check-label small fw-bold color-2" htmlFor="terminos">
                  Acepto los términos y las comisiones de la plataforma (3%)
                </label>
              </div>

              <div className="alert py-2 px-3 small border-0 color-2" style={{ backgroundColor: '#f6d8a8', borderRadius: '12px' }}>
                <h6 className="fw-bold mb-1"> <i className="bi bi-shield-check me-2"></i> Tu seguridad es nuestra prioridad</h6>
                <p>Todos los artículos pasan por un proceso de verificación manual. Una vez aprobado, recibirás una notificación y tu pieza aparecerá en el feed principal.</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer border-0 p-3 d-flex justify-content-between">
          {paso > 1 ? (
            <button className="btn-linear-gradient py-2 px-3" style={{ borderRadius: '8px', fontSize: '0.85rem' }} onClick={() => setPaso(paso - 1)}>
              <i className="bi bi-arrow-left me-1"></i> Anterior
            </button>
          ) : (
            <button className="btn-linear-gradient py-2 px-3" style={{ borderRadius: '8px', fontSize: '0.85rem' }} onClick={() => setShowModalArticulo(false)}>
              Cancelar
            </button>
          )}

          {paso < 3 ? (
            <button className="btn-linear-gradient py-2 px-3" style={{ borderRadius: '8px', fontSize: '0.85rem' }} onClick={() => {
              if (paso === 2 && formData.imagenes.length < 3) {
                setShowErrorModal(true);
              } else {
                setPaso(paso + 1);
              }
            }}>
              Siguiente <i className="bi bi-arrow-right ms-1"></i>
            </button>
          ) : (
            <div className="d-flex align-items-center gap-3">
              <span className="badge px-3 py-2 rounded-pill fw-bold small color-2" style={{ backgroundColor: '#f6d8a8' }}>
                - 30 Tickets
              </span>
              <button
                className="btn-linear-gradient py-2 px-3"
                style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                onClick={publicarArticulo}
              >
                {editando ? "Guardar Cambios" : "Publicar"} <i className="bi bi-check-lg ms-1"></i>
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="rounded-5">
        <div className="p-3 text-white text-center fw-bold rounded-top-5"
          style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px" }}>
          Confirmar eliminación
        </div>
        <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
          <div className="d-flex justify-content-center align-items-center mx-auto mb-4" style={{ width: "90px", height: "90px", backgroundColor: "#f8d7da", borderRadius: "30px" }}>
            <i className="bi bi-trash fs-1 text-danger"></i>
          </div>
          <h3 className="mb-3" style={{ fontSize: "18px" }}>
            ¿Estás seguro de que deseas eliminar este artículo?
          </h3>
          <p className="text-muted mb-4">Esta acción no se puede deshacer.</p>
          <div className="d-flex flex-column gap-3">
            <button
              onClick={eliminarArticulo}
              className="btn-2"
              style={{ borderRadius: "30px", padding: "10px", border: "none", color: "white" }}
            >
              Eliminar
            </button>
            <Button variant="outline-secondary"
              className="flex-grow-1 rounded-pill py-2" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* MODAL DE ERROR PARA IMÁGENES */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered contentClassName="rounded-5">
        <div className="p-3 text-white text-center fw-bold rounded-top-5"
          style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px" }}>
          Imágenes insuficientes
        </div>
        <Modal.Body className="text-center p-5 bg-light rounded-bottom-5">
          <div className="d-flex justify-content-center align-items-center mx-auto mb-4" style={{ width: "90px", height: "90px", backgroundColor: "#fff3cd", borderRadius: "30px" }}>
            <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
          </div>
          <h3 className="mb-3" style={{ fontSize: "18px" }}>
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

export default MisArticulos;