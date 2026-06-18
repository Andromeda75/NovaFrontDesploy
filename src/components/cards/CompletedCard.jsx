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
                  <h6 className="fw-bold color-1">{creador_nombre}</h6>
               </Col>

             </Row>

            <p className="text-muted" style={{fontSize:"13px"}}>
              <span className="me-1">
                <i className="bi bi-circle-fill me-2" style={{color: "#FF6F20"}}></i>
                En Espera
              </span>
              · Precio: $1000 · Tiempo: {formatearFecha(fecha_publicacion)}
            </p>

            { isMyPeticion && (
              <div className="d-flex justify-content-center">
                <a className="btn btn-sm bg-color-1 text-white fw-bold mb-auto rounded-3 w-75" href="#" role="button">
                  <i className="bi bi-arrow-up-right fs-6"></i>
                  <span className="d-none d-xxl-inline ms-2">
                      Pagar Ahora
                  </span>
                </a>
              </div>
            )}
        </Card>
               
    </>
    )
}

export default CompletedCard;