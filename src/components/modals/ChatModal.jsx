import { useState } from "react";

export default function ChatPanel({ peticion, onClose }) {
    const [mensaje, setMensaje] = useState("");
    const [mensajes, setMensajes] = useState([
        { id: 1, texto: "Hola 👋", propio: false },
        { id: 2, texto: "Hola, acepté tu oferta", propio: true }
    ]);

    const enviarMensaje = () => {
        if (!mensaje.trim()) return;

        setMensajes([
        ...mensajes,
        {
            id: Date.now(),
            texto: mensaje,
            propio: true
        }
        ]);

        setMensaje("");
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 vh-100 
                        bg-dark bg-opacity-50 
                        d-flex justify-content-center align-items-center"
                style={{ zIndex: 2000 }}>

            <div className="bg-white rounded-4 shadow d-flex flex-column overflow-hidden" style={{ width: "700px", height: "80vh" }}>

                {/* HEADER */}
                <div className="p-3 d-flex align-items-center bg-white">
                    <div className="me-2">
                        <button className="btn border-0" onClick={onClose}>
                            <i className="bi bi-chevron-left"></i>
                        </button>
                    </div>
                    <div className="d-flex justify-content-center align-items-center shadow-sm me-3" style={{width: "55px", height: "55px", backgroundColor: "#E8B767", borderRadius: "50px"}}>
                        <i className="bi bi-person color-1 fs-4"></i>
                    </div>
                    <div>
                        <h5 className="mb-0">{peticion.nombre}</h5>
                    </div>

                    <button className="btn bg-color-2 text-white ms-auto shadow-sm" onClick={onClose}>
                        Finalizar
                    </button>
                </div>
                <div className="p-3 border-bottom d-flex align-items-center" style={{ backgroundColor: '#f6d8a8' }}>
                    <div>
                        <h5 className="mb-0 color-2">{peticion.titulo}</h5>
                        <small className="text-muted fs-6">Oferta aceptada: {peticion.precio}</small>
                    </div>

                    <i className="bi bi-info-circle fs-3 color-3 ms-auto me-2"></i>
                </div>

                {/* MENSAJES */}
                <div className="flex-grow-1 overflow-auto p-4 bg-light d-flex flex-column">
                    {mensajes.map(msg => (
                        <div key={msg.id} className={`d-flex align-items-end mb-3 ${
                                msg.propio ? "justify-content-end" : "justify-content-start"
                            }`}>
                            {!msg.propio && (
                                <div className="d-flex justify-content-center align-items-center shadow-sm me-3" style={{width: "30px", height: "30px", backgroundColor: "#E8B767", borderRadius: "50px"}}>
                                    <i className="bi bi-person color-1 fs-6"></i>
                                </div>
                            )}
                            <div
                                className={`px-3 py-2 rounded-3 ${
                                    msg.propio ? "bg-warning-subtle" : "bg-secondary-subtle"
                                }`}
                                style={{ maxWidth: "60%" }}>
                                {msg.texto}
                            </div>
                            {msg.propio && (
                                <div className="d-flex justify-content-center align-items-center shadow-sm ms-3" style={{width: "30px", height: "30px", backgroundColor: "#E8B767", borderRadius: "50px"}}>
                                    <i className="bi bi-person color-1 fs-6"></i>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* INPUT */}
                <div className="p-3 border-top d-flex">
                    <input
                        className="form-control"
                        placeholder="Escribe un mensaje..."
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                    />

                    <button
                        className="btn btn-warning ms-2"
                        onClick={enviarMensaje}
                    >
                        <i className="bi bi-send-fill"></i>
                    </button>
                </div>

            </div>
        </div>
    );
}
