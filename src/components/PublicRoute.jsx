import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const PublicRoute = ({ children }) => {
    const isAuthenticated = authService.isAuthenticated();

    // Si ya está autenticado, redirigir según su rol
    if (isAuthenticated) {
        const user = authService.getCurrentUser();
        const rolId = authService.getCurrentRol();
        
        if (rolId === '1') {
            return <Navigate to={`/admin/${user?.id}`} replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;