import React, { useState, useEffect } from 'react';
import { ticketsAdminService } from '../../../services/ticketsAdminService';
import MensajeModal from '../../../components/modals/MensajeModal';
import { useModal } from '../../../components/modals/useModal';
import ConfirmacionDeleteModal from '../../../components/modals/confirmaciones/ConfirmarDeleteModal';

const SistemaTickets = () => {32
  const { modal, showModalMessage, hideModal } = useModal();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paqueteAEliminar, setPaqueteAEliminar] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [paquetes, setPaquetes] = useState([]);
  const [reglasConsumo, setReglasConsumo] = useState([]);
  const [ingresosTickets, setIngresosTickets] = useState(0);
  const [loading, setLoading] = useState(true);

  const [nuevoPaquete, setNuevoPaquete] = useState({
    nombre: '',
    tickets: '',
    tickets_extra: 0,
    precio: '',
    descripcion: ''
  });

  const brand = {
    darkBrown: '#4a2311',
    accentOrange: '#8d4925',
    purplePanel: '#853104',
    grayDark: '#555555',
    lightSand: '#f2d9bb'
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const paquetesData = await ticketsAdminService.getPaquetes();
      setPaquetes(paquetesData);
      
      const reglasData = await ticketsAdminService.getReglasConsumo();
      setReglasConsumo(reglasData);
      
      const ingresosData = await ticketsAdminService.getIngresosTickets();
      setIngresosTickets(ingresosData.ingresos);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showModalMessage('Error', 'Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoPaquete(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const abrirModalNuevo = () => {
    setEditingIndex(null);
    setEditingId(null);
    setNuevoPaquete({
      nombre: '',
      tickets: '',
      tickets_extra: 0,
      precio: '',
      descripcion: ''
    });
    setShowModal(true);
  };

  const abrirModalEditar = (paquete, index) => {
    setEditingIndex(index);
    setEditingId(paquete.id);
    setNuevoPaquete({
      nombre: paquete.nombre,
      tickets: paquete.cantidad_tickets,
      tickets_extra: paquete.tickets_extra || 0,
      precio: paquete.precio_mxn,
      descripcion: paquete.descripcion || ''
    });
    setShowModal(true);
  };

  const guardarPaquete = async () => {
    if (!nuevoPaquete.nombre.trim()) {
      showModalMessage('Atención', 'El nombre del paquete es obligatorio', 'warning');
      return;
    }
    
    if (!nuevoPaquete.tickets || nuevoPaquete.tickets <= 0) {
      showModalMessage('Atención', 'La cantidad de tickets debe ser mayor a 0', 'warning');
      return;
    }
    
    if (!nuevoPaquete.precio || nuevoPaquete.precio <= 0) {
      showModalMessage('Atención', 'El precio debe ser mayor a 0', 'warning');
      return;
    }
    
    try {
      const dataToSend = {
        nombre: nuevoPaquete.nombre,
        cantidad_tickets: parseInt(nuevoPaquete.tickets),
        tickets_extra: parseInt(nuevoPaquete.tickets_extra) || 0,
        precio_mxn: parseFloat(nuevoPaquete.precio),
        descripcion: nuevoPaquete.descripcion || null
      };
      
      if (editingId !== null) {
        await ticketsAdminService.updatePaquete(editingId, dataToSend);
        showModalMessage('¡Éxito!', 'Paquete actualizado exitosamente', 'success');
      } else {
        await ticketsAdminService.createPaquete(dataToSend);
        showModalMessage('¡Éxito!', 'Paquete creado exitosamente', 'success');
      }
      
      await cargarDatos();
      setShowModal(false);
    } catch (error) {
      console.error('Error guardando paquete:', error);
      showModalMessage('Error', error.response?.data?.message || 'Error al guardar el paquete', 'error');
    }
  };

  const confirmarEliminar = (paqueteId) => {
    setPaqueteAEliminar(paqueteId);
    setShowDeleteConfirm(true);
  };

  const eliminarPaquete = async () => {
    if (paqueteAEliminar) {
      try {
        await ticketsAdminService.deletePaquete(paqueteAEliminar);
        await cargarDatos();
        showModalMessage('¡Éxito!', 'Paquete eliminado exitosamente', 'success');
        setShowDeleteConfirm(false);
        setPaqueteAEliminar(null);
      } catch (error) {
        console.error('Error eliminando paquete:', error);
        showModalMessage('Error', 'Error al eliminar el paquete', 'error');
      }
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
      <div className="animate__animated animate__fadeIn">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-start">
            <h1 className="fw-bold color-1 mb-1" style={{ fontSize: '32px' }}>Sistema de Tickets</h1>
            <p className="text-muted mb-4 color-2" style={{ fontSize: '18px' }}>Configuración de paquetes, monetización y reglas de consumo.</p>
          </div>

          <button 
            onClick={abrirModalNuevo}
            className="btn-linear-gradient py-2 px-4" 
            style={{ borderRadius: '8px' }}>
            <i className="bi bi-plus-lg fs-6"></i>
            <span className="d-none d-xxl-inline ms-2">
              Añadir Paquete
            </span>
          </button>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <h4 className="fw-bold mb-4" style={{ color: brand.accentOrange }}>Configurar Paquetes</h4>
            
            {paquetes.length > 0 ? (
              paquetes.map((pkg, idx) => (
                <div key={pkg.id} className="card border-0 shadow-sm p-3 mb-3" style={{ borderRadius: '15px' }}>
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                    <div className="flex-shrink-0" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #4a2311 0%, #1a0d06 100%)', borderRadius: '10px' }}></div>

                    <div className="flex-grow-1 w-100">
                      <div className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold mb-0 color-2" style={{ color: brand.darkBrown }}>{pkg.nombre}</h4>
                        <button 
                          onClick={() => confirmarEliminar(pkg.id)} 
                          className="btn btn-link text-danger p-0"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    
                      <div className="d-flex flex-wrap align-items-end justify-content-between mt-2 gap-2">
                        <div>
                          <span className="h4 fw-bold mb-0" style={{ color: brand.accentOrange }}>{pkg.cantidad_tickets}</span>
                          <span className="ms-2 text-muted">Tickets</span>
                          {pkg.tickets_extra > 0 && (
                            <span className="ms-2 badge" style={{ backgroundColor: brand.accentOrange, color: 'white' }}>
                              +{pkg.tickets_extra} Extra
                            </span>
                          )}
                          <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>ID: p{pkg.id}</p>
                        </div>
                        
                        <div className="text-sm-end">
                          <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Precio:</p>
                          <p className="fw-bold mb-0 color-3">${pkg.precio_mxn} MXN</p>
                        </div>

                        <button 
                          onClick={() => abrirModalEditar(pkg, idx)}
                          className="btn btn-sm text-white px-3 py-2" 
                          style={{ backgroundColor: brand.accentOrange, borderRadius: '8px' }}
                        >
                          <i className="bi bi-pencil-square me-1"></i> Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No hay paquetes configurados</p>
              </div>
            )}
          </div>

          <div className="col-12 col-lg-4">
            <div className="p-3 shadow-sm mb-3 text-white" 
              style={{ backgroundColor: brand.purplePanel, borderRadius: '20px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex justify-content-center align-items-center rounded-3 flex-shrink-0"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "rgba(255, 255, 255, 0.25)"
                  }}>
                  <i className="bi bi-ticket-perforated fs-4"></i>
                </div>
                <div className="d-flex flex-column">
                  <span className="fw-bold" style={{ fontSize: '25px', lineHeight: 1.2 }}>{ingresosTickets.toLocaleString()}</span>
                  <span className="small opacity-85" style={{ fontSize: '14px' }}>Ingresos Tickets</span>
                </div>
              </div>
            </div>

            <div className="p-4 text-white shadow-sm" style={{ backgroundColor: brand.darkBrown, borderRadius: '20px' }}>
              <h5 className="fw-bold mb-1">Reglas de consumo</h5>
              <p className="small opacity-75 mb-4">Acciones y su costo en tickets.</p>
              
              <div className="row g-2">
                {reglasConsumo.map((regla, i) => (
                  <div key={i} className="col-4">
                    <div className="p-2 text-center h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                      <p className="mb-0 fw-bold" style={{ fontSize: '0.7rem' }}>{regla.label}</p>
                      <p className="mb-0 opacity-75" style={{ fontSize: '0.65rem' }}>{regla.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de creación/edición */}
        {showModal && (
          <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 3000, overflowY: 'auto' }}
          >
            <div 
              className="card border-0 shadow-lg p-3 p-md-4 w-100" 
              style={{ maxWidth: '500px', borderRadius: '25px', backgroundColor: '#ffffff' }}
            >
              <div className="text-end">
                <button onClick={() => setShowModal(false)} className="btn border-0 p-0 text-secondary opacity-50 fs-3">
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              </div>

              <h3 className="text-center fw-bold mb-4" style={{ color: '#555' }}>Datos Paquete</h3>

              <div className="row g-3">
                <div className="col-12">
                  <label className="fw-bold text-secondary small mb-1">Nombre del Paquete:</label>
                  <input 
                    type="text" 
                    className="form-control fw-bold border-2" 
                    name="nombre"
                    value={nuevoPaquete.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Explorador" 
                    style={{ borderRadius: '12px' }} 
                  />
                </div>

                <div className="col-6">
                  <label className="fw-bold text-secondary small mb-1">Tickets:</label>
                  <input 
                    type="number" 
                    className="form-control fw-bold border-2" 
                    name="tickets"
                    value={nuevoPaquete.tickets}
                    onChange={handleInputChange}
                    placeholder="50" 
                    style={{ borderRadius: '12px' }} 
                  />
                </div>

                <div className="col-6">
                  <label className="fw-bold text-secondary small mb-1">Tickets Extra:</label>
                  <input 
                    type="number" 
                    className="form-control fw-bold border-2" 
                    name="tickets_extra"
                    value={nuevoPaquete.tickets_extra}
                    onChange={handleInputChange}
                    placeholder="0" 
                    style={{ borderRadius: '12px' }} 
                  />
                </div>

                <div className="col-12">
                  <label className="fw-bold text-secondary small mb-1">Descripción:</label>
                  <textarea 
                    className="form-control border-2" 
                    rows="2" 
                    name="descripcion"
                    value={nuevoPaquete.descripcion}
                    onChange={handleInputChange}
                    placeholder="Ideal para explorar..." 
                    style={{ borderRadius: '12px' }}
                  ></textarea>
                </div>

                <div className="col-12 mt-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-1">
                      <span className="h5 mb-0 text-muted fw-bold">$</span>
                      <input 
                        type="number" 
                        className="form-control fw-bold text-center border-2" 
                        name="precio"
                        value={nuevoPaquete.precio}
                        onChange={handleInputChange}
                        placeholder="180" 
                        style={{ borderRadius: '12px', width: '90px' }} 
                      />
                      <span className="small fw-bold text-secondary">MXN</span>
                    </div>
                    
                    <button 
                      onClick={guardarPaquete}
                      className="btn btn-lg text-white px-4 py-2 fw-bold shadow flex-grow-1 flex-sm-grow-0" 
                      style={{ backgroundColor: brand.accentOrange, borderRadius: '15px' }}
                    >
                      <i className="bi bi-check2-circle me-2"></i>Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 3000 }}
        >
          <div 
            className="card border-0 shadow-lg p-4" 
            style={{ maxWidth: '400px', borderRadius: '25px', backgroundColor: '#ffffff' }}
          >
            <div className="text-center mb-3">
              <div className="d-flex justify-content-center align-items-center mx-auto mb-3" 
                style={{ width: '70px', height: '70px', backgroundColor: '#f8d7da', borderRadius: '50%' }}>
                <i className="bi bi-trash fs-1 text-danger"></i>
              </div>
              <h4 className="fw-bold mb-2">Confirmar eliminación</h4>
              <p className="text-muted">¿Estás seguro de que deseas eliminar este paquete?</p>
              <p className="text-muted small">Esta acción no se puede deshacer.</p>
            </div>
            <div className="d-flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-light border flex-grow-1 rounded-pill py-2"
              >
                Cancelar
              </button>
              <button 
                onClick={eliminarPaquete}
                className="btn btn-danger flex-grow-1 rounded-pill py-2"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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

export default SistemaTickets;