import React from 'react';
import { Container, Row, Col, Card, Modal } from 'react-bootstrap';

function SubastaCard({
  id, 
  titulo,
  categoria,
  precio,
  pujaMinima,
  estadoPrincipal,   
  subEstado,         
  pujas,
  tiempo,
  imagen,
  img1,
  img2,
  img3,
  descripcion,
  historialPujas
}) {

  const brandColors = {
    darkBrown: '#4a2311',
    mediumBrown: '#8d4925',
    accentOrange: '#d4a373',
  };

  const getSubEstadoStyles = (subEstado) => {
    switch (subEstado) {
      case "APROBADO":
        return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-check-circle-fill"};
      case "EN REVISIÓN":
        return { bg: "#fffffff5", color: "#e65100", border: "#e65100", icon: "bi-clock-history"};
      case "RECHAZADO":
        return { bg: "#fffffff5", color: "#b02a37", border: "#b02a37", icon: "bi-x-circle-fill" };
      case "VENDIDO":
        return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-cart-check-fill" };
      default:
        return { bg: "#fffffff5", color: "#495057", border: "#495057" };
    }
  };

  const subEstadoStyle = getSubEstadoStyles(subEstado);
  const modalId = `modalSubasta-${id}`;

  return (
    <>
      <div 
        className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 cursor-pointer transition-hover"
        data-bs-toggle="modal" 
        data-bs-target={`#${modalId}`}
        style={{ cursor: 'pointer' }}>
        <div 
          className="position-relative bg-secondary bg-opacity-10 p-3" 
          style={{ 
            height: '200px', 
            backgroundImage: `url(${imagen})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <span className="px-3 py-1 fw-bold text-uppercase" style={{backgroundColor: "#6c757d", color: "white", borderRadius: "8px", fontSize: "12px"}}>
              <i className="bi bi-circle-fill me-1" style={{fontSize: '8px'}}></i> {estadoPrincipal}
            </span>

            <div className="d-flex gap-2">
              <button className="btn btn-sm rounded-circle text-white shadow" style={{ backgroundColor: '#009575' }} onClick={(e) => e.stopPropagation()}>
                <i className="bi bi-pencil"></i>
              </button>
              <button className="btn btn-sm rounded-circle text-white shadow" style={{ backgroundColor: "#C50003" }} onClick={(e) => e.stopPropagation()}>
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <div className="mt-2">
            <span className="px-3 py-1 fw-bold text-uppercase" style={{backgroundColor: subEstadoStyle.bg, color: subEstadoStyle.color, border: `2px solid ${subEstadoStyle.border}`, borderRadius: "50px", fontSize: "10px"}}>
              <i className={`bi ${subEstadoStyle.icon} me-1`}></i> {subEstado}
            </span>
          </div>
          {estadoPrincipal === "ACTIVA" && tiempo && (
            <div className="position-absolute bottom-0 start-0 m-3 px-3 py-2 d-flex align-items-center gap-2" style={{background: "rgb(99, 44, 0)", color: "white", borderRadius: "50px", fontSize: "13px"}}>
              <i className="bi bi-clock"></i>{tiempo}
              <span style={{ fontWeight: "normal" }}>Restante</span>
            </div>
          )}
        </div>
        <div className="card-body text-start">
          <div className="d-flex justify-content-between align-items-center">
            <small className="fw-bold color-3">{categoria}</small>
            <small className="d-flex align-items-center text-muted gap-1"><i className="bi bi-people me-1"></i>{pujas} pujas</small>
          </div>
          <h4 className="fw-bold mt-2 color-1">{titulo}</h4>
          <div className="mt-3 border-top pt-2 row g-0">
            <div className="col-6">
              <small className="text-muted d-block" >PUJA ACTUAL</small>
              <span className="fw-bold color-2">${precio} MXN</span>
            </div>
            <div className="col-6 text-end">
              <small className="text-muted d-block" >PUJA MÍNIMA</small>
              <span className="color-1 fw-bold" >${pujaMinima} MXN</span>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id={modalId} tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
            <div className="bg-white p-2 p-lg-5 py-lg-4">
              <button 
                className="btn p-0 mb-4 fw-bold border-0 bg-transparent d-flex align-items-center" 
                data-bs-dismiss="modal"
                style={{ color: brandColors.mediumBrown }}
              >
                <i className="bi bi-arrow-left me-2"></i> Volver
              </button>
              <Row className="g-4 text-start">
                <Col lg={6}>
                  {/* Imagen principal */}
                  <div className="rounded-4 shadow-sm my-1" 
                    style={{  height: '300px',  backgroundImage: `url(${imagen})`,  backgroundSize: 'cover',  backgroundPosition: 'center'}}/>

                  {/* Miniaturas */}
                  <Row className="g-2 my-1">
                    <Col xs={4}>
                      <div className="rounded-3 shadow-sm cursor-pointer" 
                        style={{  height: '80px', backgroundImage: `url(${img1})`, backgroundSize: 'cover', backgroundPosition: 'center'  }}/>
                    </Col>

                    <Col xs={4}>
                      <div className="rounded-3 shadow-sm cursor-pointer" 
                        style={{ height: '80px', backgroundImage: `url(${img2})`,  backgroundSize: 'cover',  backgroundPosition: 'center' }}/>
                    </Col>

                    <Col xs={4}>
                      <div className="rounded-3 shadow-sm cursor-pointer" 
                        style={{ height: '80px', backgroundImage: `url(${img3})`, backgroundSize: 'cover', backgroundPosition: 'center'  }}/>
                        
                    </Col>
                  </Row>

                  {/* Descripción debajo de las imágenes */}
                  <div className="mt-3">
                    <h6 className="fw-bold color-1 mb-2">Descripción Detallada</h6>
                    <p className="text-muted small lh-base mb-4">
                      {descripcion}
                    </p>
                  </div>
                </Col>
                                
                <Col lg={6}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-light rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-hammer fs-3 text-secondary"></i>
                    </div>

                    <div>
                      <h6 className="m-0 fw-bold color-2">Subasta</h6>
                      <span className="px-3 py-1 fw-bold text-uppercase me-2" style={{backgroundColor: "#6c757d", color: "white", borderRadius: "8px", fontSize: "12px"}}>
                        <i className="bi bi-circle-fill me-1" style={{fontSize: '8px'}}></i> {estadoPrincipal}
                     </span>
                    </div>

                    <div className='ms-auto'>
                    <small className="color-2 fw-bold"> <i className="bi bi-people me-1 text-muted"></i> {pujas} Pujas</small>
                    </div>
                  </div>

                  <span className="fw-bold color-3 mb-1" style={{ fontSize: '12px' }}>{categoria}</span>
                  <h2 className="fw-bold color-1 mb-2"style={{ fontSize: '28px' }} >{titulo}</h2>
                  
                 <div className="bg-light p-3 rounded-4 my-3 d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block small fw-bold">PUJA ACTUAL</small>
                      <h5 className="color-1 fw-bold m-0">${precio} MXN</h5>
                    </div>
                    <div className="text-end">
                      <small className="text-muted d-block small fw-bold">CIERRA EN</small>
                      <h5 className="text-muted fw-normal m-0">{tiempo}</h5>
                    </div>
                  </div>

                  <small className="text-center d-block text-muted fw-bold py-1">PUJA MÍNIMA: {pujaMinima} MXN</small>

                  <Card className="mov-card border-0 shadow-sm rounded-4 p-4">
                  <h6 className="color-1 fw-bold mb-3">
                    <i className="bi bi-clock"></i> Historial de pujas
                  </h6>

                  {historialPujas?.map((puja, idx) => (
                  <div key={idx}className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <div className="d-flex align-items-center">                   
                      <div className="bg-light rounded-circle me-2" style={{ width: '35px', height: '35px' }}></div>
                      <div>
                        <p className="m-0 small fw-bold">{puja.nombre}</p>
                        <small className="text-muted" style={{ fontSize: '10px' }}>{puja.tiempo}</small>
                      </div>
                    </div>
                    <span className="fw-bold color-1">{puja.precio}</span>
                  </div>
                  ))}
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SubastaCard;