import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { catalogoService } from '../../../services/catalogoService';
import { authService } from '../../../services/authService';
import MensajeModal from '../../../components/modals/MensajeModal';
import { useModal } from '../../../components/modals/useModal';

const GestorCatalogos = () => {
  const { modal, showModalMessage, hideModal } = useModal();
  const [paso, setPaso] = useState(1);
  const [catalogos, setCatalogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [catalogoActual, setCatalogoActual] = useState(null);
  const [formData, setFormData] = useState({
    categoria: '',
    nombre: '',
    visibilidad: 'PÚBLICO',
    descripcion: '',
    portada: null,
    imagenes: []
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [catalogoAEliminar, setCatalogoAEliminar] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [indiceImagenActual, setIndiceImagenActual] = useState(0);

  const catalogosPorPagina = 7;

  const brandColors = {
    darkBrown: '#4a2311',
    mediumBrown: '#8d4925',
    accentOrange: '#d4a373',
    lightCream: '#f2d9bb',
    textMuted: '#6c757d'
  };

  // Mapeo de nombres de categoría a IDs
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

  // Cargar catálogos al montar el componente
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await catalogoService.getMisCatalogos();
      // Transformar datos del backend al formato que usa el frontend
      const catalogosFormateados = data.map(cat => ({
        id: cat.id,
        categoria: categoriaNombreMap[cat.categoria_id] || 'ARTE DIGITAL',
        nombre: cat.titulo,
        descripcion: cat.descripcion,
        visibilidad: cat.visibilidad === 'publico' ? 'PÚBLICO' : 'PRIVADO',
        archivos: cat.total_obras || 0,
        portada: cat.portada_url || null,
        imagenes: cat.imagenes || [],
        fechaPublicacion: cat.fecha_publicacion ? new Date(cat.fecha_publicacion).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
        autor: cat.autor_nombre || authService.getCurrentUser()?.nombre_completo,
        rating: 4.8
      }));
      setCatalogos(catalogosFormateados);
    } catch (err) {
      console.error('Error cargando catálogos:', err);
      setError('Error al cargar los catálogos');
    } finally {
      setLoading(false);
    }
  };

  // Calcular catálogos para la página actual
  const indiceUltimoCatalogo = paginaActual * catalogosPorPagina;
  const indicePrimerCatalogo = indiceUltimoCatalogo - catalogosPorPagina;
  const catalogosActuales = catalogos.slice(indicePrimerCatalogo, indiceUltimoCatalogo);
  const totalPaginas = Math.ceil(catalogos.length / catalogosPorPagina);

  // Función para mostrar modal de confirmación
  const confirmarEliminar = (catalogo) => {
    setCatalogoAEliminar(catalogo);
    setShowDeleteModal(true);
  };

  // Función para eliminar catálogo
  const eliminarCatalogo = async () => {
    if (catalogoAEliminar) {
      try {
        await catalogoService.eliminarCatalogo(catalogoAEliminar.id);
        await cargarCatalogos(); // Recargar la lista
        setShowDeleteModal(false);
        setCatalogoAEliminar(null);
        showModalMessage('¡Éxito!', 'Catálogo eliminado exitosamente', 'success');
      } catch (err) {
        console.error('Error eliminando catálogo:', err);
        showModalMessage('Error', 'Error al eliminar el catálogo', 'error');
      }
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar subida de imágenes
  const handleImageUpload = (e, tipo) => {
    const files = Array.from(e.target.files);
    
    if (tipo === 'portada' && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          portada: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
    } else if (tipo === 'multimedia') {
      const espaciosDisponibles = 3 - formData.imagenes.length;
      const archivosASubir = files.slice(0, espaciosDisponibles);
      
      if (archivosASubir.length === 0) {
        showModalMessage('Atención', 'Solo puedes subir máximo 3 imágenes adicionales', 'warning');
        return;
      }

      archivosASubir.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            imagenes: [...prev.imagenes, reader.result]
          }));
        };
        reader.readAsDataURL(file);
      });

      if (files.length > espaciosDisponibles) {
        showModalMessage('Atención', `Solo se subieron ${archivosASubir.length} imágenes. Máximo permitido: 3`, 'warning');
      }
    }
  };

  // Publicar catálogo
  const publicarCatalogo = async () => {
    // Validar campos obligatorios
    if (!formData.nombre.trim()) {
      showModalMessage('Atención', 'Por favor, ingresa un nombre para el catálogo', 'warning');
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

    if (!formData.portada) {
      showModalMessage('Atención', 'Por favor, sube una foto de portada', 'warning');
      return;
    }

    try {
      const categoriaId = categoriaMap[formData.categoria];
      
      if (!categoriaId) {
        showModalMessage('Error', 'Categoría no válida', 'error');
        return;
      }
      const dataToSend = {
          titulo: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          categoria_id: categoriaId,
          visibilidad: formData.visibilidad === 'PÚBLICO' ? 'publico' : 'privado',
          portada_url: formData.portada,
          imagenes: formData.imagenes
      };

      if (catalogoActual) {
        // Editar catálogo existente
        await catalogoService.actualizarCatalogo(catalogoActual.id, dataToSend);
        showModalMessage('¡Éxito!', 'Catálogo actualizado exitosamente', 'success');
      } else {
        // Crear nuevo catálogo
        await catalogoService.crearCatalogo(dataToSend);
        showModalMessage('¡Éxito!', 'Catálogo publicado exitosamente', 'success');
      }

      await cargarCatalogos(); // Recargar la lista
      resetFormulario();
      
      // Cerrar modal
      const modal = document.getElementById('modalCatalogo');
      if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
      }
    } catch (err) {
      console.error('Error publicando catálogo:', err);
      showModalMessage('Error', err.response?.data?.message || 'Error al publicar el catálogo', 'error');
    }
  };

  // Editar catálogo
  const editarCatalogo = (catalogo) => {
    setCatalogoActual(catalogo);
    setFormData({
      categoria: catalogo.categoria,
      nombre: catalogo.nombre,
      visibilidad: catalogo.visibilidad,
      descripcion: catalogo.descripcion,
      portada: catalogo.portada || null,
      imagenes: catalogo.imagenes || []
    });
    setPaso(1);
  };

  // Ver detalle del catálogo
  const verDetalle = (catalogo) => {
    setCatalogoActual(catalogo);
    setImagenSeleccionada(catalogo.portada);
    setIndiceImagenActual(0);
  };

  // Seleccionar imagen para ver en grande
  const seleccionarImagen = (img, index) => {
    setImagenSeleccionada(img);
    setIndiceImagenActual(index);
  };

  // Navegar entre imágenes
  const imagenAnterior = () => {
    if (!catalogoActual) return;
    
    const todasLasImagenes = [catalogoActual.portada, ...(catalogoActual.imagenes || [])].filter(Boolean);
    const nuevoIndice = indiceImagenActual > 0 ? indiceImagenActual - 1 : todasLasImagenes.length - 1;
    setIndiceImagenActual(nuevoIndice);
    setImagenSeleccionada(todasLasImagenes[nuevoIndice]);
  };

  const imagenSiguiente = () => {
    if (!catalogoActual) return;
    
    const todasLasImagenes = [catalogoActual.portada, ...(catalogoActual.imagenes || [])].filter(Boolean);
    const nuevoIndice = indiceImagenActual < todasLasImagenes.length - 1 ? indiceImagenActual + 1 : 0;
    setIndiceImagenActual(nuevoIndice);
    setImagenSeleccionada(todasLasImagenes[nuevoIndice]);
  };

  // Resetear formulario
  const resetFormulario = () => {
    setFormData({
      categoria: '',
      nombre: '',
      visibilidad: 'PÚBLICO',
      descripcion: '',
      portada: null,
      imagenes: []
    });
    setCatalogoActual(null);
    setPaso(1);
  };

  // Eliminar imagen individual
  const eliminarImagen = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  if (loading && catalogos.length === 0) {
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
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={cargarCatalogos}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid p-0">
        {/* TÍTULO Y SUBTÍTULO */}
        <div className="text-start mb-3">
          <h1 className="fw-bold mb-0" style={{ fontSize: '28px', color: '#4a2311' }}>Mi Catálogo</h1>
          <p className="text-muted mb-0" style={{ fontSize: '18px' }}>
            Muestra tus servicios y publica tus trabajos para que otros usuarios conozcan tu oferta artística.
          </p>
        </div>

        <div className="row g-3">
          {/* TARJETA CREAR (Dashed) */}
          <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div 
              className="card h-100 d-flex flex-column align-items-center justify-content-center p-3 shadow-sm" 
              style={{ 
                border: `2px dashed ${brandColors.accentOrange}`, 
                borderRadius: '20px',
                backgroundColor: '#fff',
                minHeight: '300px',
                cursor: 'pointer'
              }}
              data-bs-toggle="modal" 
              data-bs-target="#modalCatalogo"
              onClick={() => {
                resetFormulario();
                setPaso(1);
              }}>
              <div className="bg-light rounded-circle p-3 mb-2 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                <i className="bi bi-plus-lg display-5 text-secondary"></i>
              </div>
              <h6 className="text-decoration-none text-muted fw-bold text-center mb-1" style={{ fontSize: '15px' }}>Crear nuevo catálogo</h6>
              <span className="text-muted small">Costo: 10 Tickets</span>
            </div>
          </div>

          {/* CATÁLOGOS EXISTENTES */}
          {catalogosActuales.map(catalogo => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={catalogo.id}>
              <div className="card h-100 border-0 shadow-sm overflow-hidden position-relative" style={{ borderRadius: '20px', minHeight: '300px' }}>
                <div 
                  style={{ 
                    height: '140px', 
                    backgroundImage: catalogo.portada ? `url(${catalogo.portada})` : 'none',
                    backgroundColor: catalogo.portada ? 'transparent' : '#f0f0f0',
                    backgroundSize: 'cover',       
                    backgroundPosition: 'center',  
                    backgroundRepeat: 'no-repeat',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  data-bs-toggle="modal" 
                  data-bs-target="#modalCatalogoV"
                  onClick={() => verDetalle(catalogo)}>
                  {!catalogo.portada && (
                    <i className="bi bi-image text-muted" style={{ fontSize: '2rem' }}></i>
                  )}
                </div>
                <div className="position-absolute top-0 end-0 m-2 d-flex gap-1">
                  <button className="btn btn-sm rounded-circle text-white shadow d-flex align-items-center justify-content-center" 
                    style={{ backgroundColor: "#009575", width: '28px', height: '28px', border: 'none' }}
                    data-bs-toggle="modal" 
                    data-bs-target="#modalCatalogo"
                    onClick={() => editarCatalogo(catalogo)}>
                    <i className="bi bi-pencil" style={{ fontSize: '12px' }}></i>
                  </button>
                  <button className="btn btn-sm rounded-circle text-white shadow d-flex align-items-center justify-content-center" 
                    style={{ backgroundColor: "#C50003", width: '28px', height: '28px', border: 'none' }}
                    onClick={() => confirmarEliminar(catalogo)}>
                    <i className="bi bi-trash" style={{ fontSize: '12px' }}></i>
                  </button>
                </div>
                <div 
                  className="card-body p-3 text-start d-flex flex-column" 
                  data-bs-toggle="modal" 
                  data-bs-target="#modalCatalogoV"
                  onClick={() => verDetalle(catalogo)} 
                  style={{ cursor: 'pointer' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="fw-bold" style={{ color: brandColors.accentOrange, fontSize: '10px' }}>{catalogo.categoria}</small>
                    <span className={`badge ${catalogo.visibilidad === 'PÚBLICO' ? 'bg-success text-white' : 'bg-secondary text-white'} rounded-pill px-2`} style={{ fontSize: '9px' }}>
                      {catalogo.visibilidad}
                    </span>
                  </div>
                  <h6 className="fw-bold mb-1" style={{ color: '#4a2311', fontSize: '15px' }}>{catalogo.nombre}</h6>
                  <p className="small text-muted mb-2 flex-grow-1" style={{ fontSize: '11px', lineHeight: '1.3' }}>
                    {catalogo.descripcion.length > 100 ? catalogo.descripcion.substring(0, 100) + '...' : catalogo.descripcion}
                  </p>
                  <div className="fw-bold small mt-auto" style={{ color: '#8d4925', fontSize: '11px' }}>{catalogo.archivos} archivos</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINACIÓN */}
        {catalogos.length > catalogosPorPagina && (
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination pagination-sm">
                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    style={{ color: '#8d4925' }}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                {[...Array(totalPaginas)].map((_, i) => (
                  <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPaginaActual(i + 1)}
                      style={paginaActual === i + 1 ? { backgroundColor: '#8d4925', borderColor: '#8d4925', color: 'white' } : { color: '#8d4925' }}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    style={{ color: '#8d4925' }}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* MODAL CREAR/EDITAR CATÁLOGO */}
        <div className="modal fade" id="modalCatalogo" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
              
              {/* Cabecera */}
              <div className="p-4 text-center text-white" 
                  style={{ background: 'linear-gradient(to right, #2a140a, #8d4925)' }}>
                <h2 className="fw-bold mb-1 fs-3">
                  {catalogoActual ? 'Editar Catálogo' : 'Crear Nuevo Catálogo'}
                </h2>
                <p className="mb-0 small opacity-75">
                  {catalogoActual ? 'Modifica los detalles de tu catálogo' : 'Agrupa tus mejores obras bajo un mismo concepto.'}
                </p>
              </div>

              <div className="modal-body p-4 p-lg-5 bg-white">
                {paso === 1 ? (
                  <div className="row g-4">
                    {/* Columna de Formulario */}
                    <div className="col-12 col-md-7 text-start">
                      <div className="mb-3">
                        <label className="fw-bold mb-1 small" style={{ color: brandColors.mediumBrown }}>Categoría</label>
                        <select 
                          className="form-select form-select-sm rounded-pill border-2"
                          name="categoria"
                          value={formData.categoria}
                          onChange={handleInputChange}>
                          <option value="">Selecciona una categoría</option>
                          <option>ARTE VISUAL</option>
                          <option>ARTE DIGITAL</option>
                          <option>FOTOGRAFÍA</option>
                          <option>ESCULTURA</option>
                          <option>ARTESANÍAS</option>
                          <option>COLECCIONABLES</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="fw-bold mb-1 small" style={{ color: brandColors.mediumBrown }}>Nombre del Catálogo</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm rounded-pill border-2" 
                          placeholder="Ej: Serie Minimalista 2024"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange} />
                      </div>
                      <div className="mb-3">
                        <label className="fw-bold mb-1 small" style={{ color: brandColors.mediumBrown }}>Visibilidad</label>
                        <div className="d-flex gap-2">
                          <button 
                            type="button"
                            className={`btn btn-sm flex-grow-1 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-1 ${formData.visibilidad === 'PÚBLICO' ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => setFormData(prev => ({...prev, visibilidad: 'PÚBLICO'}))}>
                            <i className="bi bi-eye"></i> <span className="small">Público</span>
                          </button>
                          <button 
                            type="button"
                            className={`btn btn-sm flex-grow-1 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-1 ${formData.visibilidad === 'PRIVADO' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => setFormData(prev => ({...prev, visibilidad: 'PRIVADO'}))}>
                            <i className="bi bi-eye-slash"></i> <span className="small">Privado</span>
                          </button>
                        </div>
                      </div>
                      <div className="mb-0">
                        <label className="fw-bold mb-1 small" style={{ color: brandColors.mediumBrown }}>Descripción</label>
                        <textarea 
                          className="form-control rounded-3 border-2 small" 
                          rows="3" 
                          placeholder="Describe el concepto..."
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleInputChange}></textarea>
                      </div>
                    </div>

                    {/* Columna de Foto de Portada */}
                    <div className="col-12 col-md-5 d-flex flex-column">
                      <label className="fw-bold mb-2 small text-start" style={{ color: brandColors.mediumBrown }}>Fotografía de Portada</label>
                      <div 
                        className="border-2 rounded-4 d-flex flex-column align-items-center justify-content-center p-3 bg-light position-relative" 
                        style={{ 
                          borderStyle: 'dashed', 
                          borderColor: brandColors.accentOrange, 
                          height: '300px',
                          backgroundImage: formData.portada ? `url(${formData.portada})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}>
                        {!formData.portada ? (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              className="position-absolute w-100 h-100 opacity-0"
                              style={{ top: 0, left: 0, cursor: 'pointer' }}
                              onChange={(e) => handleImageUpload(e, 'portada')}
                            />
                            <i className="bi bi-camera-fill fs-2 mb-1" style={{ color: brandColors.mediumBrown }}></i>
                            <h6 className="fw-bold text-dark mb-0 small">Subir Foto de Portada</h6>
                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>PNG, JPG hasta 10MB</p>
                          </>
                        ) : (
                          <>
                            <button 
                              type="button"
                              className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center shadow"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              onClick={() => setFormData(prev => ({...prev, portada: null}))}>
                              <i className="bi bi-x"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Paso 2: Multimedia */
                  <div className="text-start">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h4 className="fw-bold mb-0" style={{ color: brandColors.darkBrown }}>Multimedia</h4>
                      <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                        {formData.imagenes.length}/3 imágenes
                      </span>
                    </div>
                    <p className="small text-muted mb-4">Sube las imágenes de tus servicios y trabajos (máximo 3).</p>
                    
                    {/* ÁREA DE SUBIDA Y VISTA PREVIA INTEGRADA */}
                    <div className="border rounded-4 p-3 bg-light" style={{ borderColor: brandColors.accentOrange }}>
                      
                      {/* Grid de imágenes subidas */}
                      {formData.imagenes.length > 0 ? (
                        <>
                          <div className="row g-2 mb-3">
                            {formData.imagenes.map((img, index) => (
                              <div className="col-4" key={index}>
                                <div className="position-relative">
                                  <div 
                                    className="w-100 rounded-3 border bg-white d-flex align-items-center justify-content-center overflow-hidden"
                                    style={{ 
                                      height: '100px',
                                      backgroundColor: '#f8f9fa'
                                    }}
                                  >
                                    <img 
                                      src={img} 
                                      alt={`Imagen ${index + 1}`}
                                      style={{ 
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                      }}
                                    />
                                  </div>
                                  <button 
                                    type="button"
                                    className="btn btn-sm rounded-circle bg-white position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center shadow"
                                    style={{ width: '22px', height: '22px', padding: 0 }}
                                    onClick={() => eliminarImagen(index)}>
                                    <i className="bi bi-x" style={{ fontSize: '14px' }}></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Área para agregar más imágenes */}
                          {formData.imagenes.length < 3 && (
                            <div className="border-2 rounded-4 d-flex align-items-center justify-content-center p-2 bg-white position-relative" 
                                style={{ borderStyle: 'dashed', borderColor: brandColors.accentOrange, height: '50px' }}>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="position-absolute w-100 h-100 opacity-0"
                                style={{ top: 0, left: 0, cursor: 'pointer' }}
                                onChange={(e) => handleImageUpload(e, 'multimedia')}
                              />
                              <div className="d-flex align-items-center text-muted">
                                <i className="bi bi-plus-circle me-2" style={{ color: brandColors.mediumBrown }}></i>
                                <small>Agregar más ({3 - formData.imagenes.length} disponibles)</small>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Área inicial cuando no hay imágenes */
                        <div className="border-2 rounded-4 d-flex flex-column align-items-center justify-content-center p-4 bg-white position-relative" 
                            style={{ borderStyle: 'dashed', borderColor: brandColors.accentOrange, height: '180px' }}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="position-absolute w-100 h-100 opacity-0"
                            style={{ top: 0, left: 0, cursor: 'pointer' }}
                            onChange={(e) => handleImageUpload(e, 'multimedia')}
                          />
                          <i className="bi bi-cloud-upload fs-1 mb-2" style={{ color: brandColors.mediumBrown }}></i>
                          <h6 className="fw-bold text-dark mb-1">Subir Fotos</h6>
                          <p className="text-muted small text-center mb-0">Arrastra o haz clic para seleccionar<br/>Máximo 3 imágenes</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER ACCIONES */}
              <div className="modal-footer border-0 p-4 pt-0 d-flex justify-content-between">
                {paso === 1 ? (
                  <>
                    <button type="button" className="btn-linear-gradient py-2 px-4 rounded-pill" data-bs-dismiss="modal" onClick={resetFormulario}>Cancelar</button>
                    <button type="button" className="btn-linear-gradient py-2 px-4 rounded-pill text-white" onClick={() => setPaso(2)}>
                      Siguiente paso <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn-linear-gradient py-2 px-4 rounded-pill" onClick={() => setPaso(1)}>
                      <i className="bi bi-arrow-left me-2"></i> Anterior
                    </button>
                    <div className="d-flex align-items-center gap-4">
                      {!catalogoActual && (
                        <span className="badge px-3 py-2 rounded-pill fw-bold small" style={{ backgroundColor: '#f6d8a8', color: '#8d4925' }}>
                          - 10 Tickets
                        </span>
                      )}
                      <button type="button" className="btn-linear-gradient py-2 px-4 rounded-pill text-white" onClick={publicarCatalogo} data-bs-dismiss="modal">
                        {catalogoActual ? 'Guardar Cambios' : 'Publicar Catálogo'} <i className="bi bi-check-lg ms-2"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL DETALLE CATÁLOGO */}
        <div className="modal fade" id="modalCatalogoV" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
              <div className="bg-white">
                <div className="p-4 p-lg-5">
                  <button 
                    type="button"
                    className="btn text-decoration-none p-0 mb-4 fw-bold border-0 bg-transparent d-flex align-items-center" 
                    data-bs-dismiss="modal"
                    style={{ fontSize: '14px', color: brandColors.mediumBrown }}
                  >
                    <i className="bi bi-arrow-left me-2"></i> Volver
                  </button>

                  {catalogoActual && (
                    <div className="row g-4">
                      <div className="col-lg-7">
                        {/* VISOR PRINCIPAL DE IMAGEN CON FLECHAS */}
                        <div className="position-relative">
                          <div 
                            className="bg-light rounded-4 mb-3 d-flex align-items-center justify-content-center shadow-sm overflow-hidden" 
                            style={{ 
                              height: '350px',
                              backgroundColor: '#f8f9fa',
                              position: 'relative'
                            }}
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
                              <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                            )}
                          </div>
                          
                          {/* Flechas de navegación */}
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
                          
                          {/* Indicador de imagen actual */}
                          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 bg-dark bg-opacity-50 text-white rounded-pill px-3 py-1 small">
                            {indiceImagenActual + 1} / {(catalogoActual.portada ? 1 : 0) + (catalogoActual.imagenes?.length || 0)}
                          </div>
                        </div>
                        
                        {/* Miniaturas seleccionables */}
                        <div className="row g-2">
                          {catalogoActual.portada && (
                            <div className="col-3">
                              <div 
                                className={`bg-light rounded-3 shadow-sm border d-flex align-items-center justify-content-center overflow-hidden ${imagenSeleccionada === catalogoActual.portada ? 'border border-3 border-primary' : ''}`}
                                style={{ height: '70px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                                onClick={() => seleccionarImagen(catalogoActual.portada, 0)}
                              >
                                <img 
                                  src={catalogoActual.portada} 
                                  alt="Portada"
                                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {catalogoActual.imagenes && catalogoActual.imagenes.slice(0, 3).map((img, index) => {
                            const indiceReal = catalogoActual.portada ? index + 1 : index;
                            return (
                              <div className="col-3" key={index}>
                                <div 
                                  className={`bg-light rounded-3 shadow-sm border d-flex align-items-center justify-content-center overflow-hidden ${imagenSeleccionada === img ? 'border border-3 border-primary' : ''}`}
                                  style={{ height: '70px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                                  onClick={() => seleccionarImagen(img, indiceReal)}
                                >
                                  <img 
                                    src={img} 
                                    alt={`Imagen ${index + 1}`}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="col-lg-5">
                        <div className="p-2">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold" style={{ color: brandColors.mediumBrown, fontSize: '12px' }}>
                              {catalogoActual.categoria}
                            </span>
                            <span className={`badge ${catalogoActual.visibilidad === 'PÚBLICO' ? 'bg-success text-white' : 'bg-secondary text-white'} rounded-pill px-2`} style={{ fontSize: '10px' }}>
                              {catalogoActual.visibilidad}
                            </span>
                          </div>
                          <h2 className="fw-bold mb-2" style={{ fontSize: '24px', color: '#4a2311' }}>
                            {catalogoActual.nombre}
                          </h2>
                          <p className="text-muted small mb-3">Publicado: {catalogoActual.fechaPublicacion}</p>

                          <div className="mt-2">
                            <h6 className="fw-bold mb-2" style={{ color: '#4a2311' }}>Descripción detallada</h6>
                            <p className="text-muted small lh-base">
                              {catalogoActual.descripcion}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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
              ¿Estás seguro de que deseas eliminar el catálogo?
            </h3>    
            <p className="text-muted mb-4">Esta acción no se puede deshacer.</p>

            <div className="d-flex flex-column gap-3">
              <Button className="btn-2" onClick={eliminarCatalogo} style={{ borderRadius: "30px", padding: "10px", border: "none", color: "white" }}> 
                Eliminar
              </Button>
              <Button variant="outline-secondary"
                      className="flex-grow-1 rounded-pill py-2" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
            </div>
          </Modal.Body>
        </Modal>
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
};

export default GestorCatalogos;