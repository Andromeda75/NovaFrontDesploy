import { useState } from "react";
import { Button } from "react-bootstrap";

function RatingModal({ nombreUsuario, showModal, setShowModal, onSubmit }) {

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = () => {

    if(rating === 0) return;

    onSubmit(rating, review);

    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 1040
        }}
        onClick={() => setShowModal(false)}
      ></div>

      {/* MODAL */}
      <div className="modal d-block" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content border-0 shadow-lg"
            style={{ borderRadius: "20px", overflow: "hidden" }}
          >

            {/* HEADER */}
            <div
              className="p-4 text-white"
              style={{ background: "linear-gradient(to right, #2a140a, #8d4925)" }}
            >
              <h3 className="fw-bold mb-1">Calificar Usuario</h3>
              <p className="mb-0 small opacity-75">
                Comparte tu experiencia con este coleccionista.
              </p>
            </div>

            {/* BODY */}
            <div className="modal-body p-4 bg-light text-center">

              <h4 className="fw-bold mb-3">{nombreUsuario}</h4>

              {/* ESTRELLAS */}
              <div className="mb-4">

                {[1,2,3,4,5].map((star) => (

                  
                  <i
                    key={star}
                    className={`bi ${
                      star <= (hover || rating)
                        ? "bi-star-fill"
                        : "bi-star"
                    }`}
                    style={{
                      fontSize: "35px",
                      cursor: "pointer",
                      color: "#f5b301",
                      margin: "5px"
                    }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  ></i>
                ))}

              </div>

              {/* TEXTO */}
              <div className="mb-4 text-start">
                <label className="fw-bold small color-2">
                  Escribe tu reseña
                </label>

                <textarea
                  className="form-control rounded-3 border-2"
                  rows="3"
                  placeholder="Cuéntanos cómo fue tu experiencia..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>

              {/* BOTONES */}
              <div className="d-flex justify-content-between">

                <Button
                  className="btn-linear-gradient"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>

                <Button
                  className="btn-linear-gradient"
                  onClick={handleSubmit}
                >
                  Enviar Calificación
                </Button>

              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default RatingModal;
