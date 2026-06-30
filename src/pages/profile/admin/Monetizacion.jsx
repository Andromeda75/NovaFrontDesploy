import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { monetizacionService } from '../../../services/monetizacionService';

const MonetizacionAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [comisionGlobal, setComisionGlobal] = useState(8);
  const [ingresosComisiones, setIngresosComisiones] = useState(0);
  const [ingresosPublicidad, setIngresosPublicidad] = useState(0);

  const [publicidades, setPublicidades] = useState([]);

  const [nuevaPublicidad, setNuevaPublicidad] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    precio: '',
    imagen: null
  });
  
  const [imagenPreview, setImagenPreview] = useState(null);

  const colors = {
    brownDark: '#4a2311',    
    brownSecondary: '#8d4925', 
    greenPanel: '#b3be74',   
    pinkPanel: '#cc8099',    
    sandLight: '#f2d9bb',    
    grayDark: '#555555'      
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const comisionData = await monetizacionService.getComision();
      setComisionGlobal(comisionData.comision);
      
      const publicidadesData = await monetizacionService.getPublicidades();
      setPublicidades(publicidadesData.map(p => ({
        id: p.id,
        nombre: p.titulo,
        fechaInicio: p.fecha_inicio ? p.fecha_inicio.split('T')[0] : '',
        fechaFin: p.fecha_fin ? p.fecha_fin.split('T')[0] : '',
        precio: p.precio_mxn,
        imagen_url: p.imagen_url
      })));
      
      const ingresosData = await monetizacionService.getIngresos();
      setIngresosComisiones(ingresosData.ingresos_comisiones);
      setIngresosPublicidad(ingresosData.ingresos_publicidad);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingIndex(null);
    setEditingId(null);
    setNuevaPublicidad({
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
      precio: '',
      imagen: null
    });
    setImagenPreview(null);
  };

  const handleShow = () => {
    setEditingIndex(null);
    setEditingId(null);
    setNuevaPublicidad({
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
      precio: '',
      imagen: null
    });
    setImagenPreview(null);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaPublicidad(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
        setNuevaPublicidad(prev => ({
          ...prev,
          imagen: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const abrirModalEditar = (publicidad, index) => {
    // Formatear fechas de YYYY-MM-DD a YYYY-MM-DD para input date
    const fechaInicioFormateada = publicidad.fechaInicio ? publicidad.fechaInicio : '';
    const fechaFinFormateada = publicidad.fechaFin ? publicidad.fechaFin : '';
    
    setEditingIndex(index);
    setEditingId(publicidad.id);
    setNuevaPublicidad({
      nombre: publicidad.nombre,
      fechaInicio: fechaInicioFormateada,
      fechaFin: fechaFinFormateada,
      precio: publicidad.precio,
      imagen: publicidad.imagen_url,
      imagenActual: publicidad.imagen_url
    });
    setImagenPreview(publicidad.imagen_url);
    setShowModal(true);
  };

  const guardarPublicidad = async () => {
    if (!nuevaPublicidad.nombre.trim()) {
      alert('El nombre de la publicidad es obligatorio');
      return;
    }
    
    try {
      const dataToSend = {
        nombre: nuevaPublicidad.nombre,
        fechaInicio: nuevaPublicidad.fechaInicio,
        fechaFin: nuevaPublicidad.fechaFin,
        precio: nuevaPublicidad.precio,
        imagen: nuevaPublicidad.imagen,
        imagenActual: nuevaPublicidad.imagenActual
      };
      
      if (editingId !== null) {
        await monetizacionService.updatePublicidad(editingId, dataToSend);
      } else {
        await monetizacionService.createPublicidad(dataToSend);
      }
      await cargarDatos();
      handleClose();
    } catch (error) {
      console.error('Error guardando publicidad:', error);
      alert('Error al guardar la publicidad');
    }
  };

  const eliminarPublicidad = async (id, index) => {
    if (window.confirm('¿Estás seguro de eliminar esta publicidad?')) {
      try {
        await monetizacionService.deletePublicidad(id);
        await cargarDatos();
      } catch (error) {
        console.error('Error eliminando publicidad:', error);
        alert('Error al eliminar la publicidad');
      }
    }
  };

  const handleComisionChange = async (e) => {
    const nuevaComision = parseFloat(e.target.value);
    setComisionGlobal(nuevaComision);
    
    try {
      await monetizacionService.updateComision(nuevaComision);
      await cargarDatos();
    } catch (error) {
      console.error('Error actualizando comisión:', error);
      alert('Error al actualizar la comisión');
    }
  };

  const formatearMoneda = (cantidad) => {
    return cantidad.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
    <div className="animate__animated animate__fadeIn">
      <div className="mb-4">
        <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Monetización y Comisiones</h1>
        <p className="text-muted color-2" style={{ fontSize: '18px' }}>Administración de ingresos y configuración comercial del sistema.</p>
      </div>
      
      <div className="row g-3 g-md-4 mb-5">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="d-flex flex-column justify-content-center h-100 p-2">
            <h5 className="fw-bold mb-0" style={{ color: colors.grayDark }}>Comisión por Transacción (8%)</h5>
            <div className="d-flex align-items-center gap-2">
              <input
                type="number"
                value={Number(comisionGlobal).toFixed(1)}
                onChange={handleComisionChange}
                className="form-control form-control-lg fw-bold border-0 p-0"
                style={{ color: '#2d5a27', width: '70px', fontSize: '2.5rem', backgroundColor: 'transparent' }}
                min="0"
                max="100"
                step="0.1"
              />
              <span className="fw-bold" style={{ color: '#2d5a27', fontSize: '2.5rem' }}>%</span>
            </div>
            <p className="small text-muted mb-0">SISTEMA GLOBAL</p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 shadow-sm text-white" 
            style={{ backgroundColor: "#853104", borderRadius: '20px', minHeight: '50px' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex justify-content-center align-items-center rounded-3 flex-shrink-0"
                style={{ width: "50px", height: "50px", backgroundColor: "rgba(255, 255, 255, 0.25)" }}>
                <i className="bi bi-clock-history fs-4"></i>
              </div>
              <div className="d-flex flex-column">
                <span className="fw-bold" style={{ fontSize: '25px', lineHeight: 1.2}}>
                  ${formatearMoneda(ingresosComisiones)}
                </span>
                <span className="small opacity-85" style={{ fontSize: '14px' }}>
                  Ingresos Comisiones
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 shadow-sm text-white" 
            style={{ backgroundColor: "#853104", borderRadius: '20px', minHeight: '50px' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex justify-content-center align-items-center rounded-3 flex-shrink-0"
                style={{ width: "50px", height: "50px", backgroundColor: "rgba(255, 255, 255, 0.25)" }}>
                <i className="bi bi-graph-up-arrow fs-4"></i>
              </div>
              <div className="d-flex flex-column">
                <span className="fw-bold" style={{ fontSize: '25px', lineHeight: 1.2 }}>
                  ${formatearMoneda(ingresosPublicidad)}
                </span>
                <span className="small opacity-85" style={{ fontSize: '0.8rem' }}>
                  Ingresos Publicidad
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-5 mb-3">
        <div className="text-start me-5">
          <h4 className="fw-bold" style={{ color: colors.brownSecondary, letterSpacing: '1px' }}>
            PUBLICIDAD INTERNA
          </h4>
        </div>

        <button 
          className="btn-linear-gradient py-2 px-4 ms-5 mb-3" 
          style={{ borderRadius: '8px' }}
          onClick={handleShow}>
          <i className="bi bi-plus-lg fs-6"></i> 
          <span className="d-none d-xxl-inline ms-2">
            Añadir Publicidad
          </span>
        </button>
      </div>

      {publicidades.length > 0 ? (
        publicidades.map((pub, idx) => (
          <div key={pub.id} className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '15px', maxWidth: '650px' }}>
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
              {pub.imagen_url ? (
                <div className="flex-shrink-0" style={{ width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img 
                    src={pub.imagen_url} 
                    alt={pub.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0" style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #4a2311 0%, #1a0d06 100%)', borderRadius: '12px' }}></div>
              )}
              <div className="flex-grow-1 w-100">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="fw-bold mb-1 color-2">{pub.nombre}</h5>
                  <i 
                    className="bi bi-trash3 text-danger fs-5 cursor-pointer" 
                    onClick={() => eliminarPublicidad(pub.id, idx)}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>

                <div className="row g-0 small text-muted">
                  <div className="col-6">
                    <p className="mb-0">Fecha de Inicio:</p>
                    <p className="fw-bold text-dark">{pub.fechaInicio}</p>
                  </div>
                  <div className="col-6">
                    <p className="mb-0">Fecha de Finalización:</p>
                    <p className="fw-bold text-dark">{pub.fechaFin}</p>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="small fw-bold" style={{ color: colors.grayDark }}>
                    PRECIO: <span className="text-dark">${pub.precio} MXN</span>
                  </span>
                  <button 
                    onClick={() => abrirModalEditar(pub, idx)}
                    className="btn btn-sm px-3 fw-bold d-flex align-items-center gap-2" 
                    style={{ backgroundColor: colors.brownSecondary, color: 'white', borderRadius: '8px' }}>
                    <i className="bi bi-pencil-square"></i> Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted text-center py-4">No hay publicidades registradas</p>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered scrollable size="lg">
        <div className="p-2">
          <Modal.Header className="border-0 pb-0">
            <Modal.Title className="w-100 text-center fw-bold" style={{ color: colors.grayDark }}>
              {editingIndex !== null ? 'Editar Publicidad' : 'Nueva Publicidad'}
            </Modal.Title>
            <div className="text-end">
              <button onClick={handleClose} className="btn border-0 p-0 text-secondary opacity-50 fs-3">
                <i className="bi bi-x-circle-fill"></i>
              </button>
            </div>
          </Modal.Header>
          <Modal.Body className="px-3 px-md-4 pb-4">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small" style={{ color: colors.grayDark }}>Nombre de publicidad:</Form.Label>
                <Form.Control 
                  type="text" 
                  name="nombre"
                  value={nuevaPublicidad.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej. Clases de pintura" 
                  className="rounded-3 border-2" 
                />
              </Form.Group>

              {/* Campo para subir imagen */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small" style={{ color: colors.grayDark }}>Imagen de publicidad:</Form.Label>
                <div 
                  className="border rounded-4 d-flex flex-column align-items-center justify-content-center bg-light position-relative"
                  style={{ 
                    height: '180px', 
                    cursor: 'pointer',
                    backgroundImage: imagenPreview ? `url(${imagenPreview})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderColor: colors.brownSecondary
                  }}
                  onClick={() => document.getElementById('imagenInput').click()}
                >
                  <input
                    id="imagenInput"
                    type="file"
                    accept="image/*"
                    className="position-absolute w-100 h-100 opacity-0"
                    style={{ cursor: 'pointer' }}
                    onChange={handleImageUpload}
                  />
                  {!imagenPreview && (
                    <div className="text-center">
                      <i className="bi bi-image fs-1 text-muted mb-2"></i>
                      <p className="text-muted small mb-0">Haz clic para subir imagen</p>
                      <p className="text-muted small">PNG, JPG hasta 5MB</p>
                    </div>
                  )}
                </div>
                {imagenPreview && (
                  <div className="mt-2 text-end">
                    <button 
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setImagenPreview(null);
                        setNuevaPublicidad(prev => ({ ...prev, imagen: null }));
                      }}
                    >
                      <i className="bi bi-trash me-1"></i> Eliminar imagen
                    </button>
                  </div>
                )}
              </Form.Group>

              {/* Fechas */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <Form.Group>
                    <Form.Label className="fw-bold small" style={{ color: colors.grayDark }}>Fecha de inicio:</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 border-2">
                        <i className="bi bi-calendar3"></i>
                      </span>
                      <Form.Control 
                        type="date" 
                        name="fechaInicio"
                        value={nuevaPublicidad.fechaInicio}
                        onChange={handleInputChange}
                        className="border-start-0 border-2" 
                      />
                    </div>
                  </Form.Group>
                </div>
                <div className="col-12 col-sm-6">
                  <Form.Group>
                    <Form.Label className="fw-bold small" style={{ color: colors.grayDark }}>Fecha de finalización:</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 border-2">
                        <i className="bi bi-calendar3"></i>
                      </span>
                      <Form.Control 
                        type="date" 
                        name="fechaFin"
                        value={nuevaPublicidad.fechaFin}
                        onChange={handleInputChange}
                        className="border-start-0 border-2" 
                      />
                    </div>
                  </Form.Group>
                </div>
              </div>

              {/* Precio */}
              <div className="mt-4">
                <Form.Label className="fw-bold small" style={{ color: colors.grayDark }}>Precio:</Form.Label>
                <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2 w-100 w-sm-auto">
                    <div className="input-group" style={{ maxWidth: '140px' }}>
                      <span className="input-group-text bg-white border-end-0 border-2 fs-5 fw-bold">$</span>
                      <Form.Control 
                        type="number" 
                        name="precio"
                        value={nuevaPublicidad.precio}
                        onChange={handleInputChange}
                        placeholder="500" 
                        className="border-start-0 border-2 fs-5 fw-bold py-1" 
                        step="0.01"
                      />
                    </div>
                    <span className="fw-bold text-secondary">MXN</span>
                  </div>
                  
                  <Button 
                    className="w-100 w-sm-auto ms-sm-auto px-4 py-2 border-0 shadow-sm d-flex align-items-center justify-content-center gap-2" 
                    style={{ backgroundColor: colors.brownSecondary, borderRadius: '12px' }}
                    onClick={guardarPublicidad}
                  >
                    <i className="bi bi-check2-circle fs-5"></i>
                    <span className="fw-bold">{editingIndex !== null ? 'Actualizar' : 'Guardar'}</span>
                  </Button>
                </div>
              </div>
            </Form>
          </Modal.Body>
        </div>
      </Modal>
    </div>
  );
};

export default MonetizacionAdmin;