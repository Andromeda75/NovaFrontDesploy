// src/services/mensajesService.js

// Clave para guardar en localStorage
const STORAGE_KEY = 'chat_conversaciones';

const mensajesService = {
  // Obtener conversaciones activas
  getConversaciones: async () => {
    try {
      console.log('📨 Cargando conversaciones...');
      
      // 🔥 INTENTAR CARGAR DESDE localStorage
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const conversaciones = JSON.parse(guardado);
        console.log('📨 Cargando desde localStorage:', conversaciones);
        return conversaciones;
      }
      
      // DATOS SIMULADOS (mientras no tengas backend)
      const conversacionesSimuladas = [
        {
          id: 1,
          propuesta_id: 123,
          otro_usuario_id: 3,
          otro_usuario_nombre: "Nairobi",
          otro_usuario_foto: null,
          ultimo_mensaje: "¡Perfecto! Me pongo con el diseño...",
          fecha_ultimo_mensaje: new Date().toISOString(),
          no_leidos: 4,
          titulo_propuesta: "Diseño de logo para startup",
          precio: "$5,000.00"
        },
        {
          id: 2,
          propuesta_id: 124,
          otro_usuario_id: 4,
          otro_usuario_nombre: "María González",
          otro_usuario_foto: null,
          ultimo_mensaje: "Hola, ¿cómo vamos con el proyecto?",
          fecha_ultimo_mensaje: new Date(Date.now() - 86400000).toISOString(),
          no_leidos: 0,
          titulo_propuesta: "Ilustración para libro infantil",
          precio: "$3,500.00"
        }
      ];
      
      // 🔥 GUARDAR EN localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversacionesSimuladas));
      return conversacionesSimuladas;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  // Obtener mensajes de una conversación
  getMensajes: async (propuestaId) => {
    try {
      console.log(`📨 Cargando mensajes para propuesta ${propuestaId}...`);
      
      return [
        {
          id: 1,
          remitente_id: 3,
          remitente_nombre: "Nairobi",
          texto: "Hola! He revisado tu petición. Me encanta el concepto.",
          fecha: new Date(Date.now() - 3600000).toISOString(),
          propio: false
        },
        {
          id: 2,
          remitente_id: 5,
          remitente_nombre: "Tú",
          texto: "¡Genial! Tu portfolio es impresionante.",
          fecha: new Date(Date.now() - 1800000).toISOString(),
          propio: true
        },
        {
          id: 3,
          remitente_id: 3,
          remitente_nombre: "Nairobi",
          texto: "¡Perfecto! Me pongo con el diseño...",
          fecha: new Date(Date.now() - 600000).toISOString(),
          propio: false
        }
      ];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  // Enviar un mensaje
  enviarMensaje: async (data) => {
    try {
      console.log('📨 Enviando mensaje:', data);
      
      return { 
        success: true, 
        message: 'Mensaje enviado',
        data: {
          id: Date.now(),
          ...data,
          fecha: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // 🔥 NUEVO: Actualizar conversaciones en localStorage
  actualizarConversaciones: async (propuestaId) => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const conversaciones = JSON.parse(guardado);
        const actualizadas = conversaciones.map(c => 
          c.propuesta_id === propuestaId 
            ? { ...c, no_leidos: 0 }
            : c
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
        return actualizadas;
      }
      return [];
    } catch (error) {
      console.error('Error actualizando conversaciones:', error);
      return [];
    }
  },

  // Marcar mensajes como leídos
  marcarComoLeidos: async (propuestaId) => {
    try {
      console.log(`Marcando como leídos propuesta ${propuestaId}...`);
      
      // 🔥 ACTUALIZAR localStorage
      await mensajesService.actualizarConversaciones(propuestaId);
      
      return { success: true };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

export default mensajesService;