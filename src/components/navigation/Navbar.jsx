import React, { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

function Navbar() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const rolId = authService.getCurrentRol();

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    const getProfileLink = () => {
        if (!isAuthenticated) return '/login';
        if (rolId === '1') {
            return `/admin/${user?.id}`;
        }
        return `/perfil/${user?.id}`;
    };

    return (
        <nav className="border-bottom py-3 bg-white w-100">
            <Container fluid className="px-2 px-lg-5">
                <Row className="align-items-center g-0">
                    <Col xs={12} md={6} lg={3} className="d-flex justify-content-center align-items-center py-2">
                        <Link to="/">
                            {/* ✅ RUTA ABSOLUTA - CORREGIDA */}
                            <Image 
                                src="/img/logos/LogoPrincipal.png" 
                                alt="NovaCreations" 
                                className='col-10' 
                                fluid 
                            />
                        </Link>
                    </Col>

                    <Col xs={12} md={6} lg={3} className="d-flex justify-content-center align-items-center">
                        <form onSubmit={handleSearch} className="w-100">
                            <div className="w-100 input-icon position-relative">
                                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3"></i>
                                <Form.Control 
                                    type="text"
                                    placeholder="Buscar obras, artistas, categorías..." 
                                    className="color-3 bg-light rounded-pill px-4 py-2 ps-5"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                        </form>
                    </Col>

                    <Col xs={12} md={6} lg={3} className="d-flex gap-2 justify-content-center align-items-center py-2 py-lg-1 ps-md-4 px-2">
                        <Link to="/" className="text-decoration-none color-white mb-0 d-inline-block flex-fill bg-color-1 border-0 rounded-3 fw-bold d-flex justify-content-center align-items-center gap-2 py-2">
                            <i className="bi bi-house-door"></i>
                            <span className="m-0">Home</span> 
                        </Link>
                        
                        {isAuthenticated && (
                            <Link to="/tickets" className="text-decoration-none color-white mb-0 d-inline-block flex-fill bg-color-1 border-0 rounded-3 fw-bold d-flex justify-content-center align-items-center gap-2 py-2">
                                <i className="bi bi-ticket"></i>
                                <span className="m-0">Tickets</span>
                            </Link>
                        )}
                    </Col>

                    <Col xs={12} md={6} lg={3} className='d-flex justify-content-center justify-content-md-end justify-content-lg-end align-items-center gap-3 ps-lg-3 pe-md-3'>
                        
                        {isAuthenticated && (
                            <Link to={getProfileLink() + "?tab=favoritos"}>
                                <i className="bi bi-heart color-1 fw-bold fs-2"></i>
                            </Link>
                        )}
                        
                        {isAuthenticated && (
                            <a href="#"><i className="bi bi-bell color-1 fw-bold fs-2"></i></a>
                        )}
                        
                        {isAuthenticated ? (
                            <>
                                <Link to={getProfileLink()}>
                                    <i className="bi bi-person-circle color-1 fw-bold fs-2"></i>
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="text-decoration-none color-1 px-2 ms-2 small fw-bold d-inline-flex align-items-center bg-transparent border-0"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-box-arrow-right fs-2 me-2"></i>
                                    <span className="d-none d-lg-inline">Cerrar Sesión</span>
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="text-decoration-none color-1 px-2 ms-2 small fw-bold d-inline-flex align-items-center">
                                <i className="bi bi-box-arrow-in-right fs-2 me-2"></i>
                                <span className="d-none d-lg-inline">Iniciar Sesión</span>
                            </Link>
                        )}
                    </Col>
                </Row>
            </Container>
        </nav>
    );
}

export default Navbar;