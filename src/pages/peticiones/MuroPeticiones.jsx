import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

import { peticionesService } from "../../services/peticionesService";
import { authService } from '../../services/authService';

const usuarioActual = { id: 1, nombre: "Tú" };

// Colores para categorías y estilos
const categoryColors = {
  "Arte Visual": "#ce7fc0",
  "Arte Digital": "#82ca9d",
  "Fotografía": "#cb747c",
  "Escultura": "#8884d8",
  "Artesanías": "#ffc658",
  "Coleccionables": "#859ec3"
};

const styleColors = {
  "Realista": "#4a90e2",
  "Fantasía": "#9b59b6",
  "Minimalista": "#95a5a6",
  "Moderno": "#e67e22",
  "Vintage": "#d35400"
};

function Peticiones() {
  const [peticiones, setPeticiones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "", 
    descripcion: "", 
    presupuesto_min: "", 
    presupuesto_max: "", 
    plazo: "",
    categoria: "",
    estilo: ""
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [peticionEliminar, setPeticionEliminar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  const [filtroEstilo, setFiltroEstilo] = useState(null);
  const [showFiltroModal, setShowFiltroModal] = useState(false);
  const [tempCategoria, setTempCategoria] = useState(null);
  const [tempEstilo, setTempEstilo] = useState(null);
  const peticionesPorPagina = 6;

  // Filtrar peticiones
  const peticionesFiltradas = peticiones.filter(p => {
    if (filtroCategoria && p.categoria !== filtroCategoria) return false;
    if (filtroEstilo && p.estilo !== filtroEstilo) return false;
    return true;
  });

  // Calcular índices para paginación
  const indiceUltimo = paginaActual * peticionesPorPagina;
  const indicePrimero = indiceUltimo - peticionesPorPagina;
  const peticionesActuales = peticionesFiltradas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(peticionesFiltradas.length / peticionesPorPagina);

  function formatearFecha(fecha) {
    if (!fecha) return '';

    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function formatearPrecio(precio) {
    if (precio == null) return '';

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

  const { id } = useParams();

  useEffect(() => {
        cargarDatos();
    }, [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const peticionesData = await peticionesService.getPeticiones();
      setPeticiones(peticionesData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const user = authService.getCurrentUser();

  const handleSubmit = async () => {
    try {
      // Validar campos requeridos
      if (!formData.titulo || !formData.descripcion || !formData.categoria) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }

      // Validar presupuestos
      const min = parseFloat(formData.presupuesto_min);
      const max = parseFloat(formData.presupuesto_max);
      
      if (isNaN(min) || isNaN(max)) {
        alert('Por favor ingresa valores válidos para el presupuesto');
        return;
      }

      if (min >= max) {
        alert('El presupuesto mínimo debe ser menor al máximo');
        return;
      }

      // Validar plazo
      const plazo = parseInt(formData.plazo);
      if (isNaN(plazo) || plazo <= 0) {
        alert('Por favor ingresa un plazo válido');
        return;
      }

      // Mapear categoría a ID
      const categoriaMap = {
        "Arte Visual": 1,
        "Arte Digital": 2,
        "Fotografía": 3,
        "Escultura": 4,
        "Artesanías": 5,
        "Coleccionables": 6
      };

      const data = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        presupuesto_min: min,
        presupuesto_max: max,
        plazo_entrega: plazo,
        categoria_id: categoriaMap[formData.categoria],
        estilo: formData.estilo
      };

      console.log('Enviando datos:', data); // Depuración

      const response = await peticionesService.postPeticiones(data);
      alert(response.message);

      // Recargar datos y cerrar modal
      await cargarDatos();
      setShowModal(false);
      
      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        presupuesto_min: '',
        presupuesto_max: '',
        plazo: '',
        categoria: '',
        estilo: ''
      });

    } catch (error) {
      console.error('Error detallado:', error);
      const errorMsg = error.response?.data?.message || 'Error al guardar la petición.';
      alert(errorMsg);
    }
  };

  const handleEdit = (peticion) => {
    setFormData({
      titulo: peticion.titulo || "",
      descripcion: peticion.descripcion || "",
      presupuesto_min: peticion.presupuesto_min_mxn || "",
      presupuesto_max: peticion.presupuesto_max_mxn || "",
      plazo: peticion.plazo_entrega_semanas || "",
      categoria: peticion.categoria_nombre || "",  // Ahora viene del backend
      estilo: peticion.estilo || ""
    });
    
    setEditando(peticion.id);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      // Validar campos requeridos
      if (!formData.titulo || !formData.descripcion || !formData.categoria) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }

      // Validar presupuestos
      const min = parseFloat(formData.presupuesto_min);
      const max = parseFloat(formData.presupuesto_max);
      
      if (isNaN(min) || isNaN(max)) {
        alert('Por favor ingresa valores válidos para el presupuesto');
        return;
      }

      if (min >= max) {
        alert('El presupuesto mínimo debe ser menor al máximo');
        return;
      }

      // Validar plazo
      const plazo = parseInt(formData.plazo);
      if (isNaN(plazo) || plazo <= 0) {
        alert('Por favor ingresa un plazo válido');
        return;
      }

      // Mapear categoría a ID
      const categoriaMap = {
        "Arte Visual": 1,
        "Arte Digital": 2,
        "Fotografía": 3,
        "Escultura": 4,
        "Artesanías": 5,
        "Coleccionables": 6
      };

      const data = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        presupuesto_min: min,
        presupuesto_max: max,
        plazo_entrega: plazo,
        categoria_id: categoriaMap[formData.categoria],
        estilo: formData.estilo
      };

      console.log('Actualizando datos:', data);

      // Llamar al servicio de actualización
      const response = await peticionesService.putPeticion(editando, data);
      alert(response.message);

      // Recargar datos y cerrar modal
      await cargarDatos();
      setShowModal(false);
      setEditando(null);
      
      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        presupuesto_min: '',
        presupuesto_max: '',
        plazo: '',
        categoria: '',
        estilo: ''
      });

    } catch (error) {
      console.error('Error detallado:', error);
      const errorMsg = error.response?.data?.message || 'Error al actualizar la petición.';
      alert(errorMsg);
    }
  };

  const handleChange = (e) =>
    setFormData({...formData, [e.target.name]: e.target.value});

  const handleDelete = (id) => {
    setPeticionEliminar(id);
    setShowDeleteModal(true);
  };

  const confirmarEliminar = async () => {
    try {
        
        // Llamar al servicio para eliminar
        const response = await peticionesService.deletePeticion(peticionEliminar);
        
        // Mostrar mensaje de éxito
        alert(response.message || 'Petición eliminada exitosamente');
        
        // Recargar la lista de peticiones
        await cargarDatos();
        
        // Cerrar el modal
        setShowDeleteModal(false);
        setPeticionEliminar(null);
        
    } catch (error) {
        console.error('Error al eliminar:', error);
        
        // Mostrar mensaje de error específico
        const errorMsg = error.response?.data?.message || 'Error al eliminar la petición';
        alert(errorMsg);
        
    }
};

  // Funciones para filtros
  const abrirFiltros = () => {
    setTempCategoria(filtroCategoria);
    setTempEstilo(filtroEstilo);
    setShowFiltroModal(true);
  };

  const aplicarFiltros = () => {
    setFiltroCategoria(tempCategoria);
    setFiltroEstilo(tempEstilo);
    setPaginaActual(1);
    setShowFiltroModal(false);
  };

  const limpiarFiltros = () => {
    setFiltroCategoria(null);
    setFiltroEstilo(null);
    setPaginaActual(1);
  };

  const limpiarTempFiltros = () => {
    setTempCategoria(null);
    setTempEstilo(null);
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
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
      </div>
    );
  }

  return (
    <>
      <div className="premium-bg">
        <Container className="py-3">
          <Row className="align-items-center mb-3">
            <Col>
              <h1 className="color-2 fw-bold">Peticiones Creativas</h1>
              <p className="color-3 fs-5"> Muro comunitario para solicitar encargos y colaboraciones.</p>
              <Link to="/" className="text-decoration-none text-muted mb-0 d-inline-block">
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Explorador
              </Link>
            </Col>

            <Col xs="auto">
              <Button className="mt-3 btn-linear-gradient" onClick={() => { setShowModal(true); setEditando(null); }}>
                <i className="bi bi-plus-lg me-1"></i>
                Crear Solicitud
              </Button>
            </Col>
          </Row>

          {/* FILA DE FILTROS */}
          <Row className="mb-4">
            <Col xs={12}>
              <div className="d-flex align-items-center gap-3">
                {/* Botón de filtrar (debajo de crear solicitud) */}
                <Button 
                  className="btn-linear-gradient d-flex align-items-center gap-2" 
                  style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }}
                  onClick={abrirFiltros}
                >
                  <i className="bi bi-sliders2"></i>
                  <span>Filtrar</span>
                  {(filtroCategoria || filtroEstilo) && (
                    <span className="badge rounded-pill ms-1" style={{ backgroundColor: '#8d4925', color: 'white', fontSize: '0.75rem' }}>
                      {[filtroCategoria, filtroEstilo].filter(Boolean).length}
                    </span>
                  )}
                </Button>

                {/* Botón limpiar filtros (a la izquierda) - SOLO si hay filtros activos */}
                {(filtroCategoria || filtroEstilo) && (
                  <Button
                    variant="outline-secondary"
                    className="rounded-pill"
                    style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }}
                    onClick={limpiarFiltros}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </Col>
          </Row>

          {/* MODAL DE FILTROS (estilo Shein) */}
          <Modal show={showFiltroModal} 
            onHide={() => setShowFiltroModal(false)} 
            centered 
            contentClassName="border-0 bg-transparent shadow-none rounded-5">
              <div className="p-4 text-white text-center position-relative rounded-top-5" 
                style={{ background: 'linear-gradient(to right, #2a140a, #8d4925)' }}>
                <h4 className="fw-bold mb-0">Filtrar Peticiones</h4>
                <button 
                  className="btn p-0 position-absolute top-0 end-0 m-3 text-white" 
                  onClick={() => setShowFiltroModal(false)}
                >
                  <i className="bi bi-x-lg fs-5"></i>
                </button>
              </div>

              <div className="p-4">
                {/* Categorías */}
                <h6 className="fw-bold color-2 mb-3">Categorías</h6>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {Object.entries(categoryColors).map(([categoria, color]) => (
                    <button
                      key={categoria}
                      className="btn rounded-pill px-3 py-2 fw-bold"
                      style={{
                        backgroundColor: tempCategoria === categoria ? color : '#f0f0f0',
                        color: tempCategoria === categoria ? 'white' : '#333',
                        border: `2px solid ${color}`,
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setTempCategoria(tempCategoria === categoria ? null : categoria)}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>

                {/* Estilos */}
                <h6 className="fw-bold color-2 mb-3">Estilos</h6>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {Object.entries(styleColors).map(([estilo, color]) => (
                    <button
                      key={estilo}
                      className="btn rounded-pill px-3 py-2 fw-bold"
                      style={{
                        backgroundColor: tempEstilo === estilo ? color : '#f0f0f0',
                        color: tempEstilo === estilo ? 'white' : '#333',
                        border: `2px solid ${color}`,
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setTempEstilo(tempEstilo === estilo ? null : estilo)}
                    >
                      {estilo}
                    </button>
                  ))}
                </div>

                {/* Botones de acción */}
                <div className="d-flex gap-3 mt-4">
                  <Button
                    variant="outline-secondary"
                    className="flex-grow-1 rounded-pill py-2"
                    onClick={limpiarTempFiltros}
                  >
                    Limpiar
                  </Button>
                  <Button
                    className="flex-grow-1 btn-2 rounded-pill py-2 text-white"
                    style={{ border: 'none' }}
                    onClick={aplicarFiltros}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
          </Modal>

          <Row>
            {peticionesActuales.length > 0 ? (
              peticionesActuales.map((peticion) => {

              const isMyPeticion = user?.id === peticion.creador_id;
              
              return (
                
                <Col key={peticion.id} xs={12} md={6} lg={4} className="mb-4">
                  <Card className="mov-card shadow-sm p-4 border w-100 h-100">
                    <Row className="align-items-center mb-4">
                      <Col xs="auto">
                        <div className="d-flex justify-content-center align-items-center shadow-sm" style={{ width: "55px", height: "55px", backgroundColor: "#E8B767", borderRadius: "8px" }}>
                          <i className="bi bi-person color-1 fs-4"></i>
                        </div>
                      </Col>

                      <Col>
                        <h6 className="mb-0 fw-semibold color-1"> {peticion.creador_nombre} </h6>
                        <small className="text-muted">{formatearFecha(peticion.fecha_publicacion)}</small>
                      </Col>

                      <Col xs="auto" className="d-flex flex-column align-items-end gap-1">
                        <span className="px-3 py-1 fw-bold" style={{
                          backgroundColor: categoryColors[peticion.categoria_nombre] + "20",
                          borderRadius: "30px",
                          fontSize: "11px",
                          color: categoryColors[peticion.categoria_nombre],
                          border: `1px solid ${categoryColors[peticion.categoria_nombre]}`
                        }}>
                          {peticion.categoria_nombre}
                        </span>
                        <span className="px-3 py-1 fw-bold" style={{
                          backgroundColor: styleColors[peticion.estilo] + "20",
                          borderRadius: "30px",
                          fontSize: "11px",
                          color: styleColors[peticion.estilo],
                          border: `1px solid ${styleColors[peticion.estilo]}`
                        }}>
                          {peticion.estilo}
                        </span>
                      </Col>
                    </Row>

                    <h5 className="fw-bold mb-3 color-2">{peticion.titulo}</h5>
                    <p className="text-muted mb-4" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '48px'
                    }}>
                      {truncateText(peticion.descripcion, 140)}
                    </p>

                    <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "#f7f5f3", borderRadius: "14px" }}>
                      <div>
                        <small className="text-muted color-1">PRESUPUESTO</small>
                        <div className="fw-bold color-1">{formatearPrecio(peticion.presupuesto_min_mxn)} - {formatearPrecio(peticion.presupuesto_max_mxn)}</div>
                      </div>
                      <div>
                        <small className="text-muted color-1">TIEMPO</small>
                        <div className="fw-bold color-1">{peticion.plazo_entrega_semanas} semanas</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center mt-4">
                      <div className="d-flex gap-2">
                        {isMyPeticion && (
                          <>
                            <Button className="btn btn-sm rounded-circle border-0 text-white shadow" style={{ backgroundColor: "#009575" }} onClick={() => handleEdit(peticion)}>
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button className="btn btn-sm rounded-circle border-0 text-white shadow" style={{ backgroundColor: "#C50003" }} onClick={() => handleDelete(peticion.id)}>
                              <i className="bi bi-trash"></i>
                            </Button>
                          </>
                        )}
                      </div>
                      <Link to={`/peticiones/${peticion.id}`} state={{ peticion }} className="text-decoration-none color-1 fw-bold ms-auto">
                        Ver detalles <i className="bi bi-caret-right-fill"></i>
                      </Link>
                    </div>
                  </Card>
                </Col>
              );
            })
            ) : (
              <Col xs={12} className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="text-muted mt-3">No hay peticiones que coincidan con los filtros</p>
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              </Col>
            )}
          </Row>

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPaginaActual(paginaActual - 1)} style={{ color: '#8d4925' }}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>

                  {[...Array(totalPaginas)].map((_, i) => (
                    <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPaginaActual(i + 1)} style={paginaActual === i + 1 ? { backgroundColor: '#8d4925', borderColor: '#8d4925', color: 'white' } : { color: '#8d4925' }}>
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPaginaActual(paginaActual + 1)} style={{ color: '#8d4925' }}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </Container>
      </div>

      {/* MODAL CREAR/EDITAR PETICIÓN */}
      {showModal && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 1040
            }}
            onClick={() => setShowModal(false)}
          ></div>
          <div className="modal d-block" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                <div className="p-4 text-white" style={{ background: "linear-gradient(to right, #2a140a, #8d4925)" }}>
                  <h3 className="fw-bold mb-1">{editando ? "Editar Petición" : "Nueva Petición Creativa"}</h3>
                  <p className="mb-0 small opacity-75"> Publica tu encargo o idea de proyecto. </p>
                </div>

                <div className="modal-body p-4 bg-light">
                  <div className="mb-3">
                    <label className="fw-bold small color-2">Título del Proyecto</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="form-control rounded-3 border-2" placeholder="Ej: Escultura para terraza" />
                  </div>

                  <Row className="mb-3">
                    <Col md={6}>
                      <label className="fw-bold small color-2">Categoría</label>
                      <select name="categoria" value={formData.categoria} onChange={handleChange} className="form-control rounded-3 border-2">
                        <option value="">Selecciona una categoría</option>
                        {Object.keys(categoryColors).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </Col>
                    <Col md={6}>
                      <label className="fw-bold small color-2">Estilo</label>
                      <select name="estilo" value={formData.estilo} onChange={handleChange} className="form-control rounded-3 border-2">
                        <option value="">Selecciona un estilo</option>
                        {Object.keys(styleColors).map(est => (
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
                      <input type="number" name="plazo" value={formData.plazo} onChange={handleChange} className="form-control rounded-3 border-2" placeholder="3 semanas" />
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between align-items-center">
                    <Button className="btn-linear-gradient" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: "#f6d8a8", color: "#8d4925" }}> - 5 Tickets</span>
                      <Button className="btn-linear-gradient" onClick={editando ? handleUpdate : handleSubmit}>
                        {editando ? "Guardar Cambios" : "Publicar Petición"}
                        <i className="bi bi-check-lg ms-2"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      {showDeleteModal && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1040 }}></div>
          <div className="modal d-block" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
                <div className="p-3 text-white text-center fw-bold" style={{ background: "linear-gradient(to right, #2a140a, #8d4925)", fontSize: "20px" }}> Confirmar eliminación</div>
                <div className="modal-body text-center p-5 bg-light">
                  <div className="d-flex justify-content-center align-items-center mx-auto mb-4" style={{ width: "90px", height: "90px", backgroundColor: "#f8d7da", borderRadius: "30px" }}>
                    <i className="bi bi-trash fs-1 text-danger"></i>
                  </div>
                  <h3 className="fw-bold mb-3"> ¿Eliminar petición? </h3>
                  <p className="text-muted mb-4">Esta acción eliminará la petición permanentemente.</p>
                  <div className="d-flex flex-column gap-3">
                    <Button className="btn-2" onClick={confirmarEliminar} style={{ borderRadius: "30px", padding: "10px" }}>Eliminar</Button>
                    <Button  variant="outline-secondary" className="flex-grow-1 rounded-pill py-2"  onClick={() => setShowDeleteModal(false)} style={{ borderRadius: "30px" }}>Cancelar</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Peticiones;