import PropTypes from "prop-types";
import DaySelector  from "../common/DaySelector";
import StatusBadge  from "../common/StatusBadge";
import { ESPECIALIDADES } from "../../constants/domain";
import { generarDias } from "../../utils/date";

const DIAS = generarDias(7);

export default function SalaDelDia({
  fecha, setFecha,
  especialidad, setEspecialidad,
  citas, cargando,
  cargandoAccion,
  cupoLiberado, setCupoLiberado,
  onCheckIn, onNoShow, onAtender,
  onActualizar, onVerOfertas,
}) {
  const enSala      = citas.filter((c) => c.estado === "EN_SALA").length;
  const programadas = citas.filter((c) => c.estado === "PROGRAMADA").length;
  const noAsistio   = citas.filter((c) => c.estado === "NO_SHOW").length;
  const atendidas   = citas.filter((c) => c.estado === "ATENDIDA").length;

  return (
    <>
      {/* Header */}
      <div className="rn-panel__head">
        <div>
          <h2 className="rn-panel__title">Sala del día</h2>
          <p className="rn-panel__sub">
            {especialidad} · {fecha} · {citas.length} cita{citas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rn-panel__actions">
          <select
            className="rn-select"
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            style={{ minWidth: 160 }}
          >
            {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <button type="button" className="rn-btn rn-btn--secondary rn-btn--sm" onClick={onActualizar} disabled={cargando}>
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* Day selector */}
      <DaySelector dias={DIAS} diaActivo={fecha} onChange={setFecha} />

      {/* Metrics */}
      <div className="rn-panel__body" style={{ paddingBottom: 0 }}>
        <div className="rn-stats rn-stats--compact" style={{ marginBottom: 20 }}>
          <div className="rn-stat rn-stat--b">
            <div className="rn-stat__stripe" />
            <div className="rn-stat__icon">◈</div>
            <div className="rn-stat__value">{enSala}</div>
            <div className="rn-stat__label">En sala</div>
          </div>
          <div className="rn-stat rn-stat--a">
            <div className="rn-stat__stripe" />
            <div className="rn-stat__icon">◇</div>
            <div className="rn-stat__value">{programadas}</div>
            <div className="rn-stat__label">Programadas</div>
          </div>
          <div className="rn-stat rn-stat--d">
            <div className="rn-stat__stripe" />
            <div className="rn-stat__icon">◬</div>
            <div className="rn-stat__value">{noAsistio}</div>
            <div className="rn-stat__label">No asistió</div>
          </div>
          <div className="rn-stat rn-stat--c">
            <div className="rn-stat__stripe" />
            <div className="rn-stat__icon">✓</div>
            <div className="rn-stat__value">{atendidas}</div>
            <div className="rn-stat__label">Atendidas</div>
          </div>
        </div>

        {/* Cupo liberado banner */}
        {cupoLiberado && (
          <div className="rn-alert rn-alert--info" style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span>Se liberó un cupo para reasignación automática.</span>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button type="button" className="rn-btn rn-btn--primary rn-btn--sm" onClick={onVerOfertas}>Ver ofertas</button>
              <button type="button" className="rn-btn rn-btn--secondary rn-btn--sm" onClick={() => setCupoLiberado(false)}>✕</button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rn-table-wrap">
        {cargando ? (
          <p className="rn-empty">Cargando...</p>
        ) : citas.length === 0 ? (
          <p className="rn-empty">No hay citas para {especialidad} el {fecha}.</p>
        ) : (
          <table className="rn-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id}>
                  <td>
                    <span className="rn-hora-chip rn-hora-chip--disponible">{cita.hora}</span>
                  </td>
                  <td className="rn-td-name">{cita.pacienteNombre}</td>
                  <td><StatusBadge value={cita.estado} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {cita.estado === "EN_SALA" && (
                        <button type="button" className="rn-btn rn-btn--primary rn-btn--sm" disabled={cargandoAccion} onClick={() => onAtender(cita.id)}>
                          Atender
                        </button>
                      )}
                      {cita.estado === "PROGRAMADA" && (
                        <>
                          <button type="button" className="rn-btn rn-btn--secondary rn-btn--sm" disabled={cargandoAccion} onClick={() => onCheckIn(cita.id)}>
                            Check-in
                          </button>
                          <button type="button" className="rn-btn rn-btn--danger rn-btn--sm" disabled={cargandoAccion} onClick={() => onNoShow(cita.id)}>
                            No asistió
                          </button>
                        </>
                      )}
                    </div>
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

SalaDelDia.propTypes = {
  fecha:          PropTypes.string.isRequired,
  setFecha:       PropTypes.func.isRequired,
  especialidad:   PropTypes.string.isRequired,
  setEspecialidad: PropTypes.func.isRequired,
  citas:           PropTypes.array.isRequired,
  cargando:        PropTypes.bool.isRequired,
  cargandoAccion:  PropTypes.bool.isRequired,
  cupoLiberado:    PropTypes.bool.isRequired,
  setCupoLiberado: PropTypes.func.isRequired,
  onCheckIn:      PropTypes.func.isRequired,
  onNoShow:       PropTypes.func.isRequired,
  onAtender:      PropTypes.func.isRequired,
  onActualizar:   PropTypes.func.isRequired,
  onVerOfertas:   PropTypes.func.isRequired,
};
