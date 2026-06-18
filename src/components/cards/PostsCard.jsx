import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import ChatPanel from "../modals/ChatModal";
import PeticionModal from "../modals/PeticionModal";
import ConfirmacionDeleteModal from "../modals/confirmaciones/ConfirmarDeleteModal";
import PostDetalleModal from "../modals/PostDetalleModal";
import MensajeModal from '../modals/MensajeModal';
import { useModal } from '../../components/modals/useModal';

import { authService } from "../../services/authService";
import { peticionesService } from "../../services/peticionesService";

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

function PostsCard({
  id,
  creador_id,
  creador_nombre,
  fecha_publicacion,
  categoria_nombre,
  estilo,
  titulo,
  descripcion,
  presupuesto_min_mxn,
  presupuesto_max_mxn,
  plazo_entrega_semanas,
  estado_id,
  filtro, peticionData, setPeticiones, cambiarEstado, categoryColor, styleColor}) {

  const { modal, showModalMessage, hideModal } = useModal();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatData, setChatData] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [detalleData, setDetalleData] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);

  const [formData, setFormData] = useState({titulo: "", descripcion: "", categoria: "", estilo: "", precio: "", plazo: ""});
  
  const [editando, setEditando] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [peticionEliminar, setPeticionEliminar] = useState(null);

  const abrirChat = (peticion) => {
    setChatData(peticion);
    setChatOpen(true);
  };

  const abrirDetalleModal = (peticion) => {
    setDetalleData(peticion);
    setShowDetalle(true);
  };

  const handleChange = (e) =>
    setFormData({...formData, [e.target.name]: e.target.value});

  const handleEdit = (data) => {
    setFormData({
      titulo: data.titulo || "",
      descripcion: data.descripcion || "",
      presupuesto_min: data.presupuesto_min_mxn || "",
      presupuesto_max: data.presupuesto_max_mxn || "",
      plazo: data.plazo_entrega_semanas || "",
      categoria: data.categoria_nombre || "",
      estilo: data.estilo || ""
    });

    setEditando(data.id);
    setShowModal(true);
  };

  const handleUpdate = async () => {
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

      console.log('Actualizando datos:', data);

      const response = await peticionesService.putPeticion(editando, data);
      showModalMessage('¡Éxito!', response.message, 'success');

      setPeticiones(prev => 
        prev.map(p => 
          p.id === editando 
            ? { 
                ...p, 
                titulo: data.titulo, 
                descripcion: data.descripcion, 
                presupuesto_min_mxn: data.presupuesto_min, 
                presupuesto_max_mxn: data.presupuesto_max, 
                plazo_entrega_semanas: data.plazo_entrega, 
                categoria_nombre: formData.categoria, 
                estilo: data.estilo 
              } 
            : p
        )
      );

      setShowModal(false);
      setEditando(null);
      
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
      showModalMessage('Error', errorMsg, 'error');
    }
  };

  const handleDelete = (id) => {
    setPeticionEliminar(id);
    setShowDeleteModal(true);
  };

  const confirmarEliminar = async () => {
    try {
        

        const response = await peticionesService.deletePeticion(peticionEliminar);
        
        showModalMessage('¡Éxito!', response.message || 'Petición eliminada exitosamente', 'success');

        setPeticiones(prev => prev.filter(p => p.id !== peticionEliminar));
        
        setShowDeleteModal(false);
        setPeticionEliminar(null);
        
    } catch (error) {
        console.error('Error al eliminar:', error);
        
        const errorMsg = error.response?.data?.message || 'Error al eliminar la petición';
        showModalMessage('Error', errorMsg, 'error');
        
    }
};

  const user = authService.getCurrentUser();
  const isMyPeticion = user?.id === creador_id

  const truncateText = (text, maxLength = 120) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

    return(
    <>
        
        <Card className="mov-card shadow-sm p-4 border w-100 h-100">
             <Row className="align-items-center mb-2">
               <Col xs="auto">
                 <div className="d-flex justify-content-center align-items-center shadow-sm" style={{width: "55px", height: "55px", backgroundColor: "#E8B767", borderRadius: "8px"}}>
                   <i className="bi bi-person color-1 fs-4"></i>
                 </div>
               </Col>

               <Col>
                 <h6 className="mb-0 fw-semibold color-1">{isMyPeticion ? "Tú" : creador_nombre}</h6>
                 <small className="text-muted d-flex flex-column flex-md-row align-items-md-center">
                  {/* {filtro === "Enviadas" ? (
                      <>
                        <span>{peticion.updated}</span>

                      </>
                    ) : (
                      peticion.created
                    )} */}
                    {formatearFecha(fecha_publicacion)}
                </small>
               </Col>

               <Col xs="auto" className="d-flex flex-column align-items-end gap-1">
                  <span className="px-3 py-1 fw-bold" style={{
                    backgroundColor: categoryColor[categoria_nombre] + "20",
                    borderRadius: "30px",
                    fontSize: "11px",
                    color: categoryColor[categoria_nombre],
                    border: `1px solid ${categoryColor[categoria_nombre]}`
                  }}>
                    {categoria_nombre}
                  </span>
                  <span className="px-3 py-1 fw-bold" style={{
                    backgroundColor: styleColor[estilo] + "20",
                    borderRadius: "30px",
                    fontSize: "11px",
                    color: styleColor[estilo],
                    border: `1px solid ${styleColor[estilo]}`
                  }}>
                    {estilo}
                  </span>
               </Col>
             </Row>
            
            {filtro === "Enviadas" && (
              estado_id === 15 ? (
                <h6 className="fw-bold text-success">Tu oferta ha sido aceptada</h6>
              ) : (
                <h6 className="fw-bold text-danger">Tu oferta ha sido rechazada</h6>
              )
            )}
             {/* TÍTULO */}
             <h5 className="fw-bold mb-3 color-2">{titulo}</h5>
             {/* DESCRIPCIÓN */}
             <p className="text-muted mb-4">{truncateText(descripcion, 140)}</p>
             {/* PRESUPUESTO Y TIEMPO */}
             <div className="d-flex justify-content-between align-items-center p-3 mt-auto" style={{ backgroundColor: "#f7f5f3", borderRadius: "14px"}}>
               <div>
                  {isMyPeticion ? (
                    <>
                      <small className="text-muted color-1">PRESUPUESTO</small>
                      <div className="fw-bold color-1">{formatearPrecio(presupuesto_min_mxn)} - {formatearPrecio(presupuesto_max_mxn)}</div>
                    </>
                  ) : (
                    <>
                      <small className="text-muted color-1">PRECIO</small>
                      <div className="fw-bold color-1">$1000.00</div>
                    </>
                  )}
               </div>

               <div>
                 <small className="text-muted color-1">TIEMPO </small>
                 <div className="fw-bold color-1">{plazo_entrega_semanas} semanas</div>
               </div>

                {isMyPeticion && (

                  filtro === "Enviadas" && estado_id === 15 && (
                    <a
                      className="btn btn-sm bg-color-1 text-white fw-bold"
                      onClick={() => abrirChat(id)}
                      href="#"
                      role="button"
                    >
                      <i className="bi bi-chat-left fs-6"></i>
                      <span className="d-none d-xxl-inline ms-2">
                        Ver Chat
                      </span>
                    </a>
                  )

                )}

                {!isMyPeticion && filtro === "Recibidas" && (

                  <div className="ms-3 d-flex justify-content-start justify-content-md-center gap-2 mt-3 mt-md-0">

                    {estado_id === 11 && (
                      <>
                        {/* Aceptar */}
                        <a
                        className="btn btn-sm bg-success text-white fw-bold shadow-sm"
                        onClick={() => cambiarEstado(id, 15)}
                        role="button"
                      >
                        <i className="bi bi-check2-circle fs-6"></i>
                        {/* <span className="d-none d-xxl-inline ms-2">
                          Aceptar
                        </span> */}
                      </a>

                        {/* Rechazar */}
                        <a
                          className="btn btn-sm bg-danger text-white fw-bold shadow-sm"
                          onClick={() => cambiarEstado(id, 16)}
                          role="button"
                        >
                          <i className="bi bi-x-circle fs-6"></i>
                          {/* <span className="d-none d-xxl-inline ms-2">
                            Rechazar
                          </span> */}
                        </a>
                      </>
                    )}
                    {estado_id === 15 && (
                      /* Ver chat */
                        <a
                          className="btn btn-sm bg-color-1 text-white fw-bold"
                          onClick={() => abrirChat(id)}
                          role="button"
                        >
                          <i className="bi bi-chat-left fs-6"></i>
                          <span className="d-none d-xxl-inline ms-2">
                            Ver Chat
                          </span>
                        </a>
                    )}
                    {/* {peticion.estado === 2 && (
                      <h5 className="mb-1 fw-semibold text-success">Finalizada</h5>
                    )} */}
                    {estado_id === 16 && (
                      <h5 className="mb-1 fw-semibold text-danger">Rechazada</h5>
                    )}
                  </div>

                )}

             </div>

             {filtro === "Publicadas" && (
                <div className="d-flex align-items-center mt-4 gap-2">
                  <button className="btn btn-sm rounded-circle text-white" style={{ backgroundColor: '#009575' }}
                    onClick={() => handleEdit({
                      id,
                      titulo,
                      descripcion,
                      presupuesto_min_mxn,
                      presupuesto_max_mxn,
                      plazo_entrega_semanas,
                      categoria_nombre,
                      estilo
                    })}>
                    <i className="bi bi-pencil"></i>
                  </button>

                  <button className="btn btn-sm rounded-circle text-white"style={{ backgroundColor: "#C50003" }} onClick={() => handleDelete(id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                  
                  <a className="text-decoration-none color-1 fw-bold ms-auto"
                    style={{ cursor: "pointer" }}
                    onClick={() => abrirDetalleModal(id)}>
                    Ver detalles <i className="bi bi-caret-right-fill"></i>
                  </a>
                </div>
              )}
        </Card>

        {chatOpen && (
          <ChatPanel
            peticion={chatData}
            onClose={() => setChatOpen(false)}
          />
        )}

          <PostDetalleModal
            show={showDetalle}
            peticion={detalleData}
            onClose={() => setShowDetalle(false)}
            categoryColor={categoryColor}
            styleColor={styleColor}
          />

        
        <PeticionModal
          showModal={showModal}
          setShowModal={setShowModal}
          formData={formData}
          handleChange={handleChange}
          handleUpdate={handleUpdate}
          editando={editando}
          categoryColor={categoryColor}
          styleColor={styleColor}
        />
        

        
        <ConfirmacionDeleteModal
          show={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          confirmarEliminar={confirmarEliminar}
          setPeticiones={setPeticiones}
          peticionData={peticionData}
        />

        {/* MODAL DE MENSAJES */}
        <MensajeModal
          show={modal.show}
          onHide={hideModal}
          title={modal.title}
          message={modal.message}
          type={modal.type}
        />
   
    </>
    )
}

export default PostsCard;