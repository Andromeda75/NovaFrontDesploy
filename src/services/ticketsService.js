import api from '../api/axiosConfig';

export const ticketsService = {
    getSaldo: async () => {
        const response = await api.get('/tickets/saldo');
        return response.data;
    },

    getHistorial: async () => {
        const response = await api.get('/tickets/historial');
        return response.data;
    },

    getPaquetes: async () => {
        const response = await api.get('/tickets/paquetes');
        return response.data;
    },

    comprarPaquete: async (paqueteId) => {
        const response = await api.post('/stripe/crear-sesion-tickets', {
            paquete_id: paqueteId
        });
        return response.data;
    },

    // 👇 NUEVO: Crear sesión de pago para subasta
    crearSesionPagoSubasta: async (subastaId, monto) => {
        const response = await api.post('/stripe/crear-sesion-pago-subasta', {
            subasta_id: subastaId,
            monto: monto
        });
        return response.data;
    },

    confirmarPago: async (sessionId, paqueteId) => {
        const response = await api.get(`/stripe/confirmar-pago?session_id=${sessionId}&paquete_id=${paqueteId}`);
        return response.data;
    },

    // 👇 NUEVO: Confirmar pago de subasta
    confirmarPagoSubasta: async (sessionId, subastaId) => {
        const response = await api.get(`/stripe/confirmar-pago-subasta?session_id=${sessionId}&subasta_id=${subastaId}`);
        return response.data;
    },

    getMetodosPago: async () => {
        const response = await api.get('/usuarios/metodos-pago');
        return response.data;
    },

    getReglasConsumo: async () => {
        const response = await api.get('/tickets/reglas');
        return response.data;
    }
};