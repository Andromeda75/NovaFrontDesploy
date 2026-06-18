import React from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import PostsCard from "../../../components/cards/PostsCard.jsx"
import AnsweredCard from "../../../components/cards/AnsweredCard.jsx"
import CompletedCard from "../../../components/cards/CompletedCard.jsx"

import PeticionModal from '../../../components/modals/PeticionModal.jsx';
import MensajeModal from '../../../components/modals/MensajeModal';
import { useModal } from '../../../components/modals/useModal';

import { peticionesService } from '../../../services/peticionesService.js';
import { authService } from '../../../services/authService.js';

function Solicitudes() {

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

  const [filtro, setFiltro] = useState('Publicadas');
  const [subFiltro, setSubFiltro] = useState('Todos');
  const [subFiltro1, setSubFiltro1] = useState('Aceptadas'); 
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

      const propuestaData = await peticionesService.getPeticionesAll();
      setPropuestas(propuestaData);

    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const user = authService.getCurrentUser();

  const susPropuestas = propuestas.filter(
       (p) => p.creador_id !== user.id
  );

  const misPropuestas = propuestas.filter(
       (p) => p.creador_id === user.id
  );

  const Finalizadas = propuestas.filter(
       (p) => p.estado_id === 13
  );


  const filtradasPropuestas = susPropuestas.filter(p => {
    if (subFiltro === "Todos") return true;
    if (subFiltro === "Aceptadas") return p.estado_id === 15;
    if (subFiltro === "Rechazadas") return p.estado_id === 16;
  });

  const filtroEnviadas = misPropuestas.filter(p => {
    if (subFiltro1 === "Aceptadas") return p.estado_id === 15;
    if (subFiltro1 === "Rechazadas") return p.estado_id === 16;
    return true;
  });

  const filtroFinalizadas = Finalizadas.filter(p => {
    if (subFiltro2 === "Publicadas") {
      return p.creador_id === user.id;
    }

    if (subFiltro2 === "Colaboraciones") {
      return p.creador_id !== user.id;
    }

    return true;
  });


console.log(filtroEnviadas);

  const [formData, setFormData] = useState({
    titulo: "", 
    descripcion: "", 
    presupuesto_min: "", 
    presupuesto_max: "", 
    plazo: "",
    categoria: "",
    estilo: ""
  });

  const peticionesPrueba = [
    {
      id: 1,
      nombre: "Tú",
      created: "Hace 2 horas",
      updated: "Hace unas horas",
      titulo: "Retrato Fotográfico en Acuarela",
      descripcion: "Estoy buscando un artista que pueda realizar un retrato en acuarela basado en una fotografía personal. El objetivo es convertir la imagen en una pieza artística que conserve los rasgos principales, pero que también refleje un estilo delicado, expresivo y creativo propio del artista.",
      tipo: "ENCARGO",
      estado: 1,
      precio: "$2,000 - $3,000 MXN",
      tiempo: "2 semanas",
      categoria: "Fotografía",
      estilo: "Realista"
    },
    {
      id: 2,
      nombre: "Tú",
      created: "Hace 5 horas",
      updated: "Hace 1 día",
      titulo: "Diseño de Logotipo Moderno",
      descripcion: "Busco diseñador gráfico para crear identidad visual moderna para mi marca.",
      tipo: "ENCARGO",
      estado: 0,
      precio: "$1,000 - $2,000 MXN",
      tiempo: "1 semana",
      categoria: "Arte Digital",
      estilo: "Moderno"
    },
    {
      id: 3,
      nombre: "Tú",
      created: "Hace 1 día",
      updated: "Hace 1 día",
      titulo: "Ilustración Digital Fantasía",
      descripcion: "Necesito una ilustración estilo fantasía para portada de libro independiente.",
      tipo: "ENCARGO",
      estado: 0,
      precio: "$3,000 - $4,500 MXN",
      tiempo: "3 semanas",
      categoria: "Arte Digital",
      estilo: "Moderno"
    },
    {
      id: 4,
      nombre: "Estefania Rodriguez",
      created: "Hace 1 día",
      updated: "Hoy",
      titulo: "Se postulo a: Escultura de Jardín Minimalista",
      descripcion: "Tengo amplia experiencia con acero corten. Podéis ver mi portfolio de esculturas públicas adjunto. Me encantaría participar en este jardín.",
      tipo: "PROPUESTA",
      estado: null,
      precio: "$4,200 MXN",
      tiempo: "6 semanas",
      categoria: "Escultura",
      estilo: "Fantasía"

    },
    {
      id: 5,
      nombre: "Andrea Ruizz",
      created: "Hace 10 horas",
      updated: "Hace 5 horas",
      titulo: "Se postulo a: Escultura de Jardín Minimalista",
      descripcion: "Tengo amplia experiencia con acero corten. Podéis ver mi portfolio de esculturas públicas adjunto. Me encantaría participar en este jardín.",
      tipo: "PROPUESTA",
      estado: null,
      precio: "$5,400 MXN",
      tiempo: "8 semanas",
      categoria: "Escultura",
      estilo: "Realista",
    },
    {
      id: 6,
      nombre: "Alejandra Rodriguez",
      created: "Hace 10 horas",
      updated: "Hace 5 horas",
      titulo: "Escultura de Jardín Minimalista",
      descripcion: "Tengo amplia experiencia con acero corten. Podéis ver mi portfolio de esculturas públicas adjunto. Me encantaría participar en este jardín.",
      tipo: "PROPUESTA",
      estado: 2,
      precio: "$2,700 MXN",
      tiempo: "4 semanas",
      categoria: "Escultura",
      estilo: "Realista"
    },
    {
      id: 7,
      nombre: "Tú",
      created: "Hace 10 horas",
      updated: "Hace 5 horas",
      titulo: "Ilustración Digital Fantasía",
      descripcion: "Tengo amplia experiencia con acero corten. Podéis ver mi portfolio de esculturas públicas adjunto. Me encantaría participar en este jardín.",
      tipo: "PROPUESTA",
      estado: 1,
      precio: "$2,700 MXN",
      tiempo: "4 semanas",
      categoria: "Arte Digital",
      estilo: "Moderno",
    },
    {
      id: 8,
      nombre: "Tú",
      created: "Hace 10 horas",
      updated: "Hace 5 horas",
      titulo: "Ilustración Digital Fantasía",
      descripcion: "Tengo amplia experiencia con acero corten. Podéis ver mi portfolio de esculturas públicas adjunto. Me encantaría participar en este jardín.",
      tipo: "PROPUESTA",
      estado: 0,
      precio: "$2,700 MXN",
      tiempo: "4 semanas",
      categoria: "Arte Digital",
      estilo: "Fantasía"
    },
    {
      id: 9,
      nombre: "Tú",
      created: "Hace 10 horas",
      updated: "Hace 5 horas",
      titulo: "Ilustración Digital Fantasía",
      descripcion: "Tengo amplia experiencia con acero corten. Podéis ver mi portfolio de esculturas públicas adjunto. Me encantaría participar en este jardín.",
      tipo: "PROPUESTA",
      estado: 2,
      precio: "$2,700 MXN",
      tiempo: "4 semanas",
      categoria: "Arte Digital",
      estilo: "Fantasía"
    },
  ];

  
  const [showModal, setShowModal] = useState(false);
  const [peticionData, setPeticionesData] = useState(peticionesPrueba);
  const [categoryColor, setCategoryColors] = useState(categoryColors);
  const [styleColor, setStyleColors] = useState(styleColors);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      // Validar campos requeridos
      if (!formData.titulo || !formData.descripcion || !formData.categoria) {
        showModalMessage('Atención', 'Por favor completa todos los campos requeridos', 'warning');
        return;
      }

      // Validar presupuestos
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

      // Validar plazo
      const plazo = parseInt(formData.plazo);
      if (isNaN(plazo) || plazo <= 0) {
        showModalMessage('Atención', 'Por favor ingresa un plazo válido', 'warning');
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
      showModalMessage('¡Éxito!', response.message, 'success');

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
      showModalMessage('Error', errorMsg, 'error');
    }
  };

   const cambiarEstado = async (id, nuevoEstado) => {
    try {
      // 1. Actualizar en backend
      await peticionesService.cambiarEstado(id, nuevoEstado);

      // 2. Actualizar en frontend (para refrescar UI)
      setPeticionesData(prev =>
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

        <div className="mb-0">
          <div className="d-flex align-items-center mb-4">
              <div className="p-1 rounded-pill d-flex gap-2 shadow-sm" style={{ backgroundColor: '#f6d8a8', width: 'fit-content' }}>
                  <button 
                    onClick={() => setFiltro('Publicadas')}
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Publicadas' ? 'bg-white shadow-sm fw-bold color-2' : 'opacity-75'}`}>
                    Publicadas
                  </button>
                  <button 
                    onClick={() => setFiltro('Recibidas')}
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Recibidas' ? 'bg-white shadow-sm fw-bold color-2' : 'opacity-75'}`}>
                    Recibidas
                  </button>
                  <button 
                    onClick={() => setFiltro('Enviadas')}
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Enviadas' ? 'bg-white shadow-sm fw-bold color-2' : 'opacity-75'}`}>
                    Enviadas
                  </button>
                  <button 
                    onClick={() => setFiltro('Finalizadas')}
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Finalizadas' ? 'bg-white shadow-sm fw-bold color-2' : 'opacity-75'}`}>
                    Finalizadas
                  </button>
              </div>
          </div>
          <div className="row g-4">
            {filtro === 'Publicadas' && (
              <>
                  {peticiones.length > 0 ? (

                      peticiones.map(item => (
                          <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex animate__animated animate__fadeIn">
                              <PostsCard 
                                {...item}
                                setPeticiones={setPeticiones}
                                filtro={filtro}
                                categoryColor={categoryColor}
                                styleColor={styleColor}/>
                          </div>
                      ))

                  ) : (

                      // mensaje cuando no hay datos
                      <div className="col-12 text-center py-5">
                          <i className="bi bi-folder-x fs-1 text-muted"></i>
                          <h5 className="mt-3 text-muted">
                              Aún no tienes ninguna publicacion
                          </h5>
                      </div>

                  )}
              </>
            )}
            {(filtro === 'Recibidas') && (
              <div className="d-flex gap-3 mb-2">
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
            {filtro === 'Recibidas' && (
              <>
                  {filtradasPropuestas.length > 0 ? (

                      filtradasPropuestas.map(item => (
                          <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex animate__animated animate__fadeIn">
                              <PostsCard 
                                {...item}
                                setPeticiones={setPeticiones}
                                cambiarEstado={cambiarEstado}
                                filtro={filtro}
                                categoryColor={categoryColor}
                                styleColor={styleColor}/>
                          </div>
                      ))

                  ) : (

                      // mensaje cuando no hay datos
                      <div className="col-12 text-center py-5">
                          <i className="bi bi-folder-x fs-1 text-muted"></i>
                          <h5 className="mt-3 text-muted">
                              Aún no tienes ninguna propuesta
                          </h5>
                      </div>

                  )}
              </>
            )}
            {(filtro === 'Enviadas') && (
              <div className="d-flex gap-3 mb-2">
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
            {filtro === 'Enviadas' && (
              <>
                  {filtroEnviadas.length > 0 ? (

                      filtroEnviadas.map(item => (
                          <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex animate__animated animate__fadeIn">
                              <PostsCard 
                                {...item}
                                setPeticiones={setPeticiones}
                                filtro={filtro}
                                categoryColor={categoryColor}
                                styleColor={styleColor}/>
                          </div>
                      ))

                  ) : (

                      // mensaje cuando no hay datos
                      <div className="col-12 text-center py-5">
                          <i className="bi bi-folder-x fs-1 text-muted"></i>
                          <h5 className="mt-3 text-muted">
                              Aún no tienes ninguna propuesta
                          </h5>
                      </div>

                  )}
              </>
            )}
            {(filtro === 'Finalizadas') && (
              <div className="d-flex gap-3 mb-2">
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
            {/* {(filtro === 'Finalizadas') && peticionData
              .filter(peticion => peticion.tipo === "PROPUESTA" && peticion.estado === 2)
              .filter(peticion => subFiltro2 === "Publicadas"
                  ? peticion.nombre === "Tú"
                  : peticion.nombre !== "Tú"
              )
              .map((peticion) => (
                <div key={peticion.id} className="col-12 col-md-6 col-lg-4 d-flex animate__animated animate__fadeIn">
                  <CompletedCard 
                    peticion={peticion}
                    filtro={filtro}/>
                </div>
            ))} */}
            {filtro === 'Finalizadas' && (
              <>
                  {filtroFinalizadas.length > 0 ? (

                      filtroFinalizadas.map(item => (
                          <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex animate__animated animate__fadeIn">
                              <CompletedCard 
                                {...item}
                                setPeticiones={setPeticiones}
                                filtro={filtro}/>
                          </div>
                      ))

                  ) : (

                      // mensaje cuando no hay datos
                      <div className="col-12 text-center py-5">
                          <i className="bi bi-folder-x fs-1 text-muted"></i>
                          <h5 className="mt-3 text-muted">
                              Aún no tienes ninguna propuesta
                          </h5>
                      </div>

                  )}
              </>
            )}
          </div>
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