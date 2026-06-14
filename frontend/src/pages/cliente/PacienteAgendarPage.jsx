import PropTypes from "prop-types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DaySelector  from "../../components/common/DaySelector";
import HoraChip     from "../../components/common/HoraChip";
import StatusBadge  from "../../components/common/StatusBadge";
import StepProgress from "../../components/common/StepProgress";
import { HORAS_CLINICA } from "../../constants/domain";
import { PASOS_AGENDAR, usePacienteAgendar } from "../../hooks/usePacienteAgendar";
import { generarDias } from "../../utils/date";

const DIAS = generarDias(7);

function SolicitudCard({ solicitud }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: ".9375rem", color: "var(--ink)" }}>
          {solicitud.especialidad}
        </div>
        <div className="rn-td-sub">Solicitud #{solicitud.id}</div>
      </div>
      <StatusBadge value={solicitud.prioridad} />
    </div>
  );
}
SolicitudCard.propTypes = { solicitud: PropTypes.object.isRequired };

export default function PacienteAgendarPage({ onSuccess }) {
  const navigate = useNavigate();
  const {
    solicitudes, cargandoSol,
    solicitudActiva, setSolicitudActiva,
    step,
    wizardFecha, setWizardFecha,
    wizardHora, setWizardHora,
    horasOcupadas, cargandoHoras,
    agendando, citaAgendada,
    banner,
    irAPaso1,
    volverAtras,
    doAgendar,
  } = usePacienteAgendar();

  useEffect(() => {
    if (citaAgendada) {
      onSuccess?.();
      const t = setTimeout(() => navigate("/mis-citas"), 2500);
      return () => clearTimeout(t);
    }
  }, [citaAgendada, navigate, onSuccess]);

  return (
    <div style={{ maxWidth: 580, margin: "0 auto" }}>
      <div className="rn-panel">
        <div className="rn-panel__head">
          <div>
            <h2 className="rn-panel__title">Agendar una hora</h2>
            <p className="rn-panel__sub">Elige el día y hora que más te acomoden.</p>
          </div>
        </div>

        <div className="rn-panel__body">
          {banner && (
            <div
              className={`rn-alert rn-alert--${banner.tipo === "exito" ? "success" : "error"}`}
              style={{ marginBottom: 20 }}
            >
              {banner.texto}
              {banner.tipo === "exito" && " Redirigiendo…"}
            </div>
          )}

          {!citaAgendada && (
            <>
              <div style={{ marginBottom: 28 }}>
                <StepProgress pasos={PASOS_AGENDAR} pasoActual={step} />
              </div>

              {/* ── Paso 0: solicitud ─────────────────────────── */}
              {step === 0 && (
                <>
                  {cargandoSol ? (
                    <p style={{ color: "var(--muted)" }}>Cargando tus solicitudes…</p>
                  ) : solicitudes.length === 0 ? (
                    <div className="rn-alert rn-alert--info">
                      No tienes solicitudes pendientes. Primero registra una en{" "}
                      <a
                        href="/listas-espera"
                        style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "underline" }}
                      >
                        Lista de espera
                      </a>.
                    </div>
                  ) : (
                    <>
                      <p className="rn-form-section-title" style={{ marginTop: 0 }}>
                        {solicitudes.length === 1 ? "Tu solicitud" : "Elige una solicitud"}
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {solicitudes.map((s) => {
                          const seleccionada = solicitudActiva?.id === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSolicitudActiva(s)}
                              style={{
                                background:   seleccionada ? "#EEF3FF" : "var(--paper)",
                                border:       `1.5px solid ${seleccionada ? "#3B63CB" : "var(--border)"}`,
                                borderRadius: "var(--r-sm)",
                                padding:      "14px 16px",
                                cursor:       "pointer",
                                textAlign:    "left",
                                transition:   "all .12s",
                              }}
                            >
                              <SolicitudCard solicitud={s} />
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                        <button
                          type="button"
                          className="rn-btn rn-btn--primary"
                          disabled={!solicitudActiva}
                          onClick={() => irAPaso1(solicitudActiva)}
                        >
                          Elegir fecha y hora →
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── Paso 1: fecha + hora ───────────────────────── */}
              {step === 1 && solicitudActiva && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                      padding: "12px 14px",
                      background: "var(--paper)",
                      borderRadius: "var(--r-sm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{solicitudActiva.especialidad}</span>
                    <StatusBadge value={solicitudActiva.prioridad} />
                  </div>

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

                  {wizardHora && (
                    <p style={{ marginTop: 12, fontSize: ".8125rem", color: "var(--muted)" }}>
                      Hora seleccionada:{" "}
                      <strong style={{ color: "var(--navy)" }}>{wizardHora}</strong>
                    </p>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                    <button type="button" className="rn-btn rn-btn--secondary" onClick={volverAtras}>
                      ← Atrás
                    </button>
                    <button
                      type="button"
                      className="rn-btn rn-btn--primary"
                      disabled={!wizardHora || agendando}
                      onClick={doAgendar}
                    >
                      {agendando ? "Confirmando…" : "Confirmar cita"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

PacienteAgendarPage.propTypes = { onSuccess: PropTypes.func };
