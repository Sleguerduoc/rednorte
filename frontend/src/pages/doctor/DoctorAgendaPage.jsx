import PropTypes from "prop-types";
import DaySelector from "../../components/common/DaySelector";
import StatusBadge from "../../components/common/StatusBadge";
import { ESPECIALIDADES } from "../../constants/domain";
import { useDoctorAgenda } from "../../hooks/useDoctorAgenda";
import { generarDias } from "../../utils/date";

const DIAS = generarDias(7);

function Antiguedad({ fechaRegistro }) {
  if (!fechaRegistro) return <span className="rn-td-sub">—</span>;
  const dias = Math.floor((Date.now() - new Date(fechaRegistro).getTime()) / 86_400_000);
  return (
    <span className="rn-td-sub">
      {dias === 0 ? "Hoy" : `Hace ${dias} día${dias !== 1 ? "s" : ""}`}
    </span>
  );
}

Antiguedad.propTypes = { fechaRegistro: PropTypes.string };

export default function DoctorAgendaPage() {
  const {
    fecha, setFecha,
    especialidad, setEspecialidad,
    citas, solicitudes,
    cargandoCitas, cargandoSol,
    cargarCitas, cargarSolicitudes,
    banner,
  } = useDoctorAgenda();

  return (
    <>
      {banner && (
        <div
          className={`rn-alert rn-alert--${banner.tipo === "exito" ? "success" : "error"}`}
          style={{ marginBottom: 16 }}
        >
          {banner.texto}
        </div>
      )}

      {/* Selector de especialidad compartido */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <label className="rn-label" style={{ whiteSpace: "nowrap" }}>Especialidad</label>
        <select
          className="rn-select"
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
          style={{ maxWidth: 220 }}
        >
          {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Bloque 1 — Agenda del día */}
      <div className="rn-panel" style={{ marginBottom: 20 }}>
        <div className="rn-panel__head">
          <div>
            <h2 className="rn-panel__title">Mi agenda del día</h2>
            <p className="rn-panel__sub">
              {especialidad} · {fecha} · {citas.length} cita{citas.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="rn-panel__actions">
            <button
              type="button"
              className="rn-btn rn-btn--secondary rn-btn--sm"
              onClick={cargarCitas}
              disabled={cargandoCitas}
            >
              ↻ Actualizar
            </button>
          </div>
        </div>

        <DaySelector dias={DIAS} diaActivo={fecha} onChange={setFecha} />

        <div className="rn-table-wrap">
          {cargandoCitas ? (
            <p className="rn-empty">Cargando…</p>
          ) : citas.length === 0 ? (
            <p className="rn-empty">No hay citas para {especialidad} el {fecha}.</p>
          ) : (
            <table className="rn-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Estado</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bloque 2 — Lista de espera de su especialidad */}
      <div className="rn-panel">
        <div className="rn-panel__head">
          <div>
            <h2 className="rn-panel__title">Lista de espera</h2>
            <p className="rn-panel__sub">
              {solicitudes.length} solicitud{solicitudes.length !== 1 ? "es" : ""} pendiente{solicitudes.length !== 1 ? "s" : ""} · {especialidad}
            </p>
          </div>
          <div className="rn-panel__actions">
            <button
              type="button"
              className="rn-btn rn-btn--secondary rn-btn--sm"
              onClick={cargarSolicitudes}
              disabled={cargandoSol}
            >
              ↻ Actualizar
            </button>
          </div>
        </div>

        <div className="rn-table-wrap">
          {cargandoSol ? (
            <p className="rn-empty">Cargando…</p>
          ) : solicitudes.length === 0 ? (
            <p className="rn-empty">No hay solicitudes pendientes de {especialidad}.</p>
          ) : (
            <table className="rn-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Prioridad</th>
                  <th>Antigüedad</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td className="rn-td-name">{s.pacienteNombre}</td>
                    <td><StatusBadge value={s.prioridad} /></td>
                    <td><Antiguedad fechaRegistro={s.fechaRegistro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
