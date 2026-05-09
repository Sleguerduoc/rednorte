import { fechaDesdeSolicitud, formatearFecha } from "../../utils/date";
import { normalizar } from "../../utils/text";

function CitasTable({ cancelarCita, cancelandoCitaId, citasFiltradas }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Cita</th>
            <th>Paciente</th>
            <th>Especialidad</th>
            <th>Fecha</th>
            <th>Prioridad</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          {citasFiltradas.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty">No hay citas para mostrar.</td>
            </tr>
          ) : (
            citasFiltradas.map((solicitud) => (
              <tr key={solicitud.id}>
                <td>#{solicitud.id}</td>
                <td>
                  <strong>{solicitud.paciente?.nombre || `Paciente ${solicitud.pacienteId}`}</strong>
                  <span className="muted">{solicitud.paciente?.rut || "Sin RUT"}</span>
                </td>
                <td>{solicitud.especialidad}</td>
                <td>{formatearFecha(fechaDesdeSolicitud(solicitud))}</td>
                <td>
                  <span className={`priority priority-${normalizar(solicitud.prioridad)}`}>
                    {solicitud.prioridad}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="danger compact"
                    disabled={cancelandoCitaId === solicitud.id}
                    onClick={() => cancelarCita(solicitud)}
                  >
                    {cancelandoCitaId === solicitud.id ? "Cancelando..." : "Cancelar cita"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CitasTable;
