import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { dashboardService } from '../../../services/dashboardService';

function Dashboard() {
  const [periodo, setPeriodo] = useState('7dias');
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    ventas_totales: 0,
    subastas_activas: 0,
    articulos_publicados: 0
  });
  const [dataGrafica, setDataGrafica] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [totalObras, setTotalObras] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (periodo) {
      cargarRendimiento();
    }
  }, [periodo]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar estadísticas generales
      const stats = await dashboardService.getEstadisticas();
      setEstadisticas(stats);
      
      // Cargar distribución por categorías
      const distribucion = await dashboardService.getDistribucionCategorias();
      setCategorias(distribucion.categorias);
      setTotalObras(distribucion.total_obras);
      
      // Cargar datos de rendimiento
      await cargarRendimiento();
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarRendimiento = async () => {
    try {
      const data = await dashboardService.getRendimiento(periodo);
      setDataGrafica(data);
    } catch (error) {
      console.error('Error cargando datos de rendimiento:', error);
    }
  };

  const handlePeriodoChange = (e) => {
    setPeriodo(e.target.value);
  };

  const getPeriodoLabel = () => {
    switch (periodo) {
      case '7dias': return 'Últimos 7 días';
      case '14dias': return 'Últimos 14 días';
      case '30dias': return 'Últimos 30 días';
      case 'mes': return 'Este mes';
      default: return 'Últimos 7 días';
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
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

  return (
    <>
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-start">
            <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Dashboard General</h1>
            <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}>Monitor de rendimiento de la plataforma en tiempo real.</p>
          </div>

          <button className="btn-linear-gradient py-2 px-4" style={{ borderRadius: '8px' }}>
            <i className="bi bi-download fs-6"></i>
            <span className="d-none d-xxl-inline ms-2">
              Exportar Reporte
            </span>
          </button>
        </div>

        <div className="row g-3 mb-4">
          {[
            { label: 'Ventas Totales', val: formatearMoneda(estadisticas.ventas_totales), color: '#853104', icon: 'bi-bag-heart' },
            { label: 'Subastas Activas', val: estadisticas.subastas_activas, color: '#853104', icon: 'bi-hammer' },
            { label: 'Articulos Publicados', val: estadisticas.articulos_publicados, color: '#853104', icon: 'bi-cart4'},
          ].map((item, i) => (
            <div key={i} className="col-4 col-md-4 mov-card">
              <div className={`p-3 rounded-4 shadow-sm text-white h-100 ${item.border ? 'border border-primary border-2' : ''}`} 
                  style={{ backgroundColor: item.color }}>
                
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex justify-content-center align-items-center rounded-3 flex-shrink-0"
                    style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "rgba(255, 255, 255, 0.25)"
                    }}>
                    <i className={`bi ${item.icon} fs-4`}></i>
                  </div>

                  <div className="d-flex flex-column">
                    <span className="fw-bold" style={{ fontSize: '25px', lineHeight: 1.2 }}>{item.val}</span>
                    <span className="small opacity-90" style={{ fontSize: '14px' }}>{item.label}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="mov-card shadow-sm p-4 border w-100 h-100" style={{ borderRadius: '25px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-dark">Análisis de Rendimiento</h5>
                <select 
                  className="form-select form-select-sm w-auto border-light bg-light rounded-pill px-6"
                  value={periodo}
                  onChange={handlePeriodoChange}
                >
                  <option value="7dias">Últimos 7 días</option>
                  <option value="14dias">Últimos 14 días</option>
                  <option value="30dias">Últimos 30 días</option>
                  <option value="mes">Este mes</option>
                </select>
              </div>
              <div className="h-75" style={{ width: '100%', height: '200px' }}>
                {dataGrafica.length > 0 ? (
                  <ResponsiveContainer>
                    <AreaChart data={dataGrafica}>
                      <defs>
                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                      <YAxis hide={true} />
                      <Tooltip formatter={(value) => formatearMoneda(value)} />
                      <Area 
                        type="monotone" 
                        dataKey="ventas" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorIngresos)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">No hay datos disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mov-card card border shadow-sm p-4 text-center h-100" style={{ borderRadius: '25px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-start">
                  <h1 className="fw-bold display-5 color-1 mb-0" style={{ fontSize: '28px' }}>Distribución Artística</h1>
                  <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}>Volumen por categoría de obra.</p>
                </div>

                <div className="text-center">
                  <h1 className="fw-bold display-5 mb-0">{totalObras}</h1>
                  <h6 className='text-uppercase'>Obras Totales</h6>
                </div>
              </div>
              <div className="px-1">
                {categorias.length > 0 ? (
                  categorias.map((item, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: item.color,
                              display: "inline-block"
                            }}
                          ></span>
                          <span className="small fw-semibold text-uppercase">
                            {item.nombre}
                          </span>
                        </div>
                        <span className="small text-muted">
                          {item.porcentaje}%
                        </span>
                      </div>
                      <div
                        className="progress"
                        style={{
                          height: "12px",
                          borderRadius: "20px",
                          backgroundColor: "#e9ecef"
                        }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${item.porcentaje}%`,
                            backgroundColor: item.color,
                            borderRadius: "20px"
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No hay datos disponibles</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;