import { formatearFecha } from "../../utils/date";
import { normalizar } from "../../utils/text";
import ListHeader from "../common/ListHeader";

function TablaSolicitudes({ solicitudes }) {
  return (
    <section className="list-section">
      <ListHeader count={solicitudes.length} label="Solicitudes activas" />
      <div className="table-wrap scroll-table">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Especialidad</th>
              <th>Prioridad</th>
              <th>Registro</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty">No hay solicitudes activas.</td>
              </tr>
            ) : (
              solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>
                    <strong>{solicitud.paciente?.nombre || `Paciente ${solicitud.pacienteId}`}</strong>
                    <span className="muted">{solicitud.paciente?.rut || "Sin RUT"}</span>
                  </td>
                  <td>{solicitud.especialidad}</td>
                  <td>
                    <span className={`priority priority-${normalizar(solicitud.prioridad)}`}>
                      {solicitud.prioridad}
                    </span>
                  </td>
                  <td>{formatearFecha(solicitud.fechaRegistro)}</td>
                  <td><span className="badge">{solicitud.estado}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TablaSolicitudes;
