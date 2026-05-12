import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatearFecha } from "../../utils/date";
import { nombreCompleto, normalizar } from "../../utils/text";

function labelBotonCancelar(cancelando, confirmando) {
  if (cancelando)   return "Cancelando…";
  if (confirmando)  return "¿Cancelar?";
  return "✕";
}

const ESTADO_BADGE = {
  ACTIVO:    "rn-badge--activo",
  CANCELADA: "rn-badge--default",
};

function MisCitasPage({ cancelarCita, cancelandoCitaId, solicitudesActivas, pacientesPorId }) {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [confirmandoId, setConfirmandoId] = useState(null);

  const miPaciente = useMemo(() => {
    const rut = user?.pacienteRut;
    if (!rut) return null;
    for (const [, p] of pacientesPorId) {
      if (p.rut === rut) return p;
    }
    return null;
  }, [user, pacientesPorId]);

  const misCitas = useMemo(() => {
    if (!miPaciente) return [];
    return solicitudesActivas.filter(
      (s) => Number(s.pacienteId) === Number(miPaciente.id)
    );
  }, [solicitudesActivas, miPaciente]);

  const saludo = miPaciente ? nombreCompleto(miPaciente) : (user?.nombre ?? "Paciente");

  const iniciarConfirmacion = (id) => {
    setConfirmandoId(id);
    globalThis.setTimeout(() => setConfirmandoId(null), 3000);
  };

  const handleCancelar = (cita) => {
    if (confirmandoId === cita.id) {
      setConfirmandoId(null);
      cancelarCita(cita);
    } else {
      iniciarConfirmacion(cita.id);
    }
  };

  return (
    <div className="rn-mis-citas">

      {/* Cabecera */}
      <div className="rn-panel rn-mis-citas__header">
        <div className="rn-mis-citas__welcome">
          <div className="rn-mis-citas__avatar">
            {saludo.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
          </div>
          <div>
            <h2 className="rn-mis-citas__name">Hola, {saludo}</h2>
            <p className="rn-mis-citas__sub">
              {misCitas.length === 0
                ? "No tienes citas agendadas actualmente."
                : `Tienes ${misCitas.length} cita${misCitas.length === 1 ? "" : "s"} activas.`}
            </p>
          </div>
        </div>
      </div>

      {/* Citas */}
      <div className="rn-panel">
        <div className="rn-panel__head">
          <div>
            <h2 className="rn-panel__title">Mis citas agendadas</h2>
            <p className="rn-panel__sub">
              Para reagendar o consultar, comunícate con RedNorte.
            </p>
          </div>
          <div className="rn-panel__actions">
            <button
              type="button"
              className="rn-btn rn-btn--primary"
              onClick={() => navigate("/listas-espera")}
            >
              + Agendar una hora
            </button>
          </div>
        </div>

        {misCitas.length === 0 ? (
          <div className="rn-mis-citas__empty">
            <div className="rn-mis-citas__empty-icon" aria-hidden="true">🗓</div>
            <h3 className="rn-mis-citas__empty-title">Sin citas agendadas</h3>
            <p className="rn-mis-citas__empty-sub">
              Aún no tienes ninguna cita registrada. Puedes solicitar una hora con el botón de arriba.
            </p>
            <button
              type="button"
              className="rn-btn rn-btn--primary"
              onClick={() => navigate("/listas-espera")}
            >
              + Solicitar una hora
            </button>
          </div>
        ) : (
          <div className="rn-table-wrap">
            <table className="rn-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Especialidad</th>
                  <th>Prioridad</th>
                  <th>Fecha de registro</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {misCitas.map((cita) => {
                  const confirmando = confirmandoId === cita.id;
                  const cancelando  = cancelandoCitaId === cita.id;
                  const btnLabel    = labelBotonCancelar(cancelando, confirmando);
                  return (
                    <tr key={cita.id}>
                      <td className="rn-td-id">#{cita.id}</td>
                      <td className="rn-td-name">{cita.especialidad}</td>
                      <td>
                        <span className={`rn-badge rn-badge--${normalizar(cita.prioridad)}`}>
                          {cita.prioridad}
                        </span>
                      </td>
                      <td className="rn-td-id">{formatearFecha(cita.fechaRegistro)}</td>
                      <td>
                        <span className={`rn-badge ${ESTADO_BADGE[cita.estado] ?? "rn-badge--default"}`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`rn-btn ${confirmando ? "rn-btn--danger rn-btn--confirming" : "rn-btn--ghost-danger"}`}
                          disabled={cancelando}
                          onClick={() => handleCancelar(cita)}
                          title={confirmando ? "Confirmar cancelación" : "Cancelar cita"}
                        >
                          {btnLabel}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

MisCitasPage.propTypes = {
  cancelarCita:       PropTypes.func.isRequired,
  cancelandoCitaId:   PropTypes.number,
  solicitudesActivas: PropTypes.array.isRequired,
  pacientesPorId:     PropTypes.instanceOf(Map).isRequired,
};

export default MisCitasPage;
