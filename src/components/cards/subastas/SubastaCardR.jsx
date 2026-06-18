import React from 'react';

function SubastaCard({
  id, 
  titulo,
  categoria,
  precio,
  pujaMinima,
  estadoPrincipal,   
  subEstado,         
  pujas,
  tiempo,
  img1,
  // eslint-disable-next-line no-unused-vars
  img2,
  // eslint-disable-next-line no-unused-vars
  img3,
  // eslint-disable-next-line no-unused-vars
  video,
  onEditar,
  onEliminar,
  puedeEditar = false,
  onVerDetalle
}) {

  const getSubEstadoStyles = (subEstado) => {
    switch (subEstado) {
      case "APROBADO":
        return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-check-circle-fill"};
      case "EN REVISIÓN":
        return { bg: "#fffffff5", color: "#e65100", border: "#e65100", icon: "bi-clock-history"};
      case "RECHAZADO":
        return { bg: "#fffffff5", color: "#b02a37", border: "#b02a37", icon: "bi-x-circle-fill" };
      case "VENDIDO":
        return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-cart-check-fill" };
      default:
        return { bg: "#fffffff5", color: "#495057", border: "#495057" };
    }
  };

  const subEstadoStyle = getSubEstadoStyles(subEstado);

  // Determinar si los botones de acción deben mostrarse
  const showActionButtons = subEstado !== "APROBADO" && subEstado !== "VENDIDO";

  // Función para manejar el click en editar
  const handleEditarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEditar?.(id);
  };

  // Función para manejar el click en eliminar
  const handleEliminarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEliminar?.(id);
  };

  // Función para manejar el click en la card
  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    if (onVerDetalle) {
      onVerDetalle();
    }
  };

  return (
    <div 
      className="card border-0 shadow-sm rounded-4 overflow-hidden h-100" 
      onClick={handleCardClick} 
      style={{ cursor: 'pointer' }}
    >
      <div 
        className="position-relative bg-secondary bg-opacity-10" 
        style={{ 
          height: '180px', 
          backgroundImage: `url(${img1})`, // Usamos img1 como imagen principal de la card
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="position-relative p-3">
          <div className="d-flex justify-content-between align-items-center w-100">
            {/* Estado Principal */}
            <span className="px-3 py-1 fw-bold text-uppercase" style={{
              backgroundColor: "#6c757d",
              color: "white", 
              borderRadius: "8px", 
              fontSize: "12px"
            }}>
              <i className="bi bi-circle-fill me-1" style={{fontSize: '8px'}}></i> {estadoPrincipal}
            </span>

            {/* Botones de acción */}
            {(showActionButtons || true) && (
              <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                {puedeEditar && onEditar && (
                  <button 
                    className="btn btn-sm rounded-circle text-white shadow" 
                    style={{ 
                      backgroundColor: '#009575', 
                      width: '32px', 
                      height: '32px', 
                      padding: '0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: 'none'
                    }} 
                    onClick={handleEditarClick}
                    type="button"
                    title="Editar subasta">
                    <i className="bi bi-pencil" style={{ fontSize: '14px' }}></i>
                  </button>
                )}
                <button 
                  className="btn btn-sm rounded-circle text-white shadow" 
                  style={{ 
                    backgroundColor: "#C50003", 
                    width: '32px', 
                    height: '32px', 
                    padding: '0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: 'none'
                  }} 
                  onClick={handleEliminarClick}
                  type="button"
                  title="Eliminar subasta">
                  <i className="bi bi-trash" style={{ fontSize: '14px' }}></i>
                </button>
              </div>
            )}
          </div>

          {/* Sub Estado */}
          <div className="mt-2">
            <span className="px-3 py-1 fw-bold text-uppercase" style={{
              backgroundColor: subEstadoStyle.bg, 
              color: subEstadoStyle.color, 
              border: `2px solid ${subEstadoStyle.border}`, 
              borderRadius: "50px", 
              fontSize: "10px"
            }}>
              <i className={`bi ${subEstadoStyle.icon} me-1`}></i> {subEstado}
            </span>
          </div>
        </div>

        {estadoPrincipal === "ACTIVA" && tiempo && (
          <div className="position-absolute bottom-0 end-0 m-3 px-3 py-2 d-flex align-items-center gap-2" style={{
            background: "rgb(99, 44, 0)", 
            color: "white", 
            borderRadius: "50px", 
            fontSize: "13px"
          }}>
            <i className="bi bi-clock"></i>{tiempo}
            <span style={{ fontWeight: "normal" }}>Restante</span>
          </div>
        )}
      </div>
      
      <div className="card-body text-start p-3">
        <div className="d-flex justify-content-between align-items-center">
          <small className="fw-bold color-3" style={{fontSize:'12px'}}>{categoria}</small>
          <small className="d-flex align-items-center text-muted gap-1" style={{fontSize:'12px'}}>
            <i className="bi bi-people me-1"></i>{pujas} pujas
          </small>
        </div>
        <h5 className="fw-bold mt-2 color-1"style={{fontSize:'18px'}}>{titulo}</h5>
        <div className="mt-3 border-top pt-2 row g-0">
          <div className="col-6">
            <small className="text-muted d-block" style={{fontSize:'10px'}}>PUJA ACTUAL</small>
            <span className="fw-bold color-2" style={{fontSize:'12px'}}>${precio} MXN</span>
          </div>
          <div className="col-6 text-end">
            <small className="text-muted d-block" style={{fontSize:'10px'}}>PUJA MÍNIMA</small>
            <span className="color-1 fw-bold" style={{fontSize:'14px'}}>${pujaMinima} MXN</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubastaCard;