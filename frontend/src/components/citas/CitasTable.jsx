import PropTypes from "prop-types";
import { fechaDesdeSolicitud, formatearFecha } from "../../utils/date";
import { nombreCompleto, normalizar } from "../../utils/text";
import ListHeader from "../common/ListHeader";

function CitasTable({ cancelarCita, cancelandoCitaId, citasFiltradas }) {
  return (
    <div>
      <ListHeader count={citasFiltradas.length} label="Citas disponibles" />
      <div className="rn-table-wrap">
        <table className="rn-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Paciente</th>
              <th>Especialidad</th>
              <th>Fecha</th>
              <th>Prioridad</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {citasFiltradas.length === 0 ? (
              <tr className="rn-empty-row"><td colSpan="6">No hay citas para mostrar.</td></tr>
            ) : (
              citasFiltradas.map((s) => (
                <tr key={s.id}>
                  <td className="rn-td-id">#{s.id}</td>
                  <td>
                    <div className="rn-td-name">{s.pacienteNombre || nombreCompleto(s.paciente) || `Paciente ${s.pacienteId}`}</div>
                    <div className="rn-td-sub">{s.pacienteRut || s.paciente?.rut || "Sin RUT"}</div>
                  </td>
                  <td>{s.especialidad}</td>
                  <td className="rn-td-id">{formatearFecha(fechaDesdeSolicitud(s))}</td>
                  <td>
                    <span className={`rn-badge rn-badge--${normalizar(s.prioridad)}`}>{s.prioridad}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="rn-btn rn-btn--danger"
                      disabled={cancelandoCitaId === s.id}
                      onClick={() => cancelarCita(s)}
                    >
                      {cancelandoCitaId === s.id ? "Cancelando…" : "Cancelar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

CitasTable.propTypes = {
  cancelarCita:     PropTypes.func.isRequired,
  cancelandoCitaId: PropTypes.number,
  citasFiltradas:   PropTypes.array.isRequired,
};

export default CitasTable;