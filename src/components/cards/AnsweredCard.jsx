import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useState } from "react";
import ChatPanel from "../modals/ChatModal";

function AnsweredCard({peticion}) {
    const [chatOpen, setChatOpen] = useState(false);
    const [chatData, setChatData] = useState(null);
  
    const abrirChat = (peticion) => {
      setChatData(peticion);
      setChatOpen(true);
    };

    return(
    <>
        
        <Card key={peticion.id} className="mov-card shadow-sm p-3 border w-100 h-100">
             <Row className="align-items-center mb-3">
               <Col xs="auto">
                 <div className="d-flex justify-content-center align-items-center shadow-sm" style={{width: "70px", height: "70px", backgroundColor: "#E8B767", borderRadius: "8px"}}>
                   <i className="bi bi-person color-1 fs-1"></i>
                 </div>
               </Col>

               <Col>
                  <h5 className="mb-1 fw-bold color-1">{peticion.nombre}</h5>
                  <h6 className="fw-semibold mb-1 color-2">{peticion.titulo}</h6>
                  {peticion.estado === 1 ? (
                    <h6 className="fw-bold text-success">Aceptaste la oferta</h6>
                  ) : (
                    <h6 className="fw-bold text-danger">Rechazaste la oferta</h6>
                  )}
               </Col>
             </Row>

             
            <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted" style={{fontSize:"13px"}}>Respondida {peticion.updated} · Precio: {peticion.precio} · Tiempo: {peticion.tiempo}</p>
                {peticion.estado === 1 && (
                  <a className="btn btn-sm bg-color-1 text-white fw-bold mb-auto" onClick={() => abrirChat(peticion)} href="#" role="button">
                        <i className="bi bi-chat-left fs-8"></i>
                        <span className="d-none d-xxl-inline ms-2">
                            Ver Chat
                        </span>
                    </a>
                )}
            </div>
        </Card>

        {chatOpen && (
          <ChatPanel
            peticion={chatData}
            onClose={() => setChatOpen(false)}
          />
        )}
               
    </>
    )
}

export default AnsweredCard;