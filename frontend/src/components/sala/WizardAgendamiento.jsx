import PropTypes from "prop-types";
import DaySelector  from "../common/DaySelector";
import HoraChip    from "../common/HoraChip";
import StepProgress from "../common/StepProgress";
import StatusBadge  from "../common/StatusBadge";
import { HORAS_CLINICA } from "../../constants/domain";
import { generarDias } from "../../utils/date";

const PASOS = ["Solicitud seleccionada", "Elegir fecha y hora"];
const DIAS  = generarDias(7);

export default function WizardAgendamiento({
  solicitud,
  step,
  wizardFecha, setWizardFecha,
  wizardHora, setWizardHora,
  horasOcupadas,
  cargandoHoras,
  agendando,
  onSiguiente,
  onAgendar,
  onCerrar,
}) {
  return (
    <div className="rn-wizard-overlay" role="dialog" aria-modal="true">
      <div className="rn-wizard">
        {/* Head */}
        <div className="rn-wizard__head">
          <div>
            <h2 className="rn-panel__title">Agendar cita</h2>
            <p className="rn-panel__sub">{solicitud.especialidad} · {solicitud.pacienteNombre}</p>
          </div>
          <button type="button" className="rn-btn rn-btn--secondary rn-btn--sm" onClick={onCerrar}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ padding: "20px 28px 0" }}>
          <StepProgress pasos={PASOS} pasoActual={step} />
        </div>

        {/* Body */}
        <div className="rn-wizard__body">
          {step === 0 && (
            <div>
              <p className="rn-form-section-title">Solicitud</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="rn-label">Paciente</span>
                  <span style={{ fontWeight: 600 }}>{solicitud.pacienteNombre}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="rn-label">Especialidad</span>
                  <span>{solicitud.especialidad}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="rn-label">Prioridad</span>
                  <StatusBadge value={solicitud.prioridad} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="rn-label">ID solicitud</span>
                  <span className="rn-td-id">#{solicitud.id}</span>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="rn-form-section-title" style={{ marginTop: 0 }}>Seleccionar día</p>
              <DaySelector dias={DIAS} diaActivo={wizardFecha} onChange={setWizardFecha} />

              <p className="rn-form-section-title">Seleccionar hora</p>
              {cargandoHoras ? (
                <p style={{ color: "var(--muted)", fontSize: ".875rem" }}>Consultando disponibilidad…</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {HORAS_CLINICA.map((h) => {
                    const ocupada = horasOcupadas.has(h);
                    return (
                      <HoraChip
                        key={h}
                        hora={h}
                        estado={ocupada ? "reservada" : h === wizardHora ? "seleccionada" : "disponible"}
                        onClick={() => !ocupada && setWizardHora(h)}
                      />
                    );
                  })}
                </div>
              )}
              {!cargandoHoras && wizardHora && (
                <p style={{ marginTop: 12, fontSize: ".8125rem", color: "var(--muted)" }}>
                  Hora seleccionada: <strong style={{ color: "var(--navy)" }}>{wizardHora}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rn-wizard__foot">
          <button type="button" className="rn-btn rn-btn--secondary" onClick={onCerrar}>
            Cancelar
          </button>
          {step === 0 && (
            <button type="button" className="rn-btn rn-btn--primary" onClick={onSiguiente}>
              Siguiente →
            </button>
          )}
          {step === 1 && (
            <button
              type="button"
              className="rn-btn rn-btn--primary"
              onClick={onAgendar}
              disabled={!wizardHora || agendando}
            >
              {agendando ? "Agendando…" : "Confirmar cita"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

WizardAgendamiento.propTypes = {
  solicitud:     PropTypes.object.isRequired,
  step:          PropTypes.number.isRequired,
  wizardFecha:   PropTypes.string.isRequired,
  setWizardFecha: PropTypes.func.isRequired,
  wizardHora:    PropTypes.string.isRequired,
  setWizardHora: PropTypes.func.isRequired,
  horasOcupadas: PropTypes.instanceOf(Set).isRequired,
  cargandoHoras: PropTypes.bool.isRequired,
  agendando:     PropTypes.bool.isRequired,
  onSiguiente:   PropTypes.func.isRequired,
  onAgendar:     PropTypes.func.isRequired,
  onCerrar:      PropTypes.func.isRequired,
};
