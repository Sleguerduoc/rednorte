import PropTypes from "prop-types";
import StatusBadge from "../common/StatusBadge";

function Antiguedad({ fechaRegistro }) {
  if (!fechaRegistro) return <span className="rn-td-sub">—</span>;
  const dias = Math.floor((Date.now() - new Date(fechaRegistro).getTime()) / 86_400_000);
  return <span className="rn-td-sub">{dias === 0 ? "Hoy" : `Hace ${dias} día${dias !== 1 ? "s" : ""}`}</span>;
}

Antiguedad.propTypes = { fechaRegistro: PropTypes.string };

export default function ListaEsperaPendiente({ solicitudes, cargando, onAgendar, onActualizar }) {
  return (
    <>
      <div className="rn-panel__head">
        <div>
          <h2 className="rn-panel__title">Lista de espera</h2>
          <p className="rn-panel__sub">{solicitudes.length} solicitud{solicitudes.length !== 1 ? "es" : ""} pendiente{solicitudes.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rn-panel__actions">
          <button type="button" className="rn-btn rn-btn--secondary rn-btn--sm" onClick={onActualizar} disabled={cargando}>
            ↻ Actualizar
          </button>
        </div>
      </div>
      <div className="rn-table-wrap">
        {cargando ? (
          <p className="rn-empty">Cargando...</p>
        ) : solicitudes.length === 0 ? (
          <p className="rn-empty">No hay solicitudes pendientes.</p>
        ) : (
          <table className="rn-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Especialidad</th>
                <th>Prioridad</th>
                <th>Antigüedad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id}>
                  <td className="rn-td-id">#{s.id}</td>
                  <td className="rn-td-name">{s.pacienteNombre}</td>
                  <td>{s.especialidad}</td>
                  <td><StatusBadge value={s.prioridad} /></td>
                  <td><Antiguedad fechaRegistro={s.fechaRegistro} /></td>
                  <td>
                    <button type="button" className="rn-btn rn-btn--primary rn-btn--sm" onClick={() => onAgendar(s)}>
                      Agendar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

ListaEsperaPendiente.propTypes = {
  solicitudes: PropTypes.array.isRequired,
  cargando:    PropTypes.bool.isRequired,
  onAgendar:   PropTypes.func.isRequired,
  onActualizar: PropTypes.func.isRequired,
};
