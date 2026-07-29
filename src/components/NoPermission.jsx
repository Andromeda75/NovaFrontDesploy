// frontend/src/components/NoPermission.jsx
import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NoPermission = ({ 
    title = "Acceso denegado",
    message = "No tienes permisos para acceder a esta sección.",
    showBackButton = true,
    backText = "Volver al inicio",
    backPath = "/",
    icon = "bi-shield-lock"
}) => {
    const navigate = useNavigate();

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
            <div className="text-center p-5">
                {/* Icono */}
                <div className="mb-4">
                    <div className="d-flex justify-content-center align-items-center mx-auto" 
                        style={{ 
                            width: '100px', 
                            height: '100px', 
                            backgroundColor: '#f8d7da', 
                            borderRadius: '50%',
                            border: '3px solid #dc3545'
                        }}>
                        <i className={`bi ${icon} fs-1 text-danger`}></i>
                    </div>
                </div>

                {/* Título */}
                <h2 className="fw-bold color-1 mb-3">{title}</h2>
                
                {/* Mensaje */}
                <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                    {message}
                </p>

                {/* Botón de volver */}
                {showBackButton && (
                    <Button 
                        className="btn-linear-gradient px-4 py-2"
                        onClick={() => navigate(backPath)}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        {backText}
                    </Button>
                )}
            </div>
        </Container>
    );
};

export default NoPermission;