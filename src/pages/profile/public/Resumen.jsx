import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { perfilService } from '../../../services/perfilService';
import { authService } from '../../../services/authService';

const ResumenView = () => {
  const [periodoIngresos, setPeriodoIngresos] = useState('7dias');
  const [periodoVentas, setPeriodoVentas] = useState('7dias');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Datos del perfil
  const [perfil, setPerfil] = useState({
    id: '',
    nombre_completo: '',
    interes: '',
    ubicacion: '',
    calificacion_promedio: 0,
    saldo_tickets: 0
  });

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    tickets_disponibles: 0,
    subastas_publicadas: 0,
    catalogos_publicados: 0,
    articulos_publicados: 0
  });

  // Datos para gráficas
  const [datosIngresos, setDatosIngresos] = useState([]);
  const [datosVentas, setDatosVentas] = useState([]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar datos cuando cambia el período de ingresos
  useEffect(() => {
    if (periodoIngresos) {
      cargarIngresos();
    }
  }, [periodoIngresos]);

  // Cargar datos cuando cambia el período de ventas
  useEffect(() => {
    if (periodoVentas) {
      cargarVentas();
    }
  }, [periodoVentas]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar perfil
      const perfilData = await perfilService.getPerfil();
      setPerfil(perfilData);
      
      // Cargar estadísticas
      const estadisticasData = await perfilService.getEstadisticas();
      setEstadisticas(estadisticasData);
      
      // Cargar ingresos y ventas
      await cargarIngresos();
      await cargarVentas();
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarIngresos = async () => {
    try {
      const response = await perfilService.getIngresos(periodoIngresos);
      
      // Procesar datos para la gráfica
      const dias = obtenerDiasDelPeriodo(periodoIngresos);
      const datosProcesados = dias.map(dia => {
        const fechaStr = dia.toISOString().split('T')[0];
        
        // Buscar ingresos de subasta para este día
        const subastaDelDia = response.subasta?.find(s => 
          new Date(s.fecha).toISOString().split('T')[0] === fechaStr
        ) || { total: 0 };
        
        // Buscar ingresos de artículo para este día
        const articuloDelDia = response.articulo?.find(a => 
          new Date(a.fecha).toISOString().split('T')[0] === fechaStr
        ) || { total: 0 };
        
        // Buscar ingresos de petición para este día
        const peticionDelDia = response.peticion?.find(p => 
          new Date(p.fecha).toISOString().split('T')[0] === fechaStr
        ) || { total: 0 };
        
        const total = subastaDelDia.total + articuloDelDia.total + peticionDelDia.total;
        
        return {
          name: obtenerNombreDia(dia),
          ingresosTotales: total,
          subasta: subastaDelDia.total,
          articulo: articuloDelDia.total,
          peticion: peticionDelDia.total
        };
      });
      
      setDatosIngresos(datosProcesados);
    } catch (err) {
      console.error('Error cargando ingresos:', err);
    }
  };

  const cargarVentas = async () => {
    try {
      const response = await perfilService.getVentas(periodoVentas);
      
      const dias = obtenerDiasDelPeriodo(periodoVentas);
      const datosProcesados = dias.map(dia => {
        const fechaStr = dia.toISOString().split('T')[0];
        
        const subastaDelDia = response.subasta?.find(s => 
          new Date(s.fecha).toISOString().split('T')[0] === fechaStr
        ) || { total: 0 };
        
        const articuloDelDia = response.articulo?.find(a => 
          new Date(a.fecha).toISOString().split('T')[0] === fechaStr
        ) || { total: 0 };
        
        const peticionDelDia = response.peticion?.find(p => 
          new Date(p.fecha).toISOString().split('T')[0] === fechaStr
        ) || { total: 0 };
        
        const total = subastaDelDia.total + articuloDelDia.total + peticionDelDia.total;
        
        return {
          name: obtenerNombreDia(dia),
          totalVentas: total,
          subasta: subastaDelDia.total,
          articulo: articuloDelDia.total,
          peticion: peticionDelDia.total
        };
      });
      
      setDatosVentas(datosProcesados);
    } catch (err) {
      console.error('Error cargando ventas:', err);
    }
  };

  const obtenerDiasDelPeriodo = (periodo) => {
    const dias = [];
    const hoy = new Date();
    let diasCount = 0;
    
    switch (periodo) {
      case '7dias':
        diasCount = 7;
        break;
      case '14dias':
        diasCount = 14;
        break;
      case '30dias':
      case 'mes':
        diasCount = 30;
        break;
      default:
        diasCount = 7;
    }
    
    for (let i = diasCount - 1; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() - i);
      dias.push(fecha);
    }
    
    return dias;
  };

  const obtenerNombreDia = (fecha) => {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const hoy = new Date();
    const diffDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return diasSemana[fecha.getDay()];
    
    return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
  };

  // Calcular totales del período para ingresos
  const totalesIngresos = datosIngresos.reduce((acc, dia) => ({
    subasta: acc.subasta + (dia.subasta || 0),
    articulo: acc.articulo + (dia.articulo || 0),
    peticion: acc.peticion + (dia.peticion || 0),
    total: acc.total + (dia.ingresosTotales || 0)
  }), { subasta: 0, articulo: 0, peticion: 0, total: 0 });

  // Calcular totales del período para ventas
  const totalesVentas = datosVentas.reduce((acc, dia) => ({
    subasta: acc.subasta + (dia.subasta || 0),
    articulo: acc.articulo + (dia.articulo || 0),
    peticion: acc.peticion + (dia.peticion || 0),
    total: acc.total + (dia.totalVentas || 0)
  }), { subasta: 0, articulo: 0, peticion: 0, total: 0 });

  // Formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Tooltip personalizado para ingresos
  const CustomTooltipIngresos = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-3 shadow-sm border" style={{ minWidth: '200px' }}>
          <h6 className="fw-bold mb-2 color-1">{label}</h6>
          <div className="mb-2 pb-2 border-bottom">
            <span className="text-muted small">Total del día:</span>
            <span className="fw-bold ms-2" style={{ color: '#6d6d6d' }}>
              {formatearMoneda(payload[0].payload.ingresosTotales)}
            </span>
          </div>
          <div className="d-flex justify-content-between small mb-1">
            <span style={{ color: '#8884d8' }}>● Subasta:</span>
            <span className="fw-bold">{formatearMoneda(payload[0].payload.subasta)}</span>
          </div>
          <div className="d-flex justify-content-between small mb-1">
            <span style={{ color: '#82ca9d' }}>● Artículo:</span>
            <span className="fw-bold">{formatearMoneda(payload[0].payload.articulo)}</span>
          </div>
          <div className="d-flex justify-content-between small">
            <span style={{ color: '#ffc658' }}>● Petición:</span>
            <span className="fw-bold">{formatearMoneda(payload[0].payload.peticion)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Tooltip personalizado para ventas
  const CustomTooltipVentas = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-3 shadow-sm border" style={{ minWidth: '200px' }}>
          <h6 className="fw-bold mb-2 color-1">{label}</h6>
          <div className="mb-2 pb-2 border-bottom">
            <span className="text-muted small">Total del día:</span>
            <span className="fw-bold ms-2" style={{ color: '#6d6d6d' }}>
              {payload[0].payload.totalVentas}
            </span>
          </div>
          <div className="d-flex justify-content-between small mb-1">
            <span style={{ color: '#8884d8' }}>● Subasta:</span>
            <span className="fw-bold">{payload[0].payload.subasta}</span>
          </div>
          <div className="d-flex justify-content-between small mb-1">
            <span style={{ color: '#82ca9d' }}>● Artículo:</span>
            <span className="fw-bold">{payload[0].payload.articulo}</span>
          </div>
          <div className="d-flex justify-content-between small">
            <span style={{ color: '#ffc658' }}>● Petición:</span>
            <span className="fw-bold">{payload[0].payload.peticion}</span>
          </div>
        </div>
      );
    }
    return null;
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

  const user = authService.getCurrentUser();

  return (
    <div className="p-2 animate__animated animate__fadeIn">
      {/* SECCIÓN DE PERFIL */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3">
        <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4 text-center text-md-start w-90">
          <div className="text-center">
            <div className="rounded-4 d-flex align-items-center justify-content-center shadow-sm mb-2" 
                 style={{ backgroundColor: '#f2d9bb', width: '100px', height: '100px' }}>
              <i className="bi bi-person-circle text-muted" style={{ fontSize: '5rem' }}></i>
            </div>
            <div className="small fw-bold" style={{ color: '#853204' }}>Calificación</div>
            <div className="h6 fw-bold color-2">
              <i className="bi bi-star-fill text-warning me-1"></i>{perfil.calificacion_promedio || 4.8} / 5.0
            </div>
          </div>
          <div>
            <h1 className="fw-bold mb-0" style={{ color: '#4a2311', fontSize: '2.5rem' }}>{perfil.nombre_completo || user?.nombre_completo}</h1>
            <h4 className="fw-bold" style={{ color: '#853204' }}>{perfil.interes || 'Coleccionista de Arte'}</h4>
            <div className="text-muted d-flex align-items-center gap-2 color-2">
              <i className="bi bi-geo-alt-fill" style={{ color: '#853204' }}></i> 
              {perfil.ubicacion || 'Mérida, Yucatán'} • Miembro desde {new Date(perfil.fecha_registro).getFullYear() || '2025'}
            </div>
          </div>
        </div>
        {/* Botones de Acción */}
        <div className="d-flex flex-column gap-2 mt-2">
          <Link to={`/profile/public/${perfil.id}`} className="text-decoration-none btn-linear-gradient border-0 rounded-3 py-2 px-4">
            <i className="bi bi-eye-fill me-2"></i> Ver como Público
          </Link>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Tickets Disponibles', val: estadisticas.tickets_disponibles || 0, color: '#853104', icon: 'bi-ticket-perforated' },
          { label: 'Subastas Publicadas', val: estadisticas.subastas_publicadas || 0, color: '#853104', icon: 'bi-hammer' },
          { label: 'Catálogos Publicados', val: estadisticas.catalogos_publicados || 0, color: '#853104', icon: 'bi-folder2'},
          { label: 'Artículos Publicados', val: estadisticas.articulos_publicados || 0, color: '#853104', icon: 'bi-cart3' }
        ].map((item, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="p-3 rounded-4 shadow-sm text-white h-100" style={{ backgroundColor: item.color }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex justify-content-center align-items-center rounded-3 flex-shrink-0"
                    style={{width: "50px", height: "50px", backgroundColor: "rgba(255, 255, 255, 0.25)"}}>
                  <i className={`bi ${item.icon} fs-4`}></i>
                </div>
                <div className="d-flex flex-column">
                  <div className="h2 fw-bold mb-0 lh-1" style={{ fontSize: '25px' }}>{item.val}</div>
                  <div className="small opacity-90" style={{ fontSize: '0.75rem' }}>{item.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TÍTULO MI ACTIVIDAD */}
      <div className="mb-3">
        <h3 className="fw-bold" style={{ color: '#4a2311' }}>
          <i className="bi bi-activity color-2 me-2"></i> Mi Actividad
        </h3>
        <p className="text-muted small">Resumen de tus ingresos y ventas por categoría</p>
      </div>

      {/* SECCIÓN DE GRÁFICAS: INGRESOS Y VENTAS */}
      <div className="row g-4">
        {/* GRÁFICA DE INGRESOS */}
        <div className="col-lg-6">
          <div className="mov-card shadow-sm p-4 border w-100" style={{ borderRadius: '25px', height: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{ color: '#4a2311' }}>Ingresos por categoría</h5>
              <select 
                className="form-select form-select-sm w-auto border-light bg-light rounded-pill px-4"
                value={periodoIngresos}
                onChange={(e) => setPeriodoIngresos(e.target.value)}
              >
                <option value="7dias">Últimos 7 días</option>
                <option value="14dias">Últimos 14 días</option>
                <option value="30dias">Últimos 30 días</option>
                <option value="mes">Este mes</option>
              </select>
            </div>

            {/* Mini tarjetas de totales de ingresos */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              <div className="bg-light rounded-3 px-3 py-1">
                <small className="text-muted">Total: </small>
                <span className="fw-bold small" style={{ color: '#6d6d6d' }}>{formatearMoneda(totalesIngresos.total)}</span>
              </div>
              <div className="bg-light rounded-3 px-3 py-1">
                <small className="text-muted">Subasta: </small>
                <span className="fw-bold small" style={{ color: '#8884d8' }}>{formatearMoneda(totalesIngresos.subasta)}</span>
              </div>
              <div className="bg-light rounded-3 px-3 py-1">
                <small className="text-muted">Artículo: </small>
                <span className="fw-bold small" style={{ color: '#82ca9d' }}>{formatearMoneda(totalesIngresos.articulo)}</span>
              </div>
              <div className="bg-light rounded-3 px-3 py-1">
                <small className="text-muted">Petición: </small>
                <span className="fw-bold small" style={{ color: '#ffc658' }}>{formatearMoneda(totalesIngresos.peticion)}</span>
              </div>
            </div>

            {/* Gráfica de ingresos */}
            <div style={{ width: '100%', height: '200px' }}>
              {datosIngresos.length > 0 ? (
                <ResponsiveContainer>
                  <AreaChart data={datosIngresos} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSubasta" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorArticulo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPeticion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffc658" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#999' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fill: '#999' }} 
                      width={35} 
                      tickFormatter={(value) => `$${value/1000}k`} 
                    />
                    <Tooltip content={<CustomTooltipIngresos />} />
                    
                    <Area type="monotone" dataKey="subasta" stackId="1" stroke="#8884d8" strokeWidth={2} fill="url(#colorSubasta)" name="Subasta" />
                    <Area type="monotone" dataKey="articulo" stackId="1" stroke="#82ca9d" strokeWidth={2} fill="url(#colorArticulo)" name="Artículo" />
                    <Area type="monotone" dataKey="peticion" stackId="1" stroke="#ffc658" strokeWidth={2} fill="url(#colorPeticion)" name="Petición" />
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

        {/* GRÁFICA DE VENTAS */}
        <div className="col-lg-6">
          <div className="mov-card shadow-sm p-4 border w-100" style={{ borderRadius: '25px', height: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{ color: '#4a2311' }}>Ventas por categoría</h5>
              <select 
                className="form-select form-select-sm w-auto border-light bg-light rounded-pill px-4"
                value={periodoVentas}
                onChange={(e) => setPeriodoVentas(e.target.value)}
              >
                <option value="7dias">Últimos 7 días</option>
                <option value="14dias">Últimos 14 días</option>
                <option value="30dias">Últimos 30 días</option>
                <option value="mes">Este mes</option>
              </select>
            </div>

            {/* Mini tarjetas de totales de ventas */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              <div className="bg-light rounded-3 px-3 py-1">
                <small className="text-muted">Total: </small>
                <span className="fw-bold small" style={{ color: '#6d6d6d' }}>{totalesVentas.total}</span>
              </div>
              <div className="bg-light rounded-3 px-3 py-1">
                <small className="text-muted">Subasta: </small>
                <span className="fw-bold small" style={{ color: '#8884d8' }}>{totalesVentas.subasta}</span>
              </div>
              <div className="bg-light rounded-3 px-3 py-1">
                <small className="text-muted">Artículo: </small>
                <span className="fw-bold small" style={{ color: '#82ca9d' }}>{totalesVentas.articulo}</span>
              </div>
              <div className="bg-light rounded-3 px-3 py-1">
                <small className="text-muted">Petición: </small>
                <span className="fw-bold small" style={{ color: '#ffc658' }}>{totalesVentas.peticion}</span>
              </div>
            </div>

            {/* Gráfica de ventas */}
            <div style={{ width: '100%', height: '200px' }}>
              {datosVentas.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={datosVentas} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#999' }}
                    />
                    <YAxis tick={{ fontSize: 9, fill: '#999' }} width={35} />
                    <Tooltip content={<CustomTooltipVentas />} />
                    
                    <Bar dataKey="subasta" stackId="a" fill="#8884d8" name="Subasta" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="articulo" stackId="a" fill="#82ca9d" name="Artículo" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="peticion" stackId="a" fill="#ffc658" name="Petición" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted">No hay datos disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenView;