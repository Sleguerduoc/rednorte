import PropTypes from "prop-types";
import { formatearFecha } from "../../utils/date";
import { normalizar } from "../../utils/text";
import ListHeader from "../common/ListHeader";

function TablaSolicitudes({ solicitudes }) {
  return (
    <div>
      <ListHeader count={solicitudes.length} label="Solicitudes activas" />
      <div className="rn-table-wrap">
        <table className="rn-table">
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
              <tr className="rn-empty-row">
                <td colSpan="5">No hay solicitudes activas.</td>
              </tr>
            ) : (
              solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>
                    <div className="rn-td-name">
                      {solicitud.paciente?.nombre || `Paciente ${solicitud.pacienteId}`}
                    </div>
                    <div className="rn-td-sub">{solicitud.paciente?.rut || "Sin RUT"}</div>
                  </td>
                  <td>{solicitud.especialidad}</td>
                  <td>
                    <span className={`rn-badge rn-badge--${normalizar(solicitud.prioridad)}`}>
                      {solicitud.prioridad}
                    </span>
                  </td>
                  <td className="rn-td-id">{formatearFecha(solicitud.fechaRegistro)}</td>
                  <td>
                    <span className="rn-badge rn-badge--activo">{solicitud.estado}</span>
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

TablaSolicitudes.propTypes = {
  solicitudes: PropTypes.array.isRequired,
};

export default TablaSolicitudes;
