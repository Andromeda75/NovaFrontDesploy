import React from 'react';

function CardArticulo({ 
  id,
  titulo, 
  categoria, 
  fecha, 
  precio, 
  estado, 
  imagen, 
  imagenes = [],
  descripcion,
  onEdit,
  onDelete,
  puedeEditar = false,
  brandColors = { mediumBrown: "#8d4925", darkBrown: "#4a2311" } 
}) { 

  const modalId = `modal-${titulo.replace(/\s+/g, '-').toLowerCase()}-${id}`;

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case "APROBADO":
        return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-check-circle-fill"};
      case "EN REVISION":
        return { bg: "#fffffff5", color: "#e65100", border: "#e65100", icon: "bi-clock-history"};
      case "RECHAZADO":
        return { bg: "#fffffff5", color: "#b02a37", border: "#b02a37", icon: "bi-x-circle-fill" };
      case "VENDIDO":
        return { bg: "#fffffff5", color: "#198754", border: "#198754", icon: "bi-cart-check-fill" };
      default:
        return { bg: "#fffffff5", color: "#495057", border: "#495057", icon: "bi-question-circle" };
    }
  };

  const estadoConfig = getEstadoConfig(estado);

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) {
      onEdit({ id, titulo, categoria, fecha, precio, estado, imagen, imagenes, descripcion });
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleCardClick = () => {
    const modalElement = document.getElementById(modalId);
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  };

  return (
    <>
      {/* CARD - Al hacer clic abre el modal de detalle */}
      <div 
        className="card border-0 shadow-sm rounded-4 overflow-hidden h-100" 
        style={{ cursor: 'pointer' }}
        onClick={handleCardClick}
      >
        <div 
          className="position-relative" 
          style={{ 
            height: '200px',
            backgroundImage: `url(${imagen})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#f0f0f0'
          }}
        >
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}></div>
          
          <span className="position-absolute m-3 px-3 py-1 fw-bold d-flex align-items-center gap-2" 
            style={{
              backgroundColor: estadoConfig.bg, 
              color: estadoConfig.color, 
              border: `2px solid ${estadoConfig.border}`,  
              borderRadius: "20px",
              fontSize: "11px",
              background: "rgba(255, 255, 255, 0.9)"
            }}
          >
            <i className={`bi ${estadoConfig.icon}`}></i> {estado}
          </span>

          {/* Botones de acción */}
          <div className="position-absolute top-0 end-0 m-3 d-flex gap-2" style={{ zIndex: 2 }}>
            {onEdit && puedeEditar && (
              <button 
                className="btn btn-sm rounded-circle text-white shadow d-flex align-items-center justify-content-center" 
                style={{ backgroundColor: '#009575', width: '32px', height: '32px', border: 'none' }} 
                onClick={handleEditClick}
              >
                <i className="bi bi-pencil"></i>
              </button>
            )}
            {onDelete && (
              <button 
                className="btn btn-sm rounded-circle text-white shadow d-flex align-items-center justify-content-center" 
                style={{ backgroundColor: "#C50003", width: '32px', height: '32px', border: 'none' }} 
                onClick={handleDeleteClick}
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          <small className="color-3 fw-bold d-block mb-1 text-uppercase" style={{ letterSpacing: '0.5px' }}>{categoria}</small>
          <h5 className="fw-bold color-1 mb-0">{titulo}</h5>
          <div className="row mt-4 pt-2 border-top">
            <div className="col-7">
              <small className="text-muted d-block" style={{ fontSize: '10px' }}>FECHA PUBLICACIÓN</small>
              <span className="fw-bold color-1" style={{ fontSize: '0.9rem' }}>{fecha}</span>
            </div>
            <div className="col-5 text-end">
              <small className="text-muted d-block" style={{ fontSize: '10px' }}>PRECIO</small>
              <span className="fw-bold color-2" style={{ fontSize: '0.9rem' }}> ${precio} MXN</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      <div className="modal fade" id={modalId} tabIndex="-1" aria-hidden="true" data-bs-backdrop="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
            <div className="bg-white p-4 p-lg-5">
              <button 
                type="button"
                className="btn p-0 mb-4 fw-bold border-0 bg-transparent d-flex align-items-center" 
                data-bs-dismiss="modal"
                style={{ color: brandColors.mediumBrown }}
              >
                <i className="bi bi-arrow-left me-2"></i> Volver
              </button>

              <div className="row g-4 text-start">
                <div className="col-lg-6">
                  <div 
                    className="rounded-4 shadow-sm mb-3" 
                    style={{ 
                      height: '350px', 
                      backgroundImage: `url(${imagen})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="row g-2">
                    {(imagenes.length > 0 ? imagenes : [imagen, imagen, imagen]).slice(0, 3).map((img, index) => (
                      <div className="col-4" key={index}>
                        <div 
                          className="rounded-3 shadow-sm border" 
                          style={{ 
                            height: '80px', 
                            backgroundImage: `url(${img})`, 
                            backgroundSize: 'cover', 
                            backgroundPosition: 'center' 
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="col-lg-6 d-flex flex-column"> 
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-light rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-bag fs-3 text-secondary"></i>
                    </div>
                    <div>
                      <h6 className="m-0 fw-bold color-2">Artículo</h6>
                      <span className="px-3 py-1 fw-bold text-uppercase me-2 d-inline-flex align-items-center gap-2" 
                        style={{
                          backgroundColor: estadoConfig.bg, 
                          color: estadoConfig.color, 
                          border: `2px solid ${estadoConfig.border}`,  
                          borderRadius: "20px",
                          fontSize: "11px"
                        }}
                      >
                        <i className={`bi ${estadoConfig.icon}`}></i> {estado}
                      </span>
                    </div>
                  </div>

                  <div className="mb-0">
                    <span className="fw-bold color-3 mb-1" style={{ fontSize: '12px' }}>{categoria}</span>
                    <h2 className="fw-bold color-1 mb-2" style={{ fontSize: '28px' }}>{titulo}</h2>
                  </div>
                  <small className="text-muted">Fecha de publicación: {fecha}</small>

                  <div className="bg-light p-3 rounded-4 my-3 d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block small fw-bold">PRECIO</small>
                      <h5 className="color-1 fw-bold m-0">${precio} MXN</h5>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="fw-bold color-1 mb-2">Descripción detallada</h6>
                    <p className="text-muted small lh-base">
                      {descripcion}
                    </p>
                  </div>

                  {/* Botón de editar dentro del modal de detalle */}
                  {onEdit && puedeEditar && (
                    <div className="d-flex gap-2 mt-3">
                      <button 
                        className="btn btn-sm py-2 px-4 rounded-pill text-white"
                        style={{ backgroundColor: '#009575' }}
                        onClick={(e) => {
                          e.preventDefault();
                          const modalDetalle = window.bootstrap.Modal.getInstance(document.getElementById(modalId));
                          modalDetalle?.hide();
                          setTimeout(() => {
                            onEdit({ id, titulo, categoria, fecha, precio, estado, imagen, imagenes, descripcion });
                          }, 300);
                        }}
                      >
                        <i className="bi bi-pencil me-2"></i> Editar artículo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CardArticulo;