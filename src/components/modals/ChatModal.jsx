import { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { perfilService } from "../../services/perfilService";
import mensajesService from "../../services/mensajesService";

export default function ChatPanel({ peticion, onClose }) {
    const [mensaje, setMensaje] = useState("");
    const [mensajes, setMensajes] = useState([]);
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [fotoOtroUsuario, setFotoOtroUsuario] = useState(null);
    const [nombreOtro, setNombreOtro] = useState("Usuario");
    const [cargandoMensajes, setCargandoMensajes] = useState(true);

    const user = authService.getCurrentUser();

    // Cargar foto del usuario actual
    useEffect(() => {
        const fotoGuardada = localStorage.getItem('fotoPerfil');
        if (fotoGuardada) {
            setFotoPerfil(fotoGuardada);
        }
    }, []);

    // Cargar foto del otro usuario y mensajes
    useEffect(() => {
        const cargarDatosChat = async () => {
            if (!peticion) return;
            
            console.log('📸 ChatPanel - peticion recibida:', peticion);
            
            // Determinar quién es el otro usuario
            let otroId = peticion.otro_id;
            let nombre = peticion.otro_nombre || "Usuario";
            
            if (!otroId || nombre === "Usuario") {
                if (user?.id === peticion.creador_id) {
                    otroId = peticion.artista_id;
                    nombre = peticion.artista_nombre || 'Artista';
                } else {
                    otroId = peticion.creador_id || peticion.artista_id;
                    nombre = peticion.creador_nombre || peticion.artista_nombre || 'Usuario';
                }
            }
            
            if (otroId && otroId !== user?.id) {
                try {
                    const perfilData = await perfilService.getPerfilPublico(otroId);
                    if (perfilData.nombre_completo) {
                        nombre = perfilData.nombre_completo;
                    }
                    if (perfilData.foto_perfil_url) {
                        setFotoOtroUsuario(perfilData.foto_perfil_url);
                    }
                } catch (error) {
                    console.error('Error cargando foto del otro usuario:', error);
                }
            }
            
            setNombreOtro(nombre);
            await cargarMensajes(peticion.id);
        };

        cargarDatosChat();
    }, [peticion, user?.id]);

    // Cargar mensajes
    const cargarMensajes = async (propuestaId) => {
        setCargandoMensajes(true);
        try {
            const mensajesData = await mensajesService.getMensajes(propuestaId);
            setMensajes(mensajesData);
        } catch (error) {
            console.error('Error cargando mensajes:', error);
            setMensajes([
                { id: 1, texto: "Hola 👋", propio: false },
                { id: 2, texto: "Hola, acepté tu oferta", propio: true }
            ]);
        } finally {
            setCargandoMensajes(false);
        }
    };

    // Enviar mensaje
    const enviarMensaje = async () => {
        if (!mensaje.trim() || !peticion?.id) return;

        const nuevoMensaje = {
            id: Date.now(),
            texto: mensaje,
            propio: true,
            remitente_id: user?.id,
            remitente_nombre: "Tú",
            fecha: new Date().toISOString()
        };

        setMensajes([...mensajes, nuevoMensaje]);
        setMensaje("");

        try {
            await mensajesService.enviarMensaje({
                propuesta_id: peticion.id,
                mensaje: mensaje
            });
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            alert('Error al enviar el mensaje. Intenta de nuevo.');
        }
    };

    // 🔥 FUNCIÓN PARA CERRAR - Asegura que se ejecute correctamente
    const handleClose = () => {
        console.log('🟢 Cerrando chat panel...');
        if (onClose) {
            onClose();
        }
    };

    return (
        <div 
            className="position-fixed top-0 start-0 w-100 vh-100 
                        bg-dark bg-opacity-50 
                        d-flex justify-content-center align-items-center"
            style={{ zIndex: 2000, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)'}}
            onClick={handleClose} // ← CIERRA AL HACER CLIC FUERA
        >
            <div 
                className="bg-white rounded-4 shadow d-flex flex-column overflow-hidden" 
                style={{ width: "700px", height: "80vh", maxWidth: "95vw" }}
                onClick={(e) => e.stopPropagation()} // ← EVITA CIERRE AL CLIC DENTRO
            >
                {/* HEADER */}
                <div className="p-3 d-flex align-items-center bg-white">
                    <div className="me-2">
                        <button className="btn border-0" onClick={handleClose}>
                            <i className="bi bi-chevron-left"></i>
                        </button>
                    </div>
                    
                    <div className="d-flex justify-content-center align-items-center shadow-sm me-3 overflow-hidden" 
                        style={{
                            width: "55px", 
                            height: "55px", 
                            backgroundColor: "#f3e1c7", 
                            borderRadius: "50%",
                            flexShrink: 0
                        }}>
                        {fotoOtroUsuario ? (
                            <img 
                                src={fotoOtroUsuario} 
                                alt="Foto de perfil"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <i className="bi bi-person color-1 fs-3"></i>
                        )}
                    </div>
                    
                    <div>
                        <h5 className="mb-0">{nombreOtro}</h5>
                    </div>

                    <button className="btn bg-color-2 text-white ms-auto shadow-sm" onClick={handleClose}>
                        Finalizar
                    </button>
                </div>
                
                <div className="p-3 border-bottom d-flex align-items-center" style={{ backgroundColor: '#f6d8a8' }}>
                    <div>
                        <h5 className="mb-0 color-2">{peticion?.titulo || 'Chat'}</h5>
                        <small className="text-muted fs-6">Oferta aceptada: {peticion?.precio || 'N/A'}</small>
                    </div>
                    <i className="bi bi-info-circle fs-3 color-3 ms-auto me-2"></i>
                </div>

                {/* MENSAJES */}
                <div className="flex-grow-1 overflow-auto p-4 bg-light d-flex flex-column">
                    {cargandoMensajes ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando mensajes...</span>
                            </div>
                        </div>
                    ) : mensajes.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <i className="bi bi-chat-dots fs-1"></i>
                            <p className="mt-3">No hay mensajes aún. ¡Envía el primero!</p>
                        </div>
                    ) : (
                        mensajes.map(msg => (
                            <div key={msg.id} className={`d-flex align-items-end mb-3 ${
                                    msg.propio ? "justify-content-end" : "justify-content-start"
                                }`}>
                                {!msg.propio && (
                                    <div className="d-flex justify-content-center align-items-center shadow-sm me-3 overflow-hidden" 
                                        style={{
                                            width: "30px", 
                                            height: "30px", 
                                            backgroundColor: "#f3e1c7", 
                                            borderRadius: "50%",
                                            flexShrink: 0
                                        }}>
                                        {fotoOtroUsuario ? (
                                            <img 
                                                src={fotoOtroUsuario} 
                                                alt="Avatar"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <i className="bi bi-person color-1 fs-6"></i>
                                        )}
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
                                    <div className="d-flex justify-content-center align-items-center shadow-sm ms-3 overflow-hidden" 
                                        style={{
                                            width: "30px", 
                                            height: "30px", 
                                            backgroundColor: "#f3e1c7", 
                                            borderRadius: "50%",
                                            flexShrink: 0
                                        }}>
                                        {fotoPerfil ? (
                                            <img 
                                                src={fotoPerfil} 
                                                alt="Avatar"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <i className="bi bi-person color-1 fs-6"></i>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* INPUT */}
                <div className="p-3 border-top d-flex">
                    <input
                        className="form-control"
                        placeholder="Escribe un mensaje..."
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
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