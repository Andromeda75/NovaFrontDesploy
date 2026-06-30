  import React from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { useState } from "react";
import UserCard from '../../../components/cards/UserCard.jsx';

function Usuarios() {
  const [users, setUsers] = useState([
    {
      id: 1,
      nombre: "Alex Rivera",
      rol: "Coleccionista de Arte",
      ubicacion: "Mérida, Yucatán",
      telefono: 9994399905,
      email: "alex@gmail.com",
      direccion: "Calle Principal 123",
      tickets: 10,
      estado: 1
    },
    {
      id: 2,
      nombre: "Lorena Peralta",
      rol: "Artesana",
      ubicacion: "Mérida, Yucatán",
      telefono: 9994396670,
      email: "lorena@gmail.com",
      direccion: "Calle Principal 123",
      tickets: 15,
      estado: 1
    },
    {
      id: 3,
      nombre: "Mauricio Suárez",
      rol: "Escultor",
      ubicacion: "Mérida, Yucatán",
      telefono: 9970806670,
      email: "mauricio@gmail.com",
      direccion: "Calle Principal 123",
      tickets: 20,
      estado: 1
    },
    {
      id: 4,
      nombre: "Estefania Rodriguez",
      rol: "Pintora",
      ubicacion: "Mérida, Yucatán",
      telefono: 9970806670,
      email: "estafania@gmail.com",
      direccion: "Calle Principal 123",
      tickets: 37,
      estado: 0
    },
    {
      id: 5,
      nombre: "Andrea Ruizz",
      rol: "Creadora Digital",
      ubicacion: "Mérida, Yucatán",
      telefono: 9970806670,
      email: "andrea@gmail.com",
      direccion: "Calle Principal 123",
      tickets: 40,
      estado: 0
    },
    {
      id: 6,
      nombre: "Alejandra Rodriguez",
      rol: "Artesana",
      ubicacion: "Mérida, Yucatán",
      telefono: 9970806670,
      email: "alejandra@gmail.com",
      direccion: "Calle Principal 123",
      tickets: 0,
      estado: 0
    }
  ]);

  const [filtro, setFiltro] = useState('Activos');

  const cambiarEstadoUsuario = (id, nuevoEstado) => {
    setUsers(
      users.map(user =>
        user.id === id ? { ...user, estado: nuevoEstado } : user
      )
    );
  };

  return (
    <>
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-start">
          <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Gestión de Usuarios</h1>
          <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}>Monitor de rendimiento de la plataforma en tiempo real.</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Usuarios Totales', val: '4,569', color: '#853104', icon: 'bi-people' },
          { label: 'Usuarios Activos', val: '3,285', color: '#853104', icon: 'bi-person-check' },
          { label: 'Usuarios Suspendidos', val: '1,284', color: '#853104', icon: 'bi-person-slash' },
        ].map((item, i) => (
          <div key={i} className="col-4 col-md-4 mov-card">
            <div className={`p-3 rounded-4 shadow-sm text-white h-100 ${item.border ? 'border border-primary border-2' : ''}`} 
                style={{ backgroundColor: item.color }}>
              
              <div className="d-flex align-items-center gap-3">
                {/* Icono a la izquierda */}
                <div className="d-flex justify-content-center align-items-center rounded-3 flex-shrink-0"
                  style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "rgba(255, 255, 255, 0.25)"
                  }}>
                  <i className={`bi ${item.icon} fs-4`}></i>
                </div>

                {/* Número grande arriba y texto pequeño abajo */}
                <div className="d-flex flex-column">
                  <span className="fw-bold" style={{ fontSize: '25px', lineHeight: 1.2 }}>{item.val}</span>
                  <span className="small opacity-90" style={{ fontSize: '14px' }}>{item.label}</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      <div className="mb-0">
        <div className="d-flex align-items-center mb-4">
            <div className="p-1 rounded-pill d-flex gap-2 shadow-sm" style={{ backgroundColor: '#f6d8a8', width: 'fit-content' }}>
                  <button 
                    onClick={() => setFiltro('Activos')}
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Activos' ? 'bg-white shadow-sm fw-bold color-2' : 'text-muted color-2'}`}>
                    Lista de Usuarios
                  </button>
                  <button 
                    onClick={() => setFiltro('Suspendidos')}
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Suspendidos' ? 'bg-white shadow-sm fw-bold color-2' : 'text-muted color-2'}`}>
                    Usuarios Suspendidos
                  </button>
            </div>
        </div>

        <div className="row g-4">
          {(filtro === 'Activos') && users
            .filter(user => user.estado === 1)
            .map((user) => (
              <div key={user.id} className="col-12 col-md-6 col-lg-6 d-flex animate__animated animate__fadeIn">
                <UserCard 
                  user={user}
                  filtro={filtro}
                  cambiarEstadoUsuario={cambiarEstadoUsuario}/>
              </div>
          ))}
          {(filtro === 'Suspendidos') && users
            .filter(user => user.estado === 0)
            .map((user) => (
              <div key={user.id} className="col-12 col-md-6 col-lg-6 d-flex animate__animated animate__fadeIn">
                <UserCard 
                  user={user}
                  filtro={filtro}
                  cambiarEstadoUsuario={cambiarEstadoUsuario}/>
              </div>
          ))}
        </div>
      </div>


    </div>
    </>
  );
}

export default Usuarios;
      