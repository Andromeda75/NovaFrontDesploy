import React from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import PostsCard from "../../../components/cards/PostsCard.jsx"
import AnsweredCard from "../../../components/cards/AnsweredCard.jsx"
import CompletedCard from "../../../components/cards/CompletedCard.jsx"

import PeticionModal from '../../../components/modals/PeticionModal.jsx';
import MensajeModal from '../../../components/modals/MensajeModal';
import { useModal } from '../../../components/modals/useModal';

import { peticionesService } from '../../../services/peticionesService.js';
import { propuestaService } from '../../../services/propuestaService.js';
import { authService } from '../../../services/authService.js';

function Solicitudes() {

  const navigate = useNavigate();
  const { modal, showModalMessage, hideModal } = useModal();

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

  const [peticiones, setPeticiones] = useState([]);
  const [propuestas, setPropuestas] = useState([]);
  const [enviadas, setEnviadas] = useState([]);

  const [filtro, setFiltro] = useState('Publicadas');
  const [subFiltro, setSubFiltro] = useState('Todos');
  const [subFiltro1, setSubFiltro1] = useState('Pendientes'); 
  const [subFiltro2, setSubFiltro2] = useState('Publicadas'); 

  const { id } = useParams();

  useEffect(() => {
        cargarDatos();
    }, [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const peticionesData = await peticionesService.getMisPeticiones();
      setPeticiones(peticionesData);

      const propuestaData = await propuestaService.getOtrasPropuestas();
      setPropuestas(propuestaData);

      const enviadasData = await propuestaService.getMisPropuestas();
      setEnviadas(enviadasData);
    
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  
  const user = authService.getCurrentUser();

  const filtradasPropuestas = propuestas.filter(p => {
    if (subFiltro === "Todos") return true;
    if (subFiltro === "Aceptadas") return p.estado === 'aceptada';
    if (subFiltro === "Rechazadas") return p.estado === 'rechazada';

    return p.estado === 'pendiente';
  });

  const filtradasEnviadas = enviadas.filter(p => {
    if (subFiltro1 === "Pendientes") return p.estado === 'pendiente';
    if (subFiltro1 === "Aceptadas") return p.estado === 'aceptada';
    if (subFiltro1 === "Rechazadas") return p.estado === 'rechazada';
    return true;
  });

  const publicadasFinalizadas = propuestas.filter(
    p => p.estado === "finalizada" || p.estado === "en_espera_pago"
  );

  const colaboracionesFinalizadas = enviadas.filter(
    p => p.estado === "finalizada" || p.estado === "aceptada" || p.estado === "en_espera_pago"
  );

  const [formData, setFormData] = useState({
    titulo: "", 
    descripcion: "", 
    presupuesto_min: "", 
    presupuesto_max: "", 
    plazo: "",
    categoria: "",
    estilo: ""
  });

  const [showModal, setShowModal] = useState(false);
  const [categoryColor, setCategoryColors] = useState(categoryColors);
  const [styleColor, setStyleColors] = useState(styleColors);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      if (!formData.titulo || !formData.descripcion || !formData.categoria) {
        showModalMessage('Atención', 'Por favor completa todos los campos requeridos', 'warning');
        return;
      }

      const min = parseFloat(formData.presupuesto_min);
      const max = parseFloat(formData.presupuesto_max);
      
      if (isNaN(min) || isNaN(max)) {
        showModalMessage('Atención', 'Por favor ingresa valores válidos para el presupuesto', 'warning');
        return;
      }

      if (min >= max) {
        showModalMessage('Atención', 'El presupuesto mínimo debe ser menor al máximo', 'warning');
        return;
      }

      const plazo = parseInt(formData.plazo);
      if (isNaN(plazo) || plazo <= 0) {
        showModalMessage('Atención', 'Por favor ingresa un plazo válido', 'warning');
        return;
      }

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

      const response = await peticionesService.postPeticiones(data);
      showModalMessage('¡Éxito!', response.message, 'success');

      await cargarDatos();
      setShowModal(false);
      
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
      showModalMessage('Error', errorMsg, 'error');
    }
  };

   const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await propuestaService.cambiarEstado(id, nuevoEstado);

      setPropuestas(prev =>
        prev.map(p =>
          p.id === id ? { ...p, estado: nuevoEstado } : p
        )
      );

      await cargarDatos();

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showModalMessage('Error', 'No se pudo actualizar el estado', 'error');
    }
  };

  const finalizarTrabajo = async (id) => {
    try {
      await propuestaService.cambiarEstado(id, "en_espera_pago");
      await cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const pagarTrabajo = async (id) => {
    try {
      await propuestaService.cambiarEstado(id, "finalizada");
      await cargarDatos();
    } catch (error) {
      console.error(error);
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

  if (error) {
    return (
      <div className="alert alert-danger m-3">
          {error}
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid p-0">

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-start">
            <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Solicitudes</h1>
            <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}> Recepción de peticiones: Encargos y Propuestas.
            </p>
          </div>

          <button className="btn-linear-gradient py-2 px-4" style={{ borderRadius: '8px' }} onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg fs-6"></i>
            <span className="d-none d-xxl-inline ms-2">
                Publicar Solicitud
            </span>
          </button>
        </div>

        <div className="mb-4">
          {/* FILTROS PRINCIPALES - ESTILO PESTAÑAS CON LÍNEA */}
          <div className="d-flex gap-4 border-bottom border-2 pb-2" style={{ borderColor: '#e0e0e0' }}>
            <button
              onClick={() => setFiltro('Publicadas')}
              className="btn btn-link text-decoration-none p-0 position-relative"
              style={{ 
                fontSize: '16px',
                fontWeight: filtro === 'Publicadas' ? 600 : 400,
                color: filtro === 'Publicadas' ? '#9A5F25' : '#6c757d',
                transition: 'all 0.3s ease',
                paddingBottom: '10px'
              }}
            >
              Publicadas
              {filtro === 'Publicadas' && (
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
              onClick={() => setFiltro('Recibidas')}
              className="btn btn-link text-decoration-none p-0 position-relative"
              style={{ 
                fontSize: '16px',
                fontWeight: filtro === 'Recibidas' ? 600 : 400,
                color: filtro === 'Recibidas' ? '#9A5F25' : '#6c757d',
                transition: 'all 0.3s ease',
                paddingBottom: '10px'
              }}
            >
              Recibidas
              {filtro === 'Recibidas' && (
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
              onClick={() => setFiltro('Enviadas')}
              className="btn btn-link text-decoration-none p-0 position-relative"
              style={{ 
                fontSize: '16px',
                fontWeight: filtro === 'Enviadas' ? 600 : 400,
                color: filtro === 'Enviadas' ? '#9A5F25' : '#6c757d',
                transition: 'all 0.3s ease',
                paddingBottom: '10px'
              }}
            >
              Enviadas
              {filtro === 'Enviadas' && (
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
              onClick={() => setFiltro('Finalizadas')}
              className="btn btn-link text-decoration-none p-0 position-relative"
              style={{ 
                fontSize: '16px',
                fontWeight: filtro === 'Finalizadas' ? 600 : 400,
                color: filtro === 'Finalizadas' ? '#9A5F25' : '#6c757d',
                transition: 'all 0.3s ease',
                paddingBottom: '10px'
              }}
            >
              Finalizadas
              {filtro === 'Finalizadas' && (
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

          {/* SUBFILTROS */}
          {filtro === 'Recibidas' && (
            <div className="d-flex gap-3 mb-2 mt-3">
              <button
                onClick={() => setSubFiltro("Todos")}
                className={`btn rounded-pill px-4 fw-bold ${
                  subFiltro === "Todos"
                    ? "btn-secondary"
                    : "btn-outline-secondary"
                }`}>
                <i className="bi bi-grid me-2"></i>
                Todos
              </button>

              <button
                onClick={() => setSubFiltro("Aceptadas")}
                className={`btn rounded-pill px-4 fw-bold ${
                  subFiltro === "Aceptadas"
                    ? "btn-success"
                    : "btn-outline-success"
                }`}>
                <i className="bi bi-check2-circle me-2"></i>
                Aceptadas
              </button>

              <button
                onClick={() => setSubFiltro("Rechazadas")}
                className={`btn rounded-pill px-4 fw-bold ${
                  subFiltro === "Rechazadas"
                    ? "btn-danger"
                    : "btn-outline-danger"
                }`}>
                <i className="bi bi-x-circle me-2"></i>
                Rechazadas
              </button>
            </div>
          )}

          {filtro === 'Enviadas' && (
            <div className="d-flex gap-3 mb-2 mt-3">
              <button
                onClick={() => setSubFiltro1("Pendientes")}
                className={`btn rounded-pill px-4 fw-bold ${
                  subFiltro1 === "Pendientes"
                    ? "btn-warning"
                    : "btn-outline-warning"
                }`}>
                <i className="bi bi-clock me-2"></i>
                Pendientes
              </button>

              <button
                onClick={() => setSubFiltro1("Aceptadas")}
                className={`btn rounded-pill px-4 fw-bold ${
                  subFiltro1 === "Aceptadas"
                    ? "btn-success"
                    : "btn-outline-success"
                }`}>
                <i className="bi bi-check2-circle me-2"></i>
                Aceptadas
              </button>

              <button
                onClick={() => setSubFiltro1("Rechazadas")}
                className={`btn rounded-pill px-4 fw-bold ${
                  subFiltro1 === "Rechazadas"
                    ? "btn-danger"
                    : "btn-outline-danger"
                }`}>
                <i className="bi bi-x-circle me-2"></i>
                Rechazadas
              </button>
            </div>
          )}

          {filtro === 'Finalizadas' && (
            <div className="d-flex gap-3 mb-2 mt-3">
              <button
                onClick={() => setSubFiltro2("Publicadas")}
                className={`btn rounded-pill px-4 fw-bold ${
                  subFiltro2 === "Publicadas"
                    ? "btn-success"
                    : "btn-outline-success"
                }`}>
                <i className="bi bi-check-circle-fill me-2"></i>
                Publicadas
              </button>

              <button
                onClick={() => setSubFiltro2("Colaboraciones")}
                className={`btn rounded-pill px-4 fw-bold ${
                  subFiltro2 === "Colaboraciones"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}>
                <i className="bi bi-people-fill me-2"></i>
                Colaboraciones
              </button>
            </div>
          )}
        </div>

        {/* CONTENIDO DE LAS SECCIONES */}
        <div className="row g-4">
          {/* SECCIÓN PUBLICADAS */}
          {filtro === 'Publicadas' && (
            <>
                {peticiones.length > 0 ? (
                    peticiones.map(item => (
                        <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex animate__animated animate__fadeIn">
                            <PostsCard 
                              id={item.id}
                              creador_id={item.creador_id}
                              creador_nombre={item.creador_nombre}
                              creador_foto={item.creador_foto}
                              artista_id={item.artista_id}
                              artista_nombre={item.artista_nombre}
                              artista_foto={item.artista_foto}
                              fecha_publicacion={item.fecha_publicacion}
                              categoria_nombre={item.categoria_nombre}
                              estilo={item.estilo}
                              titulo={item.titulo}
                              descripcion={item.descripcion}
                              presupuesto_min_mxn={item.presupuesto_min_mxn}
                              presupuesto_max_mxn={item.presupuesto_max_mxn}
                              precio={item.precio}
                              plazo_entrega_semanas={item.plazo_entrega_semanas}
                              estado_id={item.estado_id}
                              estado={item.estado}
                              setPeticiones={setPeticiones}
                              filtro={filtro}
                              categoryColor={categoryColor}
                              styleColor={styleColor}
                              onChatClick={(propuestaId, otroId, otroNombre) => {
                                // ✅ AGREGAR replace: true
                                navigate(`/peticiones?tab=messages&propuesta=${propuestaId}&usuario=${otroId}&nombre=${encodeURIComponent(otroNombre)}`, { replace: true });
                              }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <i className="bi bi-folder-x fs-1 text-muted"></i>
                        <h5 className="mt-3 text-muted">
                            Aún no tienes ninguna publicacion
                        </h5>
                    </div>
                )}
            </>
          )}

          {/* SECCIÓN RECIBIDAS */}
          {filtro === 'Recibidas' && (
            <>
              {filtradasPropuestas.length > 0 ? (
                  filtradasPropuestas.map(item => (
                      <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex animate__animated animate__fadeIn">
                          <PostsCard 
                            id={item.id}
                            creador_id={item.creador_id}
                            creador_nombre={item.creador_nombre}
                            creador_foto={item.creador_foto}
                            artista_id={item.artista_id}
                            artista_nombre={item.artista_nombre}
                            artista_foto={item.artista_foto}
                            fecha_publicacion={item.fecha_publicacion}
                            categoria_nombre={item.categoria_nombre}
                            estilo={item.estilo}
                            titulo={item.titulo}
                            descripcion={item.descripcion}
                            presupuesto_min_mxn={item.presupuesto_min_mxn}
                            presupuesto_max_mxn={item.presupuesto_max_mxn}
                            precio={item.precio}
                            plazo_entrega_semanas={item.plazo_entrega_semanas}
                            estado_id={item.estado_id}
                            estado={item.estado}
                            setPropuestas={setPropuestas}
                            cambiarEstado={cambiarEstado}
                            filtro={filtro}
                            categoryColor={categoryColor}
                            styleColor={styleColor}
                            onChatClick={(propuestaId, otroId, otroNombre) => {
                              // ✅ AGREGAR replace: true
                              navigate(`/peticiones?tab=messages&propuesta=${propuestaId}&usuario=${otroId}&nombre=${encodeURIComponent(otroNombre)}`, { replace: true });
                            }}
                          />
                      </div>
                  ))
              ) : (
                  <div className="col-12 text-center py-5">
                      <i className="bi bi-folder-x fs-1 text-muted"></i>
                      <h5 className="mt-3 text-muted">
                          Aún no tienes ninguna propuesta
                      </h5>
                  </div>
              )}
            </>
          )}

          {/* SECCIÓN ENVIADAS */}
          {filtro === 'Enviadas' && (
            <>
              {filtradasEnviadas.length > 0 ? (
                  filtradasEnviadas.map(item => (
                      <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex animate__animated animate__fadeIn">
                          <PostsCard 
                            id={item.id}
                            creador_id={item.creador_id}
                            creador_nombre={item.creador_nombre}
                            creador_foto={item.creador_foto}
                            artista_id={item.artista_id}
                            artista_nombre={item.artista_nombre}
                            artista_foto={item.artista_foto}
                            fecha_publicacion={item.fecha_publicacion}
                            categoria_nombre={item.categoria_nombre}
                            estilo={item.estilo}
                            titulo={item.titulo}
                            descripcion={item.descripcion}
                            presupuesto_min_mxn={item.presupuesto_min_mxn}
                            presupuesto_max_mxn={item.presupuesto_max_mxn}
                            precio={item.precio}
                            plazo_entrega_semanas={item.plazo_entrega_semanas}
                            estado_id={item.estado_id}
                            estado={item.estado}
                            setPropuestas={setPropuestas}
                            filtro={filtro}
                            categoryColor={categoryColor}
                            styleColor={styleColor}
                            onChatClick={(propuestaId, otroId, otroNombre) => {
                              // ✅ AGREGAR replace: true
                              navigate(`/peticiones?tab=messages&propuesta=${propuestaId}&usuario=${otroId}&nombre=${encodeURIComponent(otroNombre)}`, { replace: true });
                            }}
                          />
                      </div>
                  ))
              ) : (
                  <div className="col-12 text-center py-5">
                      <i className="bi bi-folder-x fs-1 text-muted"></i>
                      <h5 className="mt-3 text-muted">
                          Aún no tienes ninguna propuesta
                      </h5>
                  </div>
              )}
            </>
          )}

          {/* SECCIÓN FINALIZADAS */}
          {filtro === 'Finalizadas' && (
            <>
              {subFiltro2 === "Publicadas" &&
                (publicadasFinalizadas.length > 0 ? (
                  publicadasFinalizadas.map(item => (
                    <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex">
                      <CompletedCard 
                        {...item}  
                        filtroFinalizadas={subFiltro2}
                        finalizarTrabajo={finalizarTrabajo}
                        pagarTrabajo={pagarTrabajo}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <h5 className="text-muted">No tienes publicaciones finalizadas</h5>
                  </div>
                ))
              }

              {subFiltro2 === "Colaboraciones" &&
                (colaboracionesFinalizadas.length > 0 ? (
                  colaboracionesFinalizadas.map(item => (
                    <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex">
                      <CompletedCard 
                        {...item}  
                        filtroFinalizadas={subFiltro2}
                        finalizarTrabajo={finalizarTrabajo}
                        pagarTrabajo={pagarTrabajo}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <h5 className="text-muted">No tienes colaboraciones finalizadas</h5>
                  </div>
                ))
              }
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <PeticionModal
        showModal={showModal}
        setShowModal={setShowModal}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        categoryColor={categoryColor}
        styleColor={styleColor}
      />
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
}

export default Solicitudes;