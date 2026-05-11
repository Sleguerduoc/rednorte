import PropTypes from "prop-types";
import ListHeader from "../common/ListHeader";

function initials(nombre) {
  return String(nombre || "?")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function PacienteList({ pacientesFiltrados, prepararSolicitudDesdePaciente }) {
  return (
    <div>
      <ListHeader count={pacientesFiltrados.length} label="Pacientes encontrados" />
      <div className="rn-pat-list">
        {pacientesFiltrados.length === 0 ? (
          <div className="rn-empty">No hay pacientes que coincidan con la búsqueda.</div>
        ) : (
          pacientesFiltrados.map((paciente) => (
            <div className="rn-pat-item" key={paciente.id}>
              <div className="rn-pat-item__av">{initials(paciente.nombre)}</div>
              <div className="rn-pat-item__info">
                <div className="rn-pat-item__name">{paciente.nombre}</div>
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

PacienteList.propTypes = {
  pacientesFiltrados:           PropTypes.array.isRequired,
  prepararSolicitudDesdePaciente: PropTypes.func.isRequired,
};

export default PacienteList;
