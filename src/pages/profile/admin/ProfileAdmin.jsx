import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import Configuracion from './Configuracion.jsx';
import Dashborad from './Dashboard.jsx';
import Verificaciones from './Verificaciones.jsx';
import Usuarios from './Usuarios.jsx';
import Sitemasdetickets from './SistemaTickets.jsx';
import Monetizacion from './Monetizacion.jsx';
import Operaciones from './Operaciones.jsx';

import { authService } from '../../../services/authService.js';

const Perfiladmin = () => {
  const [seccionActiva, setSeccionActiva] = useState('Dashboard');

  const [pendientes, setPendientes] = useState(0);
  

  const obtenerPendientes = async () => {

    try {

      const data = await authService.getPendientes();
      setPendientes(data.total_pendientes);

    } catch (error) {

      console.error(error);

    }

  };

  useEffect(() => {
    obtenerPendientes();
  }, []);


  const menuItems = [
    { icon: 'bi-grid', label: 'Dashboard' },
    { icon: 'bi-shield', label: 'Verificaciones', badge: pendientes },
    { icon: 'bi-people', label: 'Usuarios' },
    { icon: 'bi-ticket', label: 'Sistemas de Tickets' },
    { icon: 'bi-currency-dollar', label: 'Monetización' },
    { icon: 'bi-gear-wide-connected', label: 'Operaciones' },
    { icon: 'bi-gear', label: 'Configuración' },
    { icon: 'bi-box-arrow-right', label: 'Cerrar Sesión' },
  ];

  const renderContenido = () => {
    switch (seccionActiva) {
      case 'Dashboard': return <Dashborad />;
      case 'Verificaciones': return <Verificaciones pendientes={pendientes} setPendientes={setPendientes}/>;
      case 'Usuarios': return <Usuarios />;
      case 'Sistemas de Tickets': return <Sitemasdetickets />;
      case 'Monetización': return <Monetizacion />;
      case 'Operaciones': return <Operaciones />;
      case 'Configuración': return <Configuracion />;
      default: return <Dashborad />;
    }
  };

  return (
    <div className="bg-white min-vh-100">

      <div className="container-fluid py-4 px-3 px-lg-5">
        
        {/* BOTÓN MÓVIL */}
        <div className="d-lg-none mb-3 text-start">
          <button className="btn shadow-sm d-flex align-items-center gap-2 rounded-pill px-4" 
            style={{ backgroundColor: '#4a2311', color: 'white' }} type="button" 
            data-bs-toggle="offcanvas" 
            data-bs-target="#adminSidebarMobile">
            <i className="bi bi-list fs-4"></i>
            <span className="fw-bold small">{seccionActiva.toUpperCase()}</span>
          </button>
        </div>

        <div className="row g-4">
          
          {/* SIDEBAR ESCRITORIO */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="card border-0 shadow-sm overflow-hidden sticky-top" style={{ borderRadius: '15px', top: '20px' }}>
              
              {/* RECUADRO ADMINISTRADOR (Degradado Café) */}
              <div className="p-3 text-center text-white" 
                   style={{ background: 'linear-gradient(to right, #471900, #853204)' }}>
                <h4 className="fw-bold mb-0" style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>ADMINISTRADOR</h4>
                <p className="mb-0 small" style={{ fontSize: '0.75rem', opacity: 0.9 }}>(Super Admin)</p>
              </div>

              <nav className="nav flex-column p-3 gap-1">
                {menuItems.map((item, index) => (
                  <button  key={index} onClick={() => setSeccionActiva(item.label)}
                    className={`nav-link border-0 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-pill fw-bold small transition-all
                      ${seccionActiva === item.label ? 'shadow-sm  text-white i-white' : 'color-2 bg-transparent'}`}
                    style={seccionActiva === item.label ? { backgroundColor: '#E8B767' } : {}}>
                    <div className="d-flex align-items-center fw-bold gap-3">
                      <i className={`bi ${item.icon} fs-6`} style={{ color: seccionActiva === item.label ? '#fff' : '#853204' }}></i>{item.label}
                    </div>
                    {item.badge !== undefined && (
                      <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="col-12 col-lg-9 text-start">
            <div className="ps-lg-4">
              {renderContenido()}
            </div>
          </div>

        </div>
      </div>

      {/* OFFCANVAS MÓVIL */}
      <div className="offcanvas offcanvas-start d-lg-none" tabIndex="-1" id="adminSidebarMobile" style={{ width: '280px' }}>
        <div className="offcanvas-header p-0 overflow-hidden">
           {/* Recuadro Admin también en móvil */}
           <div className="w-100 p-4 text-center text-white" 
                style={{ background: 'linear-gradient(to right, #4a2311, #a64d1d)' }}>
             <h4 className="fw-bold mb-0">ADMINISTRADOR</h4>
             <p className="mb-0 small">(Super Admin)</p>
           </div>
        </div>
        <div className="offcanvas-body">
          <nav className="nav flex-column gap-1">
            {menuItems.map((item, index) => (
              <button 
                key={index}
                onClick={() => setSeccionActiva(item.label)}
                data-bs-dismiss="offcanvas"
                className={`nav-link border-0 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-pill fw-bold small 
                  ${seccionActiva === item.label ? 'text-dark shadow-sm' : 'text-dark opacity-75 bg-transparent'}`}
                style={seccionActiva === item.label ? { backgroundColor: '#f2d9bb' } : {}}
              >
                <div className="d-flex align-items-center gap-3">
                  <i className={`bi ${item.icon} fs-6`} style={{ color: '#4a2311' }}></i>
                  {item.label}
                </div>
                {item.badge && (
                  <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Perfiladmin;