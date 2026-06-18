import React, { useState, useEffect } from 'react';
import ConfirmarCategoriaModal from '../../../components/modals/confirmaciones/ConfirmarCategoriaModal';
import PoliticasPanel from '../../../components/modals/PoliticasModal';
import { configuracionService } from '../../../services/configuracionService';
import MensajeModal from '../../../components/modals/MensajeModal';
import { useModal } from '../../../components/modals/useModal';

const ConfiguracionGlobal = () => {
  const { modal, showModalMessage, hideModal } = useModal();
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [tituloPolitica, setTituloPolitica] = useState("");
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [accionConfirmacion, setAccionConfirmacion] = useState(null);
  const [showEditarPolitica, setShowEditarPolitica] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estado para el documento
  const [documentoInfo, setDocumentoInfo] = useState({ url: null, nombre: null, fecha: null });
  
  const [categorias, setCategorias] = useState([]);
  const [politicas, setPoliticas] = useState({
    titulo: "Términos y Condiciones",
    fechaEdicion: "No definida"
  });

  const brand = {
    darkBrown: '#4a2311',
    accentOrange: '#8d4925',
    tagGray: '#dee2e6',
    successGreen: '#2d6a4f'
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
    cargarDocumentoInfo();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar categorías
      const categoriasData = await configuracionService.getCategorias();
      setCategorias(categoriasData);
      
      // Cargar políticas
      const politicasData = await configuracionService.getPoliticas();
      setPoliticas(politicasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showModalMessage('Error', 'Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarDocumentoInfo = async () => {
    try {
      const info = await configuracionService.getDocumentoInfo();
      setDocumentoInfo(info);
    } catch (error) {
      console.error('Error cargando información del documento:', error);
    }
  };

  const handleOpen = () => {
    setEditingIndex(null);
    setEditingId(null);
    setNombreCategoria("");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setNombreCategoria("");
    setEditingIndex(null);
    setEditingId(null);
  };

  const handleEditCategoria = (categoria) => {
    setEditingIndex(categorias.findIndex(c => c.id === categoria.id));
    setEditingId(categoria.id);
    setNombreCategoria(categoria.nombre);
    setShowModal(true);
  };

  const handleDeleteCategoria = async (id) => {
    try {
      await configuracionService.deleteCategoria(id);
      await cargarDatos();
      showModalMessage('¡Éxito!', 'Categoría eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      showModalMessage('Error', error.response?.data?.message || 'Error al eliminar la categoría', 'error');
    }
  };

  const handleDeleteAllCategorias = async () => {
    try {
      await configuracionService.deleteAllCategorias();
      await cargarDatos();
      showModalMessage('¡Éxito!', 'Todas las categorías han sido eliminadas', 'success');
    } catch (error) {
      console.error('Error eliminando todas las categorías:', error);
      showModalMessage('Error', error.response?.data?.message || 'Error al eliminar las categorías', 'error');
    }
  };

  const handleGuardarCategoria = async () => {
    if (!nombreCategoria.trim()) {
      showModalMessage('Atención', 'El nombre de la categoría es obligatorio', 'warning');
      return;
    }
    
    try {
      if (editingId !== null) {
        await configuracionService.updateCategoria(editingId, nombreCategoria);
        showModalMessage('¡Éxito!', 'Categoría actualizada exitosamente', 'success');
      } else {
        await configuracionService.createCategoria(nombreCategoria);
        showModalMessage('¡Éxito!', 'Categoría creada exitosamente', 'success');
      }
      await cargarDatos();
      handleClose();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      showModalMessage('Error', error.response?.data?.message || 'Error al guardar la categoría', 'error');
    }
  };

  // Subir documento
  const handleSubirDocumento = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          showModalMessage('Atención', 'El archivo no debe superar los 10MB', 'warning');
          return;
        }
        
        try {
          await configuracionService.uploadDocumento(file);
          await cargarDocumentoInfo();
          await cargarDatos();
          showModalMessage('¡Éxito!', `Documento "${file.name}" subido correctamente`, 'success');
        } catch (error) {
          console.error('Error subiendo documento:', error);
          showModalMessage('Error', error.response?.data?.message || 'Error al subir el documento', 'error');
        }
      }
    };
    input.click();
  };

  // Eliminar documento
  const handleEliminarDocumento = async () => {
    try {
      await configuracionService.deleteDocumento();
      await cargarDocumentoInfo();
      showModalMessage('¡Éxito!', 'Documento eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error eliminando documento:', error);
      showModalMessage('Error', 'Error al eliminar el documento', 'error');
    }
  };

  // Ver documento
  const handleVerDocumento = () => {
    if (documentoInfo.url) {
      window.open(documentoInfo.url, '_blank');
    } else {
      showModalMessage('Información', 'No hay documento disponible', 'info');
    }
  };

  const handleEditarPolitica = () => {
    setTituloPolitica(politicas.titulo);
    setShowEditarPolitica(true);
  };

  const handleClosePolitica = () => {
    setShowEditarPolitica(false);
    setTituloPolitica(politicas.titulo);
  };

  const handleGuardarPolitica = async () => {
    try {
      await configuracionService.updatePolitica(tituloPolitica);
      await cargarDatos();
      setShowEditarPolitica(false);
      showModalMessage('¡Éxito!', 'Política actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error guardando política:', error);
      showModalMessage('Error', 'Error al guardar la política', 'error');
    }
  };

  const confirmarAccion = async () => {
    if (accionConfirmacion === "delete" && categoriaAEliminar !== null) {
      await handleDeleteCategoria(categoriaAEliminar);
      setCategoriaAEliminar(null);
    }

    if (accionConfirmacion === "deleteAll") {
      await handleDeleteAllCategorias();
    }

    setAccionConfirmacion(null);
    setShowConfirmacion(false);
  };

  if (loading && categorias.length === 0) {
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
      <div className="animate__animated animate__fadeIn">
        <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Configuración Global</h1>
        <p className="text-muted mb-4 color-2" style={{ fontSize: '18px' }}>Controla las categorías, políticas y banners de la plataforma.</p>

        {/* SECCIÓN CATEGORÍAS */}
        <section className="mb-5">
          <h4 className="fw-bold mb-3" style={{ color: brand.accentOrange }}>Categorías</h4>
          <div className="card border-0 shadow-sm p-4 bg-light position-relative" style={{ borderRadius: '15px', maxWidth: '800px' }}>
            <div className="d-flex flex-wrap gap-3">
              {categorias.map((cat) => (
                <div 
                  key={cat.id} 
                  className="px-4 py-2 fw-bold text-secondary d-flex align-items-center gap-2"
                  style={{ backgroundColor: brand.tagGray, borderRadius: '10px' }}
                >
                  <span>{cat.nombre}</span>
                  <i 
                    className="bi bi-pencil-square" 
                    style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}
                    onClick={() => handleEditCategoria(cat)}
                  ></i>
                  <i 
                    className="bi bi-trash3" 
                    style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#C50003' }}
                    onClick={() => {
                      setCategoriaAEliminar(cat.id);
                      setAccionConfirmacion("delete");
                      setShowConfirmacion(true);
                    }}
                  ></i>
                </div>
              ))}
              <button onClick={handleOpen} className="btn px-4 py-2 fw-bold d-flex align-items-center gap-2 border-0" style={{ backgroundColor: brand.tagGray, borderRadius: '10px', color: '#6c757d' }}>
                <i className="bi bi-plus-square"></i> Nueva
              </button>
            </div>
            {categorias.length > 0 && (
              <div className="position-absolute py-5 end-0 m-4 d-flex gap-2">
                <button 
                  className="btn btn-sm rounded-circle color-white shadow" 
                  style={{ backgroundColor: "#C50003"}}
                  onClick={() => {
                    setAccionConfirmacion("deleteAll");
                    setShowConfirmacion(true);
                  }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SECCIÓN POLÍTICAS */}
        <section className="mb-5">
          <h4 className="fw-bold mb-3" style={{ color: brand.accentOrange }}>Políticas</h4>
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '15px', maxWidth: '800px' }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3" style={{ backgroundColor: '#fdf0d5', borderRadius: '12px' }}>
                  <i className="bi bi-flag-fill fs-3" style={{ color: '#d4a373' }}></i>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: brand.darkBrown }}>{politicas.titulo}</h5>
                    <p className="text-muted small mb-0 text-uppercase" style={{ fontSize: '0.65rem' }}>Editado {politicas.fechaEdicion}</p>
                    {documentoInfo.nombre && (
                      <p className="text-muted small mb-0 mt-1">
                        <i className="bi bi-file-pdf me-1"></i> 
                        Documento: {documentoInfo.nombre}
                      </p>
                    )}
                  </div>
                  <i 
                    className="bi bi-pencil-square" 
                    style={{ cursor: 'pointer', fontSize: '1rem', color: '#555' }}
                    onClick={handleEditarPolitica}
                  ></i>
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {documentoInfo.url && (
                  <>
                    <button 
                      onClick={handleVerDocumento}
                      className="btn btn-info text-white px-3 fw-bold" 
                      style={{ borderRadius: '10px' }}
                    >
                      <i className="bi bi-eye me-2"></i> Ver Documento
                    </button>
                    <button 
                      onClick={handleEliminarDocumento}
                      className="btn btn-danger px-3 fw-bold" 
                      style={{ borderRadius: '10px' }}
                    >
                      <i className="bi bi-trash me-2"></i> Eliminar
                    </button>
                  </>
                )}
                <button 
                  onClick={handleSubirDocumento}
                  className="btn text-white px-4 fw-bold" 
                  style={{ backgroundColor: brand.successGreen, borderRadius: '10px' }}
                >
                  <i className="bi bi-upload me-2"></i> 
                  {documentoInfo.url ? 'Actualizar Documento' : 'Subir Documento'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MODAL PARA EDITAR/AGREGAR CATEGORÍA */}
        {showModal && (
          <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
            onClick={handleClose}
          >
            <div 
              className="card border-0 shadow-lg p-4 animate__animated animate__zoomIn" 
              style={{ width: '100%', maxWidth: '500px', borderRadius: '20px', backgroundColor: '#f5f5f5' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-end">
                <button onClick={handleClose} className="btn border-0 p-0 text-secondary opacity-50 fs-3">
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              </div>

              <div className="px-3 pb-3">
                <h2 className="text-center fw-bold mb-4" style={{ color: '#555' }}>
                  {editingIndex !== null ? 'Editar Categoria' : 'Nueva Categoria'}
                </h2>
                
                <label className="fw-bold mb-2 d-block" style={{ color: '#555', fontSize: '1.2rem' }}>Nombre</label>
                <div className="d-flex align-items-center gap-3">
                  <input 
                    type="text" 
                    className="form-control form-control-lg border-secondary-subtle flex-grow-1" 
                    style={{ borderRadius: '12px' }}
                    value={nombreCategoria}
                    onChange={(e) => setNombreCategoria(e.target.value)}
                    placeholder="Ej: Arte Digital"
                  />
                  <button 
                    onClick={handleGuardarCategoria}
                    className="btn btn-lg text-white px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
                    style={{ backgroundColor: brand.accentOrange, borderRadius: '12px' }}
                  >
                    <i className="bi bi-check2-circle"></i> 
                    {editingIndex !== null ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PARA EDITAR POLÍTICA */}
        {showEditarPolitica && (
          <PoliticasPanel
            tituloPolitica={tituloPolitica}
            setTituloPolitica={setTituloPolitica}
            handleGuardarPolitica={handleGuardarPolitica}
            handleClosePolitica={handleClosePolitica}
            brand={brand}
          />
        )}

        {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR CATEGORÍAS */}
        <ConfirmarCategoriaModal
          show={showConfirmacion}
          handleClose={() => setShowConfirmacion(false)}
          confirmarEliminar={confirmarAccion}
          accion={accionConfirmacion}
        />
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

export default ConfiguracionGlobal;