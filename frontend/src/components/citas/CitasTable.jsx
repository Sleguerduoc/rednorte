import PropTypes from "prop-types";
import { fechaDesdeSolicitud, formatearFecha } from "../../utils/date";
import { normalizar } from "../../utils/text";
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
              <tr className="rn-empty-row">
                <td colSpan="6">No hay citas para mostrar.</td>
              </tr>
            ) : (
              citasFiltradas.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td className="rn-td-id">#{solicitud.id}</td>
                  <td>
                    <div className="rn-td-name">
                      {solicitud.paciente?.nombre || `Paciente ${solicitud.pacienteId}`}
                    </div>
                    <div className="rn-td-sub">{solicitud.paciente?.rut || "Sin RUT"}</div>
                  </td>
                  <td>{solicitud.especialidad}</td>
                  <td className="rn-td-id">{formatearFecha(fechaDesdeSolicitud(solicitud))}</td>
                  <td>
                    <span className={`rn-badge rn-badge--${normalizar(solicitud.prioridad)}`}>
                      {solicitud.prioridad}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="rn-btn rn-btn--danger"
                      disabled={cancelandoCitaId === solicitud.id}
                      onClick={() => cancelarCita(solicitud)}
                    >
                      {cancelandoCitaId === solicitud.id ? "Cancelando…" : "Cancelar"}
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
