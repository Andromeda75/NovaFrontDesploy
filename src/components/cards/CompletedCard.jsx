import { Container, Row, Col, Card, Button } from "react-bootstrap";

import { authService } from "../../services/authService";

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

function CompletedCard({
  id,
  creador_id,
  artista_nombre,
  creador_nombre,
  fecha_publicacion,
  categoria_nombre,
  estilo,
  titulo,
  descripcion,
  presupuesto_min_mxn,
  presupuesto_max_mxn,
  precio,
  plazo_entrega_semanas,
  estado_id,
  estado,
  filtroFinalizadas,
  finalizarTrabajo,
  pagarTrabajo,
}) {
  const user = authService.getCurrentUser();
  const isMyPeticion = user?.id === creador_id

    return(
    <>
        
        <Card key={id} className="mov-card shadow-sm p-3 border w-100 h-100">
             <Row className="align-items-center mb-0">
               <Col xs="auto">
                 <div className="d-flex justify-content-center align-items-center shadow-sm" style={{width: "70px", height: "70px", backgroundColor: "#E8B767", borderRadius: "8px"}}>
                   <i className="bi bi-person color-1 fs-1"></i>
                 </div>
               </Col>

               <Col>
                  <h5 className="mb-1 fw-semibold text-success">Petición Finalizada</h5>
                  <h6 className=" mb-1 color-2">{titulo}</h6>
                  <h6 className="fw-bold color-1">
                    {filtroFinalizadas === "Publicadas"
                      ? "Tú"
                      : creador_nombre}
                  </h6>
               </Col>

             </Row>

            <p className="text-muted" style={{fontSize:"13px"}}>
              {/* <span className="me-1">
                <i className="bi bi-circle-fill me-2" style={{color: "#FF6F20"}}></i>
                En Espera
              </span> */}
              <i className="bi bi-circle-fill me-2" style={{color: "#FF6F20"}}></i>
              Precio: {formatearPrecio(precio)} · Tiempo: {plazo_entrega_semanas} semanas
            </p>

            {filtroFinalizadas === "Publicadas" &&  estado === "en_espera_pago" && (
              <div className="d-flex justify-content-center">
                <button
                  className="btn btn-sm bg-color-1 text-white fw-bold w-75"
                  onClick={() => pagarTrabajo(id)}
                >
                  <i className="bi bi-arrow-up-right fs-6"></i> 
                  <span className="d-none d-xxl-inline ms-2">Pagar Ahora</span>
                </button>
              </div>
            )}
            {filtroFinalizadas === "Colaboraciones" && estado === "aceptada" && (
              <div className="d-flex justify-content-center">
                <button
                  className="btn bg-color-1 text-white btn-sm fw-bold w-75"
                  onClick={() => finalizarTrabajo(id)}
                >
                  <i className="bi bi-arrow-up-right fs-6"></i> 
                  <span className="d-none d-xxl-inline ms-2">Finalizar Trabajo</span>
                </button>
              </div>
            )}
            {filtroFinalizadas === "Colaboraciones" && estado === "en_espera_pago" && (
              <div className="text-center mt-2">
                <span className="fw-bold text-warning">
                  Esperando pago del cliente
                </span>
              </div>
            )}
            {(filtroFinalizadas === "Publicadas" || filtroFinalizadas === "Colaboraciones") && estado === "finalizada" && (
              <div className="text-center mt-2">
                <span className="fw-bold text-warning">
                  Pago realizado
                </span>
              </div>
            )}
        </Card>
               
    </>
    )
}

export default CompletedCard;