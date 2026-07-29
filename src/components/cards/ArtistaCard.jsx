// frontend/src/components/cards/ArtistaCard.jsx
import { Link } from "react-router-dom";

// Función para formatear a 1 decimal
const formatearCalificacion = (valor) => {
    if (valor === undefined || valor === null || isNaN(valor)) return '0.0';
    return Number(valor).toFixed(1);
};

function ArtistaCard({ id, nombre_completo, interes, calificacion_promedio, foto_perfil_url }) {
    return(
    <>
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xxl-2">
            <div className="card border-0 shadow-sm rounded-3 p-2 w-100">
                <Link
                    to={`/profile/public/${id}`}
                    className="text-decoration-none w-100"
                >
                    <div className="card-body d-flex align-items-center gap-3 p-2 w-100">
                        {/* Foto de perfil - CÍRCULO FIJO */}
                        <div className="d-flex justify-content-center align-items-center rounded-circle overflow-hidden flex-shrink-0"
                            style={{
                                width: "70px",
                                height: "70px",
                                backgroundColor: "#f3e1c7"
                            }}>
                            {foto_perfil_url ? (
                                <img 
                                    src={foto_perfil_url} 
                                    alt={`Foto de ${nombre_completo}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <i className="bi bi-person fs-2 color-1"></i>
                            )}
                        </div>
                        
                        {/* Información del artista - se ajusta al ancho */}
                        <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0, width: '100%' }}>
                            <h6 className="mb-0 fw-bold color-2" style={{ 
                                fontSize: '0.9rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '100%'
                            }}>
                                {nombre_completo}
                            </h6>

                            <small className="color-2" style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '100%',
                                fontSize: '0.75rem'
                            }}>
                                {interes}
                            </small>

                            <div className="d-flex align-items-center gap-1 mt-1 flex-shrink-0">
                                <div
                                    className="d-flex justify-content-center align-items-center rounded-circle bg-color-4 flex-shrink-0"
                                    style={{
                                        width: "24px",
                                        height: "24px"
                                    }}>
                                    <i className="bi bi-star-fill text-white" style={{ fontSize: '10px' }}></i>
                                </div>
                                <small className="fw-semibold color-2" style={{ 
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.7rem'
                                }}>
                                    {formatearCalificacion(calificacion_promedio)} / 5.0
                                </small>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    </>
    )
}

export default ArtistaCard;