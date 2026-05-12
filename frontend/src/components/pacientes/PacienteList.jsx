import PropTypes from "prop-types";
import { useState } from "react";
import { inicialesPaciente, nombreCompleto } from "../../utils/text";
import ListHeader from "../common/ListHeader";

function PacienteList({ eliminarPaciente, pacientesFiltrados, prepararSolicitudDesdePaciente }) {
  const [confirmandoId, setConfirmandoId] = useState(null);

  const iniciarConfirmacion = (id) => {
    setConfirmandoId(id);
    globalThis.setTimeout(() => setConfirmandoId(null), 3000);
  };

  const handleEliminar = (paciente) => {
    if (confirmandoId === paciente.id) {
      setConfirmandoId(null);
      eliminarPaciente(paciente.id);
    } else {
      iniciarConfirmacion(paciente.id);
    }
  };

  return (
    <div>
      <ListHeader count={pacientesFiltrados.length} label="Pacientes encontrados" />
      <div className="rn-pat-list">
        {pacientesFiltrados.length === 0 ? (
          <div className="rn-empty">No hay pacientes que coincidan con la búsqueda.</div>
        ) : (
          pacientesFiltrados.map((paciente) => {
            const confirmando = confirmandoId === paciente.id;
            return (
              <div className="rn-pat-item" key={paciente.id}>
                <div className="rn-pat-item__av">{inicialesPaciente(paciente)}</div>
                <div className="rn-pat-item__info">
                  <div className="rn-pat-item__name">{nombreCompleto(paciente)}</div>
                  <div className="rn-pat-item__meta">
                    <span>{paciente.rut}</span>
                    <span>{paciente.email}</span>
                    <span>{paciente.telefono}</span>
                  </div>
                </div>
                <div className="rn-pat-item__actions">
                  <button
                    type="button"
                    className="rn-btn rn-btn--secondary"
                    onClick={() => prepararSolicitudDesdePaciente(paciente)}
                  >
                    Nueva solicitud
                  </button>
                  <button
                    type="button"
                    className={`rn-btn ${confirmando ? "rn-btn--danger rn-btn--confirming" : "rn-btn--ghost-danger"}`}
                    onClick={() => handleEliminar(paciente)}
                    title={confirmando ? "Haz clic nuevamente para confirmar" : "Eliminar paciente"}
                  >
                    {confirmando ? "¿Eliminar?" : "✕"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

PacienteList.propTypes = {
  eliminarPaciente:               PropTypes.func.isRequired,
  pacientesFiltrados:             PropTypes.array.isRequired,
  prepararSolicitudDesdePaciente: PropTypes.func.isRequired,
};

export default PacienteList;
