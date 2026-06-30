import { Link, useParams } from "react-router-dom";

function ArtistaCard({ id, nombre_completo, interes, calificacion_promedio }) {
    return(
    <>
        <div className="col-12 col-md-4 col-lg-4 col-xxl-2">
            <div className="card border-0 shadow-sm h-100 rounded-3 p-auto">
                <Link
                    to={`/profile/public/${id}`}
                    className="text-decoration-none"
                >
                    <div className="card-body d-flex align-items-center gap-3 p-3">
                        <div className="d-flex justify-content-center align-items-center rounded-3"
                            style={{
                                width: "70px",
                                height: "70px",
                                backgroundColor: "#f3e1c7"
                            }}>
                            <i className="bi bi-person fs-3 color-1"></i>
                        </div>
                        <div>
                            
                            <h6 className="mb-0 fw-bold color-2">
                                {nombre_completo}
                            </h6>
                            

                            <small className="color-2">
                                {interes}
                            </small>

                            <div className="d-flex align-items-center gap-1 mt-1">
                                <div
                                    className="d-flex justify-content-center align-items-center rounded-circle me-2 bg-color-4"
                                    style={{
                                    width: "30px",
                                    height: "30px"
                                    }}>
                                    <i className="bi bi-star-fill text-white"></i>
                                </div>
                                <small className="fw-semibold color-2"> {calificacion_promedio} / 5.0</small>
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