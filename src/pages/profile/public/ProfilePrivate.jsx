import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Reputacion from './Reputacion.jsx';
import Articulos from './Articulos.jsx';
import Catalogo from './Catalogo.jsx';
import Configuracion from './Configuracion.jsx';
import Favoritos from './Favoritos.jsx';
import Historial from './Historial.jsx';
import Resumen from './Resumen.jsx';
import Solicitudes from './Solicitudes.jsx';
import Subasta from './Subastas.jsx';



const ResumenView = () => (
  <Resumen />
);

const CatalogoView = () => (
  <Catalogo />
);

const SubastasView = () => (
<Subasta />
);

const ArticulosView = () => (
  <Articulos />
);

const SolicitudesView = () => (
  <Solicitudes />
);

const ReputacionView = () => (
  <Reputacion />
);
const FavoritosView = () => (
  <Favoritos />

);
const HistorialView = () => (
  <Historial />



);


const ConfiguracionView = () => (
< Configuracion />
);


const PerfilHome = () => {
  const [seccionActiva, setSeccionActiva] = useState('Resumen');
  const navigate = useNavigate();
  const location = useLocation();
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  
  if (tab) {
    const formattedTab = tab.charAt(0).toUpperCase() + tab.slice(1);

    const existe = menuItems.some(item => item.label === formattedTab);
    if (existe) {
      setSeccionActiva(formattedTab);
    }
  }
}, [location]);
  const menuItems = [
    { icon: 'bi-house', label: 'Home' },
    { icon: 'bi-grid', label: 'Resumen' },
    { icon: 'bi-book', label: 'Catálogo' },
    { icon: 'bi-hammer', label: 'Subastas' },
    { icon: 'bi-cart', label: 'Artículos' },
    { icon: 'bi-chat-left-dots', label: 'Solicitudes' },
    { icon: 'bi-star', label: 'Reputación' },
    { icon: 'bi-heart', label: 'Favoritos' },
    { icon: 'bi-clock-history', label: 'Historial' },
    { icon: 'bi-gear', label: 'Configuración' },
    { icon: 'bi-box-arrow-right', label: 'Cerrar Sesión' },
  ];
  const handleNavigation = (label) => {
    if (label === 'Home') {
      navigate('/'); 
    } 
    if (label === 'Cerrar Sesión') {
      navigate('/login'); 
    } 
    else {
      setSeccionActiva(label);
    }
  };

  const renderContenido = () => {
    switch (seccionActiva) {
      case 'Resumen': return <ResumenView />;
      case 'Catálogo': return <CatalogoView />;
      case 'Subastas': return <SubastasView />;
      case 'Artículos': return <ArticulosView />;
      case 'Solicitudes': return <SolicitudesView />;
      case 'Reputación': return <ReputacionView />;
      case 'Favoritos': return <FavoritosView />;
      case 'Historial': return <HistorialView />;
      case 'Configuración': return <ConfiguracionView />;
      default: return <Resumen />;
    }
  };

  return (
    <div className="min-vh-100">
      <div className="container-fluid bg-light py-3 py-md-4 px-3 px-lg-5">
        <div className="d-lg-none mb-3 text-start">
          <button 
            className="btn bg-color-1 text-white rounded-pill d-flex align-items-center gap-2 shadow-sm" 
            type="button" 
            data-bs-toggle="offcanvas" 
            data-bs-target="#sidebarMenu">
            <i className="bi bi-list fs-4"></i>
            <span className="fw-bold small">{seccionActiva.toUpperCase()}</span>
          </button>
        </div>

        <div className="row g-4"> {/* Eliminado justify-content-center para que se pegue a la izquierda */}
          
          {/* SIDEBAR ESCRITORIO */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="card border-0 shadow-sm p-3 sticky-top" style={{ borderRadius: '15px', top: '20px' }}>
              <nav className="nav flex-column gap-1">
                {menuItems.map((item, index) => (
                  <button 
                    key={index}
                    onClick={() => handleNavigation(item.label)}
                    className={`nav-link border-0 text-start d-flex align-items-center gap-3 px-3 py-2 rounded-pill fw-bold small 
                      ${seccionActiva === item.label ? 'bg-color-4 text-white shadow-sm' : 'color-1 opacity-75 bg-transparent'}`}>
                    <i className={`bi ${item.icon} fs-6`}></i>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL DINÁMICO (Pegado a la izquierda del espacio restante) */}
          <div className="col-12 col-lg-9 text-start">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '15px', minHeight: '80vh' }}>
              {renderContenido()}
            </div>
          </div>

        </div>
      </div>

      {/* OFFCANVAS MÓVIL */}
      <div className="offcanvas offcanvas-start d-lg-none" tabIndex="-1" id="sidebarMenu" style={{ width: '280px' }}>
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-bold color-1">Mi Perfil</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body">
          <nav className="nav flex-column gap-1">
            {menuItems.map((item, index) => (
              <button 
                key={index}
                onClick={() => handleNavigation(item.label)}
                data-bs-dismiss="offcanvas"
                className={`nav-link border-0 text-start d-flex align-items-center gap-3 px-3 py-2 rounded-pill fw-bold small 
                  ${seccionActiva === item.label ? 'bg-color-1 text-white' : 'color-1 opacity-75 bg-transparent'}`}
              >
                <i className={`bi ${item.icon} fs-6`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PerfilHome;

