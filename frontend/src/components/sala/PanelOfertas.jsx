import PropTypes from "prop-types";
import StatusBadge from "../common/StatusBadge";

function Expiracion({ expiraEn }) {
  if (!expiraEn) return <span className="rn-td-sub">—</span>;
  const diff = new Date(expiraEn).getTime() - Date.now();
  if (diff <= 0) return <span className="rn-td-sub" style={{ color: "var(--red)" }}>Expirada</span>;
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return <span className="rn-td-sub">{mins} min</span>;
  return <span className="rn-td-sub">{Math.round(mins / 60)} h</span>;
}

Expiracion.propTypes = { expiraEn: PropTypes.string };

export default function PanelOfertas({ ofertas, cargando, onRevisarVencidas, onActualizar }) {
  return (
    <>
      <div className="rn-panel__head">
        <div>
          <h2 className="rn-panel__title">Ofertas de cupos</h2>
          <p className="rn-panel__sub">{ofertas.length} oferta{ofertas.length !== 1 ? "s" : ""} registrada{ofertas.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rn-panel__actions">
          <button type="button" className="rn-btn rn-btn--secondary rn-btn--sm" onClick={onRevisarVencidas}>
            Revisar vencidas
          </button>
          <button type="button" className="rn-btn rn-btn--secondary rn-btn--sm" onClick={onActualizar} disabled={cargando}>
            ↻ Actualizar
          </button>
        </div>
      </div>
      <div className="rn-table-wrap">
        {cargando ? (
          <p className="rn-empty">Cargando...</p>
        ) : ofertas.length === 0 ? (
          <p className="rn-empty">No hay ofertas registradas.</p>
        ) : (
          <table className="rn-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Cupo</th>
                <th>Estado</th>
                <th>Origen</th>
                <th>Expira en</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((o) => (
                <tr key={o.id}>
                  <td className="rn-td-id">#{o.id}</td>
                  <td className="rn-td-name">{o.pacienteNombre}</td>
                  <td>
                    <span>{o.especialidad}</span>
                    <div className="rn-td-sub">{o.fechaCupo} · {o.horaCupo}</div>
                  </td>
                  <td><StatusBadge value={o.estado} /></td>
                  <td>
                    <span className="rn-td-sub" style={{ textTransform: "lowercase" }}>
                      {(o.origen ?? "").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td><Expiracion expiraEn={o.expiraEn} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

PanelOfertas.propTypes = {
  ofertas:            PropTypes.array.isRequired,
  cargando:           PropTypes.bool.isRequired,
  onRevisarVencidas:  PropTypes.func.isRequired,
  onActualizar:       PropTypes.func.isRequired,
};
