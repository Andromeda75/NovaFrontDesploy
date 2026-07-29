import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import VerificacionCard from "../../../components/cards/VerificacionCard.jsx";
import imagen from '../../../assets/img/illustrations/categories/arte-visual/imgA_V5.jpg';

import { articuloService } from '../../../services/articuloService.js';
import { subastaService } from '../../../services/subastaService.js';
import { authService } from '../../../services/authService.js';

function Verificaciones( {pendientes, setPendientes} ) {

  const { id } = useParams();

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filtro, setFiltro] = useState('Articulos');

  const [articulo, setArticulo] = useState([]);
  const [subasta, setSubasta] = useState([]);

  // Estado para el mensaje flotante (toast)
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: '', // 'success' o 'danger'
    itemName: ''
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {

      const articuloData = await articuloService.getArticulosAll();
      setArticulo(articuloData);

      // ✅ CORREGIDO: Usa el método que trae subastas pendientes (estado 7)
      const subastaData = await subastaService.getSubastasPendientesAdmin();
      setSubasta(subastaData);

    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const articuloEnEspera = articulo.filter(
    item => Number(item.estado_id) === 3
  );

  const subastasEnEspera = subasta.filter(
    item => Number(item.estado_id) === 7
  );

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [articulosPorPagina] = useState(6);

  const indiceUltimo = paginaActual * articulosPorPagina;
  const indicePrimero = indiceUltimo - articulosPorPagina;
  const datosActuales = filtro === 'Articulos' ? articuloEnEspera : subastasEnEspera;
  const articulosActuales = datosActuales.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(datosActuales.length / articulosPorPagina);

  useEffect(() => {
    if (datosActuales.length === 0) {
      setPaginaActual(1);
    } else {
      const maxPagina = Math.ceil(datosActuales.length / articulosPorPagina);
      if (paginaActual > maxPagina) {
        setPaginaActual(maxPagina);
      }
    }
  }, [datosActuales.length, paginaActual, articulosPorPagina]);

  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========== FUNCIÓN PARA CAMBIAR ESTADO (ACTUALIZADA) ==========
  const cambiarEstado = async (id, nuevoEstado, observaciones = '') => {
    try {
      const item = filtro === 'Articulos' 
        ? articulo.find(art => art.id === id)
        : subasta.find(sub => sub.id === id);
      
      const itemName = item?.titulo || item?.nombre || 'Elemento';

      if (filtro === 'Articulos') {
        // ========== ARTÍCULOS ==========
        if (nuevoEstado === 4) { // Aprobar (Publicado)
          await articuloService.aprobarArticulo(id);
        } else if (nuevoEstado === 6) { // Rechazar (Rechazado)
          await articuloService.rechazarArticulo(id, observaciones);
        } else {
          await articuloService.cambiarEstado(id, { estado_id: nuevoEstado });
        }

        setArticulo(prev =>
          prev.map(art =>
            art.id === id
              ? { ...art, estado_id: nuevoEstado }
              : art
          )
        );

      } else {
        // ========== SUBASTAS ==========
        if (nuevoEstado === 8) { // Aprobar (Activa)
          await subastaService.aprobarSubasta(id);
        } else if (nuevoEstado === 10) { // Rechazar (Rechazada)
          await subastaService.rechazarSubasta(id, observaciones);
        } else {
          await subastaService.cambiarEstado(id, { estado_id: nuevoEstado });
        }

        setSubasta(prev =>
          prev.map(sub =>
            sub.id === id
              ? { ...sub, estado_id: nuevoEstado }
              : sub
          )
        );
      }

      setPendientes(prev => Math.max(prev - 1, 0));

      const esAprobacion = nuevoEstado === 4 || nuevoEstado === 8;
      
      setToast({
        show: true,
        message: `La solicitud "${itemName}" fue ${esAprobacion ? 'aprobada' : 'rechazada'} con éxito`,
        type: esAprobacion ? 'success' : 'danger',
        itemName: itemName
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 10000);

    } catch (error) {
      console.error('Error en cambiarEstado:', error);
      
      setToast({
        show: true,
        message: error.response?.data?.message || 'Error al procesar la solicitud',
        type: 'danger',
        itemName: ''
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 10000);
    }
  };

  const cerrarToast = () => {
    setToast(prev => ({ ...prev, show: false }));
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
    <div className="d-flex justify-content-between align-items-start">
      {/* TOAST FLOTANTE */}
      {toast.show && (
        <div 
          className={`toast show position-fixed top-0 start-50 translate-middle-x mt-3`}
          style={{ 
            zIndex: 9999, 
            minWidth: '350px',
            maxWidth: '90%',
            animation: 'slideDown 0.5s ease-out'
          }}
        >
          <div className={`toast-header ${toast.type === 'success' ? 'bg-success' : 'bg-danger'} text-white`}>
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
            <strong className="me-auto">{toast.type === 'success' ? '¡Éxito!' : 'Error'}</strong>
            <small>Hace un momento</small>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={cerrarToast}
            ></button>
          </div>
          <div className="toast-body">
            {toast.message}
          </div>
        </div>
      )}

      <div style={{ width: '100%' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Validación de contenido</h1>
            <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}>Supervisa y aprueba obras antes de que salgan a subasta o se publiquen.</p>
          </div>
          
          <span 
            className="mt-1 px-4 py-1 fw-bold" 
            style={{ 
              backgroundColor: pendientes > 0 ? "#cb0000" : "#28a745", 
              borderRadius: "20px", 
              fontSize: "15px", 
              color: "#ffffff",
              minWidth: "120px",
              textAlign: "center"
            }}
          > 
            {pendientes} {pendientes === 1 ? "PENDIENTE" : "PENDIENTES"} 
          </span>
        </div>

        <div className="d-flex align-items-center mb-4">
            <div className="p-1 rounded-pill d-flex gap-2 shadow-sm" style={{ backgroundColor: '#f6d8a8', width: 'fit-content' }}>
                  <button 
                    onClick={() => setFiltro('Articulos')}
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Articulos' ? 'bg-white shadow-sm fw-bold color-2' : 'text-muted color-2'}`}>
                    Artículos
                  </button>
                  <button 
                    onClick={() => setFiltro('Subastas')}
                    className={`btn rounded-pill px-4 fw-bold small color-2 ${filtro === 'Subastas' ? 'bg-white shadow-sm fw-bold color-2' : 'text-muted color-2'}`}>
                    Subastas
                  </button>
            </div>
        </div>
        <div className="row g-4">
          {filtro === 'Articulos' && (
            <>
              {articuloEnEspera.length > 0 ? (

                    articulosActuales.map(item => (
                        <div key={item.id} className="col-12 col-md-6 col-lg-4">
                            <VerificacionCard 
                            filtro={filtro}
                            cambiarEstado={cambiarEstado}
                            {...item} />
                        </div>
                    ))

                ) : (

                    <div className="col-12 text-center py-5">
                        <i className="bi bi-check-circle-fill text-success fs-1"></i>
                        <h5 className="mt-3 text-muted">
                            No hay artículos pendientes
                        </h5>
                        <p className="text-muted">Todos los artículos han sido revisados</p>
                    </div>

                )}
              </>
          )}
          {filtro === 'Subastas' && (
            <>
              {subastasEnEspera.length > 0 ? (

                    articulosActuales.map(item => (
                        <div key={item.id} className="col-12 col-md-6 col-lg-4">
                            <VerificacionCard 
                            filtro={filtro}
                            cambiarEstado={cambiarEstado}
                            {...item} />
                        </div>
                    ))

                ) : (

                    <div className="col-12 text-center py-5">
                        <i className="bi bi-check-circle-fill text-success fs-1"></i>
                        <h5 className="mt-3 text-muted">
                            No hay subastas pendientes
                        </h5>
                        <p className="text-muted">Todas las subastas han sido revisadas</p>
                    </div>

                )}
              </>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="d-flex justify-content-center mt-5">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    style={{ color: '#8d4925' }}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>

                {[...Array(totalPaginas)].map((_, i) => (
                  <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => cambiarPagina(i + 1)}
                      style={
                        paginaActual === i + 1 
                          ? { backgroundColor: '#8d4925', borderColor: '#8d4925', color: 'white' } 
                          : { color: '#8d4925' }
                      }
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    style={{ color: '#8d4925' }}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {articulosActuales.length > 0 && (
          <div className="text-center text-muted small mt-3">
            Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, datosActuales.length)} de {datosActuales.length} artículos
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Verificaciones;