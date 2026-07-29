import api from '../api/axiosConfig';

export const ticketsService = {
    // Obtener saldo de tickets del usuario
    getSaldo: async () => {
        const response = await api.get('/tickets/saldo');
        return response.data;
    },

    // Obtener historial de transacciones
    getHistorial: async () => {
        const response = await api.get('/tickets/historial');
        return response.data;
    },

    // Obtener paquetes de tickets disponibles
    getPaquetes: async () => {
        const response = await api.get('/tickets/paquetes');
        return response.data;
    },

    // Comprar paquete de tickets con Stripe
    comprarPaquete: async (paqueteId) => {
        const response = await api.post('/stripe/crear-sesion-tickets', {
            paquete_id: paqueteId
        });
        return response.data;
    },

    // Crear sesión de pago para subasta
    crearSesionPagoSubasta: async (subastaId, monto) => {
        const response = await api.post('/stripe/crear-sesion-pago-subasta', {
            subasta_id: subastaId,
            monto: monto
        });
        return response.data;
    },

    // Confirmar pago después de Stripe (para tickets)
    confirmarPago: async (sessionId, paqueteId) => {
        const response = await api.get(`/stripe/confirmar-pago?session_id=${sessionId}&paquete_id=${paqueteId}`);
        return response.data;
    },

    // Confirmar pago de subasta después de Stripe
    confirmarPagoSubasta: async (sessionId, subastaId) => {
        const response = await api.get(`/stripe/confirmar-pago-subasta?session_id=${sessionId}&subasta_id=${subastaId}`);
        return response.data;
    },

    // Obtener métodos de pago del usuario
    getMetodosPago: async () => {
        const response = await api.get('/usuarios/metodos-pago');
        return response.data;
    },

    // Obtener reglas de consumo
    getReglasConsumo: async () => {
        const response = await api.get('/tickets/reglas');
        return response.data;
    }
};