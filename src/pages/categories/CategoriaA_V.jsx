import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Navbarc from '../../components/categories/Category.jsx';
import SubastaCard from '../../components/cards/subastas/SubastaCardv2.jsx';
import ArticuloCard from '../../components/cards/articulos/ArticuloCardv1.jsx';
import { subastaService } from '../../services/subastaService';

const CategoriaArteVisual = () => {
  const [filtro, setFiltro] = useState('Todos');
  const [subastas, setSubastas] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const CATEGORIA_ID = 1; // Arte Visual

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [subastasData, articulosData] = await Promise.all([
        subastaService.getSubastasByCategoria(CATEGORIA_ID),
        subastaService.getArticulosByCategoria(CATEGORIA_ID)
      ]);
      setSubastas(subastasData);
      setArticulos(articulosData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSubastas = filtro === 'Todos' || filtro === 'Subastas';
  const mostrarArticulos = filtro === 'Todos' || filtro === 'Articulos';

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
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={cargarDatos}>Reintentar</button>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid px-lg-5 py-4 bg-light min-vh-100">
        <Navbarc />

        <div className="d-flex align-items-center mb-4">
          <Link className="btn btn-link text-decoration-none text-muted p-0 me-4" to="/">
            <i className="bi bi-arrow-left me-2"></i>Volver al explorador
          </Link>
          <div className="p-1 rounded-pill d-flex gap-1 shadow-sm" style={{ backgroundColor: '#f0e6d2' }}>
            <button 
              onClick={() => setFiltro('Todos')}
              className={`btn btn-sm rounded-pill px-4 border-0 ${filtro === 'Todos' ? 'bg-white shadow-sm fw-bold color-1' : 'text-muted'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFiltro('Articulos')}
              className={`btn btn-sm rounded-pill px-4 border-0 ${filtro === 'Articulos' ? 'bg-white shadow-sm fw-bold color-1' : 'text-muted'}`}
            >
              Artículos
            </button>
            <button 
              onClick={() => setFiltro('Subastas')}
              className={`btn btn-sm rounded-pill px-4 border-0 ${filtro === 'Subastas' ? 'bg-white shadow-sm fw-bold color-1' : 'text-muted'}`}
            >
              Subastas
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* Subastas */}
          {mostrarSubastas && subastas.map((subasta) => (
            <div key={`sub-${subasta.id}`} className="col-md-6 col-lg-4 animate__animated animate__fadeIn">
                <SubastaCard {...subasta} isPage={true}/>
            </div>
          ))}

          {/* Artículos */}
          {mostrarArticulos && articulos.map((articulo) => (
            <div key={`art-${articulo.id}`} className="col-md-6 col-lg-4 animate__animated animate__fadeIn">
                <ArticuloCard {...articulo} isPage={true}/>
            </div>
          ))}

          {/* Mensaje si no hay datos */}
          {mostrarSubastas && subastas.length === 0 && mostrarArticulos && articulos.length === 0 && (
            <div className="col-12 text-center py-5">
              <i className="bi bi-folder-x fs-1 text-muted"></i>
              <h5 className="mt-3 text-muted">No hay contenido en esta categoría</h5>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoriaArteVisual;