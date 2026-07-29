import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';

import UserCard from '../../../components/cards/UserCard.jsx';

import { perfilService } from '../../../services/perfilService.js';

function Usuarios() {

  const { id } = useParams();
  const [filtro, setFiltro] = useState('Activos');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [users, setUsers] = useState([]);

  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 8;

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const userData = await perfilService.getUsers();
      setUsers(userData);
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = users.length;

  const totalUsersActivos = users.filter(
      user => user.estado_id === 1
  ).length;

  const totalUsersSuspendidos = users.filter(
      user => user.estado_id === 2
  ).length;

  const usersActivos = users.filter(
    item => item.estado_id === 1
  );

  const usersSuspendidos = users.filter(
    item => item.estado_id === 2
  );

  const usuariosFiltrados =
    filtro === "Activos"
      ? usersActivos
      : usersSuspendidos;

  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;

  const usuariosActuales = usuariosFiltrados.slice(
    indicePrimero,
    indiceUltimo
  );

  const totalPaginas = Math.ceil(
    usuariosFiltrados.length / usuariosPorPagina
  );

  const paginasVisibles = [];

  const maxBotones = 4; // Cantidad de botones visibles

  let inicio = Math.max(1, paginaActual - 2);
  let fin = Math.min(totalPaginas, inicio + maxBotones - 1);

  // Si estamos cerca del final
  if (fin - inicio < maxBotones - 1) {
    inicio = Math.max(1, fin - maxBotones + 1);
  }

  for (let i = inicio; i <= fin; i++) {
    paginasVisibles.push(i);
  }

  const cambiarEstado = async (id, nuevoEstado, motivo = "") => {
    try {
      await perfilService.cambiarEstado(id, nuevoEstado, motivo);
  
      setUsers(prev =>
        prev.map(p =>
          p.id === id ? { ...p, estado: nuevoEstado } : p
        )
      );
  
      await cargarDatos();
  
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showModalMessage('Error', 'No se pudo actualizar el estado', 'error');
    }
  };


  if (loading) {
    return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
        </div>
    </div>
    );
  }

  if (error) {
    return (
    <div className="alert alert-danger m-3">
        {error}
    </div>
    );
  }

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
          { label: 'Usuarios Totales', val: totalUsers, color: '#853104', icon: 'bi-people' },
          { label: 'Usuarios Activos', val: totalUsersActivos, color: '#853104', icon: 'bi-person-check' },
          { label: 'Usuarios Suspendidos', val: totalUsersSuspendidos, color: '#853104', icon: 'bi-person-slash' },
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
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Activos' ? 'bg-white shadow-sm' : 'opacity-75'}`}>
                    Lista de Usuarios
                  </button>
                  <button 
                    onClick={() => setFiltro('Suspendidos')}
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Suspendidos' ? 'bg-white shadow-sm' : 'opacity-75'}`}>
                    Usuarios Suspendidos
                  </button>
            </div>
        </div>

       <div className="row g-4">
        {usuariosActuales.length > 0 ? (

          usuariosActuales.map(item => (
            <div
              key={item.id}
              className="col-12 col-lg-6"
            >
              <UserCard
                {...item}
                filtro={filtro}
                cambiarEstado={cambiarEstado}
              />
            </div>
          ))

        ) : (

          <div className="col-12 text-center py-5">
            <i className="bi bi-folder-x fs-1 text-muted"></i>
            <h5 className="mt-3 text-muted">
              No hay usuarios.
            </h5>
          </div>

        )}
      </div>

      </div>
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center mt-5">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPaginaActual(1)}
                  style={{ color: '#8d4925' }}
                >
                  <i className="bi bi-chevron-double-left"></i>
                </button>
              </li>

              <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))} style={{ color: '#8d4925' }}>
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>

              {inicio > 1 && (
                <>
                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={() => setPaginaActual(1)}
                      style={
                          paginaActual === 1
                            ? {
                                backgroundColor: "#8d4925",
                                borderColor: "#8d4925",
                                color: "white"
                              }
                            : { color: "#8d4925" }
                        }
                      >
                      1
                    </button>
                  </li>

                  {inicio > 2 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                </>
              )}

              {paginasVisibles.map((pagina) => (
                <li
                  key={pagina}
                  className={`page-item ${paginaActual === pagina ? 'active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPaginaActual(pagina)}
                    style={
                      paginaActual === pagina
                        ? {
                            backgroundColor: '#8d4925',
                            borderColor: '#8d4925',
                            color: 'white'
                          }
                        : { color: '#8d4925' }
                    }
                  >
                    {pagina}
                  </button>
                </li>
              ))}

              {fin < totalPaginas && (
                <>
                  {fin < totalPaginas - 1 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}

                  <li className="page-item">
                    <button
                      className="page-link"
                      onClick={() => setPaginaActual(totalPaginas)}
                      style={
                        paginaActual === 1
                            ? {
                                backgroundColor: "#8d4925",
                                borderColor: "#8d4925",
                                color: "white"
                              }
                            : { color: "#8d4925" }
                        }
                      >
                      {totalPaginas}
                    </button>
                  </li>
                </>
              )}

              <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))} style={{ color: '#8d4925' }}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>

              <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPaginaActual(totalPaginas)}
                  style={{ color: '#8d4925' }}
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}


    </div>
    </>
  );
}

export default Usuarios;
      