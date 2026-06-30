import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, requiredRol = null }) => {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();
    const userRol = authService.getCurrentRol();

    // Si no está autenticado, redirigir al login guardando la ubicación actual
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    }

    // Si se requiere un rol específico y el usuario no lo tiene
    if (requiredRol && userRol !== requiredRol) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;