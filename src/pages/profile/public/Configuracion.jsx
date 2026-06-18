import React, { useState, useEffect } from 'react';
import { perfilService } from '../../../services/perfilService';
import { authService } from '../../../services/authService';

const Configuracion = () => {
  const [loading, setLoading] = useState(true);
  const [modalContenido, setModalContenido] = useState('seguridad_inicio'); 
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [proximaAccion, setProximaAccion] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // Datos del perfil desde la BD
  const [datosPersonales, setDatosPersonales] = useState({
    nombreCompleto: '',
    interes: '',
    ubicacion: '',
    direccion: '',
    descripcion: '',
    instagram: '',
    twitter: '',
    facebook: '',
    telefono: '',
    email: ''
  });

  const [tarjetas, setTarjetas] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  const brand = {
    darkBrown: '#4a2311',
    mediumBrown: '#8d4925',
    accentOrange: '#d4a373',
    lightSand: '#fdf8f3',
    gradient: 'linear-gradient(to right, #2a140a, #8d4925)'
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const perfil = await perfilService.getPerfil();
      console.log('Perfil cargado:', perfil);
      
      setDatosPersonales({
        nombreCompleto: perfil.nombre_completo || '',
        interes: perfil.interes || 'Coleccionista de arte',
        ubicacion: perfil.ubicacion || 'Mérida, Yucatán',
        direccion: perfil.direccion || '',
        descripcion: perfil.descripcion || '',
        instagram: perfil.instagram_handle || '',
        twitter: perfil.twitter_handle || '',
        facebook: perfil.facebook_handle || '',
        telefono: perfil.telefono || '',
        email: perfil.email || ''
      });
      
      setUserEmail(perfil.email || '');

      // Cargar métodos de pago
      const metodos = await perfilService.getMetodosPago();
      setTarjetas(metodos.map(m => ({
        id: m.id,
        numero: m.numero_tarjeta_enmascarado,
        exp: new Date(m.fecha_expiracion).toLocaleDateString('es-MX', { month: '2-digit', year: '2-digit' }),
        tipo: 'visa',
        es_principal: m.es_principal
      })));

    } catch (error) {
      console.error('Error cargando datos:', error);
      mostrarToast('Error al cargar los datos', false);
    } finally {
      setLoading(false);
    }
  };

  const mostrarToast = (mensaje, esExito = true) => {
    setToastMessage(mensaje);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const mostrarExito = () => {
    setModalContenido('exito');
    mostrarToast('Configuración guardada correctamente');
  };

  const iniciarFlujoSeguridad = (tipo) => {
    setProximaAccion(tipo);
    setModalContenido('seguridad_inicio');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosPersonales({
      ...datosPersonales,
      [name]: value
    });
  };

  const toggleEdicion = async () => {
    if (modoEdicion) {
      setLoading(true);
      try {
        const dataToUpdate = {
          nombre_completo: datosPersonales.nombreCompleto,
          interes: datosPersonales.interes,
          ubicacion: datosPersonales.ubicacion,
          direccion: datosPersonales.direccion,
          descripcion: datosPersonales.descripcion,
          instagram_handle: datosPersonales.instagram,
          twitter_handle: datosPersonales.twitter,
          facebook_handle: datosPersonales.facebook,
          telefono: datosPersonales.telefono
        };
        
        await perfilService.updatePerfil(dataToUpdate);
        await cargarDatos(); // Recargar datos actualizados
        mostrarToast('Perfil actualizado correctamente');
        setModoEdicion(false);
      } catch (error) {
        console.error('Error actualizando perfil:', error);
        mostrarToast('Error al actualizar el perfil', false);
      } finally {
        setLoading(false);
      }
    } else {
      setModoEdicion(true);
    }
  };

  const agregarTarjeta = async (nuevaTarjeta) => {
    try {
      await perfilService.addMetodoPago({
        nombre_titular: nuevaTarjeta.nombre,
        numero_tarjeta: nuevaTarjeta.numero.replace(/\s/g, ''),
        fecha_expiracion: `20${nuevaTarjeta.exp.split('/')[1]}-${nuevaTarjeta.exp.split('/')[0]}-01`,
        cvc: nuevaTarjeta.cvc,
        es_principal: tarjetas.length === 0
      });
      
      await cargarDatos();
      setModalContenido('exito');
      mostrarToast('Tarjeta agregada correctamente');
    } catch (error) {
      console.error('Error agregando tarjeta:', error);
      mostrarToast('Error al agregar la tarjeta', false);
    }
  };

  const eliminarTarjeta = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarjeta?')) {
      try {
        await perfilService.deleteMetodoPago(id);
        setTarjetas(tarjetas.filter(t => t.id !== id));
        mostrarToast('Tarjeta eliminada correctamente');
      } catch (error) {
        console.error('Error eliminando tarjeta:', error);
        mostrarToast('Error al eliminar la tarjeta', false);
      }
    }
  };

  const cambiarEmail = async () => {
    const nuevoEmail = document.getElementById('nuevoEmail')?.value;
    const contrasena = document.getElementById('contrasenaActualEmail')?.value;
    
    if (!nuevoEmail || !contrasena) {
      mostrarToast('Por favor completa todos los campos', false);
      return;
    }
    
    try {
      await perfilService.cambiarEmail({ nuevo_email: nuevoEmail, contrasena_actual: contrasena });
      setUserEmail(nuevoEmail);
      mostrarExito();
      mostrarToast('Email actualizado correctamente');
    } catch (error) {
      console.error('Error cambiando email:', error);
      mostrarToast(error.response?.data?.message || 'Error al cambiar email', false);
    }
  };

  const cambiarPassword = async () => {
    const contrasenaActual = document.getElementById('contrasenaActual')?.value;
    const nuevaContrasena = document.getElementById('nuevaContrasena')?.value;
    const confirmarContrasena = document.getElementById('confirmarContrasena')?.value;
    
    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      mostrarToast('Por favor completa todos los campos', false);
      return;
    }
    
    if (nuevaContrasena !== confirmarContrasena) {
      mostrarToast('Las contraseñas nuevas no coinciden', false);
      return;
    }
    
    if (nuevaContrasena.length < 6) {
      mostrarToast('La contraseña debe tener al menos 6 caracteres', false);
      return;
    }
    
    try {
      await perfilService.cambiarPassword({ 
        contrasena_actual: contrasenaActual, 
        nueva_contrasena: nuevaContrasena 
      });
      mostrarExito();
      mostrarToast('Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      mostrarToast(error.response?.data?.message || 'Error al cambiar contraseña', false);
    }
  };

  if (loading && datosPersonales.nombreCompleto === '') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-white text-start animate__animated animate__fadeIn">
      <div className="mb-2">
        <h3 className="fw-bold color-1 mb-0">Configuración</h3>
        <p className="text-muted mb-0 color-2" style={{ fontSize: '18px' }}>Ajusta tus datos y preferencias de cuenta.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '25px', backgroundColor: '#fff', border: '1px solid #eee' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold d-flex align-items-center" style={{ color: '#555' }}>
                <i className="bi bi-person-circle me-3 fs-4"></i> Datos Personales
              </h5>
              <button 
                className={`btn ${modoEdicion ? 'btn-success' : 'btn-outline-secondary'} d-flex align-items-center gap-2 rounded-pill px-4 py-2`}
                onClick={toggleEdicion}
                disabled={loading}
                style={{ 
                  backgroundColor: modoEdicion ? brand.mediumBrown : 'transparent',
                  borderColor: modoEdicion ? brand.mediumBrown : brand.accentOrange,
                  color: modoEdicion ? 'white' : brand.darkBrown
                }}
              >
                <i className={`bi ${modoEdicion ? 'bi-check-lg' : 'bi-pencil'}`}></i>
                {modoEdicion ? 'Guardar Cambios' : 'Editar'}
              </button>
            </div>
            
            <div className="row g-3">
              <div className="col-12 text-start">
                <label className="fw-bold small text-uppercase mb-1" style={{ color: brand.darkBrown }}>Nombre Completo</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  name="nombreCompleto"
                  value={datosPersonales.nombreCompleto}
                  onChange={handleInputChange}
                  disabled={!modoEdicion}
                  style={{ backgroundColor: modoEdicion ? '#fff' : '#f8f9fa' }}
                />
              </div>
              <div className="col-12 text-start">
                <label className="fw-bold small text-uppercase mb-1" style={{ color: brand.darkBrown }}>Interés</label>
                <select 
                  className="form-select bg-light border-0 py-2" 
                  name="interes"
                  value={datosPersonales.interes}
                  onChange={handleInputChange}
                  disabled={!modoEdicion}
                  style={{ backgroundColor: modoEdicion ? '#fff' : '#f8f9fa' }}
                >
                  <option>Coleccionista de arte</option>
                  <option>Artista</option>
                  <option>Galería</option>
                  <option>Inversionista</option>
                </select>
              </div>
              <div className="col-md-6 text-start">
                <label className="fw-bold small text-uppercase mb-1" style={{ color: brand.darkBrown }}>Ubicación</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  name="ubicacion"
                  value={datosPersonales.ubicacion}
                  onChange={handleInputChange}
                  disabled={!modoEdicion}
                  style={{ backgroundColor: modoEdicion ? '#fff' : '#f8f9fa' }}
                />
              </div>
              <div className="col-md-6 text-start">
                <label className="fw-bold small text-uppercase mb-1" style={{ color: brand.darkBrown }}>Dirección</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  name="direccion"
                  value={datosPersonales.direccion}
                  onChange={handleInputChange}
                  disabled={!modoEdicion}
                  style={{ backgroundColor: modoEdicion ? '#fff' : '#f8f9fa' }}
                />
              </div>
              <div className="col-12 text-start">
                <label className="fw-bold small text-uppercase mb-1" style={{ color: brand.darkBrown }}>Descripción</label>
                <textarea 
                  className="form-control bg-light border-0" 
                  rows="4"
                  name="descripcion"
                  value={datosPersonales.descripcion}
                  onChange={handleInputChange}
                  disabled={!modoEdicion}
                  style={{ backgroundColor: modoEdicion ? '#fff' : '#f8f9fa' }}
                />
              </div>
              
              {/* Redes Sociales - 3 columnas (Instagram, Twitter, Facebook) */}
              <div className="col-md-4 text-start">
                <label className="fw-bold small text-uppercase mb-1" style={{ color: brand.darkBrown }}>Instagram</label>
                <div className="input-group">
                  <span className="input-group-text border-0 bg-light"><i className="bi bi-instagram"></i></span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0" 
                    name="instagram"
                    value={datosPersonales.instagram}
                    onChange={handleInputChange}
                    disabled={!modoEdicion}
                    placeholder="@usuario"
                    style={{ backgroundColor: modoEdicion ? '#fff' : '#f8f9fa' }}
                  />
                </div>
              </div>
              
              <div className="col-md-4 text-start">
                <label className="fw-bold small text-uppercase mb-1" style={{ color: brand.darkBrown }}>Twitter / X</label>
                <div className="input-group">
                  <span className="input-group-text border-0 bg-light"><i className="bi bi-twitter-x"></i></span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0" 
                    name="twitter"
                    value={datosPersonales.twitter}
                    onChange={handleInputChange}
                    disabled={!modoEdicion}
                    placeholder="@usuario"
                    style={{ backgroundColor: modoEdicion ? '#fff' : '#f8f9fa' }}
                  />
                </div>
              </div>
              
              <div className="col-md-4 text-start">
                <label className="fw-bold small text-uppercase mb-1" style={{ color: brand.darkBrown }}>Facebook</label>
                <div className="input-group">
                  <span className="input-group-text border-0 bg-light"><i className="bi bi-facebook"></i></span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0" 
                    name="facebook"
                    value={datosPersonales.facebook}
                    onChange={handleInputChange}
                    disabled={!modoEdicion}
                    placeholder="nombre_usuario"
                    style={{ backgroundColor: modoEdicion ? '#fff' : '#f8f9fa' }}
                  />
                </div>
              </div>
              
              <div className="col-12 text-start">
                <label className="fw-bold small text-uppercase mb-1" style={{ color: brand.darkBrown }}>Número Telefónico</label>
                <div className="input-group">
                  <span className="input-group-text border-0 bg-light"><i className="bi bi-flag"></i> +52</span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0" 
                    name="telefono"
                    value={datosPersonales.telefono}
                    onChange={handleInputChange}
                    disabled={!modoEdicion}
                    placeholder="9991234567"
                    style={{ backgroundColor: modoEdicion ? '#fff' : '#f8f9fa' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '25px' }}>
            <h5 className="fw-bold mb-4 d-flex align-items-center" style={{ color: '#555' }}>
              <i className="bi bi-credit-card-2-back me-3 fs-4"></i> Método de Pago
            </h5>
            {tarjetas.length > 0 ? (
              tarjetas.map(tarjeta => (
                <div key={tarjeta.id} className="border rounded-3 p-3 d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-credit-card fs-3"></i>
                    <div>
                      <div className="fw-bold">{tarjeta.numero}</div>
                      <small className="text-muted">EXP: {tarjeta.exp}</small>
                      {tarjeta.es_principal && (
                        <span className="badge bg-success ms-2" style={{ fontSize: '8px' }}>Principal</span>
                      )}
                    </div>
                  </div>
                  <i 
                    className="bi bi-trash cursor-pointer text-danger" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => eliminarTarjeta(tarjeta.id)}
                  ></i>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-3">No hay tarjetas guardadas</p>
            )}

            <button 
              className="btn-2"
              data-bs-toggle="modal" 
              data-bs-target="#modalGeneral" 
              onClick={() => setModalContenido('add_card')}
            >
              <i className="bi bi-plus-lg me-2"></i> Añadir Tarjeta
            </button>
          </div>

          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '25px' }}>
            <h5 className="fw-bold mb-4 d-flex align-items-center" style={{ color: '#555' }}>
              <i className="bi bi-shield-check me-3 fs-4"></i> Seguridad
            </h5>
            <div className="d-grid gap-2">
              <button 
                className="btn btn-outline-secondary d-flex justify-content-between align-items-center p-3 rounded-3 border-light-subtle"
                data-bs-toggle="modal" data-bs-target="#modalGeneral" onClick={() => iniciarFlujoSeguridad('cambiar_email')}
              >
                <span className="fw-bold text-dark">Cambiar Email</span>
                <i className="bi bi-chevron-right"></i>
              </button>
              <button 
                className="btn btn-outline-secondary d-flex justify-content-between align-items-center p-3 rounded-3 border-light-subtle"
                data-bs-toggle="modal" data-bs-target="#modalGeneral" onClick={() => iniciarFlujoSeguridad('cambiar_pass')}
              >
                <span className="fw-bold text-dark">Cambiar Contraseña</span>
                <i className="bi bi-chevron-right"></i>
              </button>
              <button 
                className="btn btn-link text-decoration-none text-start p-0 mt-2 fw-bold small" 
                style={{ color: brand.mediumBrown }}
                data-bs-toggle="modal" data-bs-target="#modalGeneral" onClick={() => setModalContenido('restablecer_pass')}
              >
                ¿Olvidaste tu contraseña? Restablecer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL - (se mantiene igual) */}
      <div className="modal fade" id="modalGeneral" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
            <div className="p-4 text-center text-white shadow-sm" style={{ background: brand.gradient }}>
              <h5 className="fw-bold mb-0">
                {modalContenido === 'seguridad_inicio' && "Primero, tenemos que asegurarnos de que seas tú"}
                {modalContenido === 'verificar_code' && "Confirmación de información"}
                {modalContenido === 'add_card' && "Agregar un método de pago"}
                {modalContenido === 'cambiar_email' && "Actualizar Correo Electrónico"}
                {modalContenido === 'cambiar_pass' && "Establecer Nueva Contraseña"}
                {modalContenido === 'restablecer_pass' && "Restablecer Acceso"}
                {modalContenido === 'exito' && "Confirmación exitosa"}
              </h5>
            </div>

            <div className="modal-body p-4 text-start">
              {/* Contenido del modal (se mantiene igual) */}
              {modalContenido === 'seguridad_inicio' && (
                <div className="animate__animated animate__fadeIn">
                  <p className="small text-muted mb-4">Antes de hacer cambios, solo necesitamos una confirmación rápida.</p>
                  <div className="d-grid gap-3">
                    <div className="p-3 border rounded-3 d-flex align-items-center gap-3 cursor-pointer hover-bg" onClick={() => setModalContenido(proximaAccion)}>
                      <i className="bi bi-envelope fs-4 text-secondary"></i>
                      <div><small className="d-block fw-bold">Enviar código por email</small><small className="text-muted">{userEmail}</small></div>
                    </div>
                    <div className="p-3 border rounded-3 d-flex align-items-center gap-3 cursor-pointer hover-bg">
                      <i className="bi bi-phone fs-4 text-secondary"></i>
                      <div><small className="d-block fw-bold">Enviar código por número de teléfono</small><small className="text-muted">{datosPersonales.telefono ? `+52 ${datosPersonales.telefono}` : 'No disponible'}</small></div>
                    </div>
                  </div>
                </div>
              )}

              {modalContenido === 'verificar_code' && (
                <div className="text-center animate__animated animate__fadeIn">
                  <p className="small text-muted mb-4">Ingresa código de seguridad (6 Dígitos).</p>
                  <div className="d-flex justify-content-center gap-2 mb-4">
                    {[1,2,3,4,5,6].map(i => <input key={i} type="text" className="form-control text-center fw-bold" style={{ width: '45px', height: '55px', fontSize: '1.5rem', borderRadius: '10px' }} maxLength="1" />)}
                  </div>
                  <button className="btn btn-lg text-white w-100 rounded-pill" style={{ backgroundColor: brand.mediumBrown }} onClick={() => setModalContenido(proximaAccion)}>Verificar Código</button>
                </div>
              )}

              {modalContenido === 'add_card' && (
                <div className="animate__animated animate__fadeIn">
                  <div className="mb-3">
                    <label className="fw-bold small mb-1">Nombre*</label>
                    <input type="text" className="form-control" placeholder="Nombre en la tarjeta" id="cardName" />
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold small mb-1">Número de tarjeta*</label>
                    <input type="text" className="form-control" placeholder="0000 0000 0000 0000" id="cardNumber" maxLength="19" />
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="fw-bold small mb-1">Fecha de Vencimiento*</label>
                      <input type="text" className="form-control" placeholder="MM / AA" id="cardExp" maxLength="5" />
                    </div>
                    <div className="col-6">
                      <label className="fw-bold small mb-1">CVC*</label>
                      <input type="text" className="form-control" placeholder="123" id="cardCvc" maxLength="3" />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-light border flex-grow-1 rounded-pill" data-bs-dismiss="modal">Cancelar</button>
                    <button 
                      className="btn text-white flex-grow-1 rounded-pill" 
                      style={{ backgroundColor: brand.darkBrown }} 
                      onClick={() => {
                        const nuevaTarjeta = {
                          numero: document.getElementById('cardNumber').value,
                          exp: document.getElementById('cardExp').value,
                          nombre: document.getElementById('cardName').value,
                          cvc: document.getElementById('cardCvc').value
                        };
                        agregarTarjeta(nuevaTarjeta);
                      }}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              {modalContenido === 'cambiar_email' && (
                <div className="animate__animated animate__fadeIn">
                  <div className="mb-3">
                    <label className="fw-bold small mb-1">Nuevo Correo Electrónico</label>
                    <input type="email" className="form-control py-2" id="nuevoEmail" placeholder="nuevo@correo.com" />
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold small mb-1">Confirmar Contraseña Actual</label>
                    <input type="password" className="form-control py-2" id="contrasenaActualEmail" />
                  </div>
                  <button className="btn btn-dark w-100 rounded-pill py-2 mt-3" style={{ backgroundColor: brand.darkBrown }} onClick={cambiarEmail}>Actualizar Correo</button>
                </div>
              )}

              {modalContenido === 'cambiar_pass' && (
                <div className="animate__animated animate__fadeIn">
                  <div className="mb-3">
                    <label className="fw-bold small mb-1">Contraseña Actual</label>
                    <input type="password" className="form-control py-2" id="contrasenaActual" />
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold small mb-1">Nueva Contraseña</label>
                    <input type="password" className="form-control py-2" id="nuevaContrasena" placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold small mb-1">Confirmar Nueva Contraseña</label>
                    <input type="password" className="form-control py-2" id="confirmarContrasena" />
                  </div>
                  <button className="btn btn-dark w-100 rounded-pill py-2 mt-3" style={{ backgroundColor: brand.darkBrown }} onClick={cambiarPassword}>Guardar Nueva Contraseña</button>
                </div>
              )}
              
              {modalContenido === 'restablecer_pass' && (
                <div className="animate__animated animate__fadeIn text-center">
                  <i className="bi bi-shield-lock display-4 mb-3" style={{ color: brand.mediumBrown }}></i>
                  <p className="small text-muted mb-4">Ingresa tu correo y te enviaremos un código para restablecer tu cuenta.</p>
                  <input type="email" className="form-control py-2 mb-3" placeholder="Tu correo electrónico" />
                  <button className="btn btn-dark w-100 rounded-pill py-2" style={{ backgroundColor: brand.darkBrown }} onClick={() => setModalContenido('verificar_code')}>Enviar Código</button>
                  <button className="btn btn-link btn-sm mt-2 text-muted" onClick={() => setModalContenido('seguridad_inicio')}>Volver</button>
                </div>
              )}

              {modalContenido === 'exito' && (
                <div className="text-center p-3 animate__animated animate__zoomIn">
                   <div className="bg-success-subtle text-success p-3 rounded-pill d-inline-flex mb-3"><i className="bi bi-check-lg fs-2"></i></div>
                   <h4 className="fw-bold">Confirmación exitosa</h4>
                   <p className="text-muted">Tus cambios han sido aplicados correctamente.</p>
                   <button className="btn btn-dark w-100 rounded-pill mt-3" data-bs-dismiss="modal" style={{ backgroundColor: brand.darkBrown }}>Cerrar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toastVisible && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-white border-0" style={{ backgroundColor: brand.darkBrown, borderRadius: '12px' }}>
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success"></i> {toastMessage}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToastVisible(false)}></button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-bg:hover { background-color: #f8f9fa; transition: 0.2s; border-color: ${brand.accentOrange} !important; }
        .form-control:focus { border-color: ${brand.mediumBrown}; box-shadow: 0 0 0 0.2rem rgba(141, 73, 37, 0.1); }
        .cursor-pointer { cursor: pointer; }
        input:disabled, select:disabled, textarea:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
    // ============== OPERACIONES (TRANSACCIONES) ==============

  // Obtener todas las transacciones (subastas, artículos, peticiones)
  router.get('/transacciones', authMiddleware, isAdmin, async (req, res) => {
      const { tipo } = req.query;
      
      try {
          let transacciones = [];
          
          // 1. Transacciones de Subastas
          if (!tipo || tipo === 'Subastas') {
              const [subastas] = await pool.query(`
                  SELECT 
                      CONCAT('SUB-', s.id) as id,
                      s.titulo,
                      'SUBASTA' as tipo,
                      COALESCE(u_comprador.nombre_completo, 'N/A') as comprador,
                      COALESCE(u_vendedor.nombre_completo, 'N/A') as vendedor,
                      CONCAT('$', FORMAT(COALESCE(s.puja_actual_mxn, 0), 0)) as monto,
                      DATE_FORMAT(s.fecha_fin, '%d/%m/%Y') as fecha
                  FROM subastas s
                  LEFT JOIN usuarios u_comprador ON s.ganador_id = u_comprador.id
                  LEFT JOIN usuarios u_vendedor ON s.vendedor_id = u_vendedor.id
                  WHERE s.ganador_id IS NOT NULL
                  ORDER BY s.fecha_fin DESC
                  LIMIT 50
              `);
              transacciones.push(...subastas);
          }
          
          // 2. Transacciones de Artículos
          if (!tipo || tipo === 'Articulos') {
              const [articulos] = await pool.query(`
                  SELECT 
                      CONCAT('ART-', a.id) as id,
                      a.titulo,
                      'ARTICULO' as tipo,
                      COALESCE(u_comprador.nombre_completo, 'N/A') as comprador,
                      COALESCE(u_vendedor.nombre_completo, 'N/A') as vendedor,
                      CONCAT('$', FORMAT(COALESCE(a.precio_mxn, 0), 0)) as monto,
                      DATE_FORMAT(a.fecha_publicacion, '%d/%m/%Y') as fecha
                  FROM articulos a
                  LEFT JOIN usuarios u_comprador ON a.comprador_id = u_comprador.id
                  LEFT JOIN usuarios u_vendedor ON a.vendedor_id = u_vendedor.id
                  WHERE a.comprador_id IS NOT NULL
                  ORDER BY a.fecha_publicacion DESC
                  LIMIT 50
              `);
              transacciones.push(...articulos);
          }
          
          // 3. Transacciones de Peticiones (Encargos)
          if (!tipo || tipo === 'Encargos') {
              const [peticiones] = await pool.query(`
                  SELECT 
                      CONCAT('PET-', p.id) as id,
                      p.titulo,
                      'ENCARGO' as tipo,
                      COALESCE(u_comprador.nombre_completo, 'N/A') as comprador,
                      COALESCE(u_vendedor.nombre_completo, 'N/A') as vendedor,
                      CONCAT('$', FORMAT(COALESCE(p.presupuesto_max_mxn, 0), 0)) as monto,
                      DATE_FORMAT(p.fecha_publicacion, '%d/%m/%Y') as fecha
                  FROM peticiones p
                  LEFT JOIN usuarios u_comprador ON p.creador_id = u_comprador.id
                  LEFT JOIN usuarios u_vendedor ON p.artista_asignado_id = u_vendedor.id
                  WHERE p.artista_asignado_id IS NOT NULL
                  ORDER BY p.fecha_publicacion DESC
                  LIMIT 50
              `);
              transacciones.push(...peticiones);
          }
          
          res.json(transacciones);
      } catch (error) {
          console.error('Error obteniendo transacciones:', error);
          res.status(500).json({ message: 'Error en el servidor' });
      }
  });

  // Obtener transacciones por tipo específico
  router.get('/transacciones/:tipo', authMiddleware, isAdmin, async (req, res) => {
      const { tipo } = req.params;
      const tiposPermitidos = ['Subastas', 'Articulos', 'Encargos'];
      
      if (!tiposPermitidos.includes(tipo)) {
          return res.status(400).json({ message: 'Tipo no válido' });
      }
      
      res.redirect(`/admin/transacciones?tipo=${tipo}`);
  });

  // Obtener depósitos y garantías
  router.get('/depositos-garantias', authMiddleware, isAdmin, async (req, res) => {
      try {
          // Obtener depósitos de tickets
          const [depositosTickets] = await pool.query(`
              SELECT 
                  tt.id,
                  u.nombre_completo as usuario,
                  tt.tickets as cantidad,
                  DATE_FORMAT(tt.fecha, '%d/%m/%Y') as fecha,
                  'Depósito Tickets' as tipo
              FROM transacciones_tickets tt
              JOIN usuarios u ON tt.usuario_id = u.id
              WHERE tt.tipo = 'compra'
              ORDER BY tt.fecha DESC
              LIMIT 20
          `);
          
          // Obtener garantías (transacciones financieras)
          const [garantias] = await pool.query(`
              SELECT 
                  tf.id,
                  u.nombre_completo as usuario,
                  CONCAT('$', FORMAT(COALESCE(tf.monto_mxn, 0), 0)) as monto,
                  tf.tipo,
                  tf.estado,
                  DATE_FORMAT(tf.fecha, '%d/%m/%Y') as fecha
              FROM transacciones_financieras tf
              JOIN usuarios u ON tf.usuario_id = u.id
              ORDER BY tf.fecha DESC
              LIMIT 20
          `);
          
          res.json({
              depositos: depositosTickets,
              garantias: garantias
          });
      } catch (error) {
          console.error('Error obteniendo depósitos y garantías:', error);
          res.status(500).json({ message: 'Error en el servidor' });
      }
  });
};

export default Configuracion;