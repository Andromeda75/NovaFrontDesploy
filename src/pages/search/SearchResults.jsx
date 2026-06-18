import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';

function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('q') || '';
    const [results, setResults] = useState({ articulos: [], subastas: [], artistas: [], categorias: [] });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (query) {
            performSearch();
        }
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(data);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Error en búsqueda:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para renderizar tarjetas
    const renderCard = (item, type) => {
        switch (type) {
            case 'articulos':
                return (
                    <Col md={6} lg={4} xl={3} key={`art-${item.id}`} className="mb-4">
                        <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                            <div 
                                className="bg-secondary bg-opacity-10" 
                                style={{ 
                                    height: '180px', 
                                    backgroundImage: `url(${item.foto1_url || 'https://via.placeholder.com/300x200?text=Sin+imagen'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                            <Card.Body>
                                <Badge bg="secondary" className="mb-2">{item.categoria || 'Arte'}</Badge>
                                <Card.Title className="fw-bold color-1 fs-6">{item.titulo}</Card.Title>
                                <Card.Text className="text-muted small">
                                    {item.descripcion?.substring(0, 80)}...
                                </Card.Text>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <span className="fw-bold color-2">${item.precio_mxn?.toLocaleString()} MXN</span>
                                    <Button 
                                        variant="link" 
                                        className="text-decoration-none color-1 p-0"
                                        onClick={() => navigate(`/articulo/${item.id}`)}
                                    >
                                        Ver más <i className="bi bi-arrow-right"></i>
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                );

            case 'subastas':
                return (
                    <Col md={6} lg={4} xl={3} key={`sub-${item.id}`} className="mb-4">
                        <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                            <div 
                                className="bg-secondary bg-opacity-10 position-relative" 
                                style={{ 
                                    height: '180px', 
                                    backgroundImage: `url(${item.foto1_url || 'https://via.placeholder.com/300x200?text=Sin+imagen'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <span className="position-absolute top-0 end-0 m-2 px-2 py-1 bg-success text-white rounded-pill small">SUBASTA</span>
                            </div>
                            <Card.Body>
                                <Badge bg="secondary" className="mb-2">{item.categoria || 'Arte'}</Badge>
                                <Card.Title className="fw-bold color-1 fs-6">{item.titulo}</Card.Title>
                                <Card.Text className="text-muted small">
                                    {item.descripcion?.substring(0, 80)}...
                                </Card.Text>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <span className="fw-bold color-2">Desde ${item.precio_inicial_mxn?.toLocaleString()} MXN</span>
                                    <Button 
                                        variant="link" 
                                        className="text-decoration-none color-1 p-0"
                                        onClick={() => navigate(`/subasta/${item.id}`)}
                                    >
                                        Ver más <i className="bi bi-arrow-right"></i>
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                );

            case 'artistas':
                return (
                    <Col md={6} lg={4} xl={3} key={`artista-${item.id}`} className="mb-4">
                        <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden text-center">
                            <Card.Body className="d-flex flex-column align-items-center">
                                <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                                    style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        backgroundColor: '#E8B767',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {item.foto_perfil_url ? (
                                        <img src={item.foto_perfil_url} alt={item.nombre_completo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <i className="bi bi-person fs-1 color-1"></i>
                                    )}
                                </div>
                                <Card.Title className="fw-bold color-1 fs-6">{item.nombre_completo}</Card.Title>
                                <Card.Text className="text-muted small text-center">
                                    {item.interes || 'Artista'}
                                </Card.Text>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <i className="bi bi-star-fill text-warning"></i>
                                    <span className="fw-bold small">{item.calificacion_promedio || 0} / 5.0</span>
                                </div>
                                <Button 
                                    variant="outline-primary"
                                    size="sm"
                                    className="rounded-pill px-3"
                                    onClick={() => navigate(`/profile/public/${item.id}`)}
                                >
                                    Ver perfil
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                );

            case 'categorias':
                return (
                    <Col md={6} lg={4} xl={3} key={`cat-${item.id}`} className="mb-4">
                        <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden text-center">
                            <Card.Body className="d-flex flex-column align-items-center">
                                <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                                    style={{ width: '70px', height: '70px', backgroundColor: '#f0f0f0' }}
                                >
                                    <i className="bi bi-tag fs-2 color-3"></i>
                                </div>
                                <Card.Title className="fw-bold color-1 fs-6">{item.nombre}</Card.Title>
                                <Card.Text className="text-muted small text-center">
                                    {item.descripcion?.substring(0, 60)}...
                                </Card.Text>
                                <Button 
                                    variant="outline-secondary"
                                    size="sm"
                                    className="rounded-pill px-3 mt-2"
                                    onClick={() => {
                                        const categoriaMap = {
                                            'Arte Visual': '/categoriaAV',
                                            'Arte Digital': '/categoriaAD',
                                            'Fotografía': '/categoriaF',
                                            'Escultura': '/categoriaE',
                                            'Artesanías': '/categoriaA',
                                            'Coleccionables': '/categoriaC'
                                        };
                                        navigate(categoriaMap[item.nombre] || '/');
                                    }}
                                >
                                    Explorar <i className="bi bi-arrow-right ms-1"></i>
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                );

            default:
                return null;
        }
    };

    return (
        <Container className="py-5">
            {/* Header */}
            <div className="mb-4 text-center">
                <h1 className="fw-bold color-1 mb-2">Resultados de búsqueda</h1>
                <p className="text-muted">
                    {loading ? 'Buscando...' : `Se encontraron ${total} resultados para "${query}"`}
                </p>
            </div>

            {/* FILTROS - Diseño igual a MisSubastas */}
            {!loading && total > 0 && (
                <div className="d-flex justify-content-center mb-5">
                    <div className="d-flex p-1 gap-2 rounded-pill shadow-sm" style={{ backgroundColor: '#f6d8a8', width: 'fit-content' }}>
                        <button 
                            className={`btn rounded-pill px-4 fw-bold small color-2 ${filter === 'todos' ? 'bg-white shadow-sm' : 'opacity-75'}`}
                            onClick={() => setFilter('todos')}
                        >
                            Todos ({total})
                        </button>
                        {results.articulos?.length > 0 && (
                            <button 
                                className={`btn rounded-pill px-4 fw-bold small color-2 ${filter === 'articulos' ? 'bg-white shadow-sm' : 'opacity-75'}`}
                                onClick={() => setFilter('articulos')}
                            >
                                Obras ({results.articulos.length})
                            </button>
                        )}
                        {results.subastas?.length > 0 && (
                            <button 
                                className={`btn rounded-pill px-4 fw-bold small color-2 ${filter === 'subastas' ? 'bg-white shadow-sm' : 'opacity-75'}`}
                                onClick={() => setFilter('subastas')}
                            >
                                Subastas ({results.subastas.length})
                            </button>
                        )}
                        {results.artistas?.length > 0 && (
                            <button 
                                className={`btn rounded-pill px-4 fw-bold small color-2 ${filter === 'artistas' ? 'bg-white shadow-sm' : 'opacity-75'}`}
                                onClick={() => setFilter('artistas')}
                            >
                                Artistas ({results.artistas.length})
                            </button>
                        )}
                        {results.categorias?.length > 0 && (
                            <button 
                                className={`btn rounded-pill px-4 fw-bold small color-2 ${filter === 'categorias' ? 'bg-white shadow-sm' : 'opacity-75'}`}
                                onClick={() => setFilter('categorias')}
                            >
                                Categorías ({results.categorias.length})
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Resultados */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Buscando...</p>
                </div>
            ) : total === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-search fs-1 text-muted"></i>
                    <h3 className="mt-3">No se encontraron resultados</h3>
                    <p className="text-muted">Intenta con otras palabras o revisa la ortografía</p>
                    <Button variant="outline-primary" onClick={() => navigate('/')} className="mt-3 rounded-pill px-4">
                        Volver al inicio
                    </Button>
                </div>
            ) : (
                <Row>
                    {/* Artículos */}
                    {(filter === 'todos' || filter === 'articulos') && results.articulos?.map(item => renderCard(item, 'articulos'))}
                    
                    {/* Subastas */}
                    {(filter === 'todos' || filter === 'subastas') && results.subastas?.map(item => renderCard(item, 'subastas'))}
                    
                    {/* Artistas */}
                    {(filter === 'todos' || filter === 'artistas') && results.artistas?.map(item => renderCard(item, 'artistas'))}
                    
                    {/* Categorías */}
                    {(filter === 'todos' || filter === 'categorias') && results.categorias?.map(item => renderCard(item, 'categorias'))}
                </Row>
            )}
        </Container>
    );
}

// Badge component (no estaba importado)
const Badge = ({ bg, children, className }) => (
    <span className={`badge bg-${bg} ${className}`} style={{ fontSize: '10px', padding: '4px 8px' }}>
        {children}
    </span>
);

export default SearchResults;