import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useState } from "react";


function TransactionCard({transaccion}) {
    return(
    <>
        
        <Card key={transaccion.id} className="mov-card shadow-sm p-3 border w-100 h-100">
             <Row className="align-items-center">
               <Col xs="auto">
                 <div className="d-flex justify-content-center align-items-center shadow-sm" style={{width: "70px", height: "70px", backgroundColor: "#E8B767", borderRadius: "8px"}}>
                   <i className="bi bi-image color-1 fs-1"></i>
                 </div>
               </Col>

               <Col>
                  <h5 className="mb-1 fw-bold color-1">{transaccion.titulo}</h5>
                  <h6 className="fw-semibold text-muted mb-1">{transaccion.fecha} · Transacción #{transaccion.id}</h6>
                  <p className="text-muted mb-0" style={{fontSize:"13px"}}>{transaccion.metodoPago}</p>
                  <span className="text-muted" style={{fontSize:"13px"}}>
                        {transaccion.estado === "ENTREGADO" ? (
                            <i className="bi bi-circle-fill me-2" style={{color: "#1F7627"}}></i>
                        ) : (
                            <i className="bi bi-circle-fill me-2" style={{color: "#FF6F20"}}></i>
                        )}
                        {transaccion.estado}
                  </span>
               </Col>

               <Col xs="auto" className="d-flex flex-column align-items-center justify-content-between">
                 <span className="px-3 py-1 fw-bold mb-4" style={{ backgroundColor: "#D5FFB4", borderRadius: "30px", fontSize: "12px", color: "#1F7627"}}>{transaccion.tipo}</span>
                 <h5 className="color-1">${transaccion.precio} MXN</h5>
               </Col>
             </Row>
        </Card>
               
    </>
    )
}

export default TransactionCard;