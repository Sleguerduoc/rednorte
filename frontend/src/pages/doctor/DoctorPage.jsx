import PropTypes from "prop-types";
import { useState } from "react";
import { formatearFecha } from "../../utils/date";
import { inicialesPaciente, nombreCompleto, normalizar } from "../../utils/text";

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  return new Date().getFullYear() - new Date(fechaNacimiento).getFullYear();
}

function labelBtn(cancelando, confirmando) {
  if (cancelando)  return "Cancelando…";
  if (confirmando) return "¿Cancelar?";
  return "✕";
}

function DoctorPage({
  cancelarCita,
  cancelandoCitaId,
  pacientesFiltrados,
  solicitudesActivas,
  busquedaPacientes,
  setBusquedaPacientes,
  onAgendar,
}) {
  const [expandido,    setExpandido]    = useState(null);
  const [confirmandoId, setConfirmandoId] = useState(null);

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

  const citasDePaciente = (pacienteId) =>
    solicitudesActivas.filter((s) => Number(s.pacienteId) === Number(pacienteId));

  const toggleExpandir = (id) => setExpandido((prev) => (prev === id ? null : id));

  return (
    <div className="rn-panel">
      <div className="rn-panel__head">
        <div>
          <h2 className="rn-panel__title">Pacientes</h2>
          <p className="rn-panel__sub">
            Vista médico. Usa <strong>Agendar</strong> para agregar a lista de espera o ingresar un sobre cupo.
          </p>
        </div>
        <div className="rn-panel__actions">
          <div className="rn-search">
            <span className="rn-search__icon">⌕</span>
            <input
              className="rn-search__input"
              placeholder="RUT, nombre o contacto"
              value={busquedaPacientes}
              onChange={(e) => setBusquedaPacientes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rn-doctor-list">
        {pacientesFiltrados.length === 0 ? (
          <div className="rn-empty">No hay pacientes que coincidan.</div>
        ) : (
          pacientesFiltrados.map((paciente) => {
            const citas   = citasDePaciente(paciente.id);
            const abierto = expandido === paciente.id;
            const edad    = calcularEdad(paciente.fechaNacimiento);

            return (
              <div key={paciente.id} className="rn-doctor-item">
                <div className="rn-doctor-item__row">
                  <div className="rn-pat-item__av">{inicialesPaciente(paciente)}</div>

                  <div className="rn-doctor-item__info">
                    <div className="rn-td-name">{nombreCompleto(paciente)}</div>
                    <div className="rn-td-sub">
                      {paciente.rut}
                      {edad    != null && ` · ${edad} años`}
                      {paciente.sexo      && ` · ${paciente.sexo}`}
                      {paciente.prevision && ` · ${paciente.prevision}`}
                    </div>
                  </div>

                  <div className="rn-doctor-item__right">
                    {citas.length > 0 && (
                      <span className="rn-badge rn-badge--normal">
                        {citas.length} cita{citas.length === 1 ? "" : "s"}
                      </span>
                    )}
                    <button
                      type="button"
                      className="rn-btn rn-btn--primary"
                      onClick={() => onAgendar(paciente)}
                    >
                      + Agendar
                    </button>
                    <button
                      type="button"
                      className="rn-btn rn-btn--secondary"
                      onClick={() => toggleExpandir(paciente.id)}
                    >
                      {abierto ? "Ocultar ▲" : "Ver citas ▼"}
                    </button>
                  </div>
                </div>

                {abierto && (
                  <div className="rn-doctor-item__citas">
                    {citas.length === 0 ? (
                      <p className="rn-empty" style={{ padding: "16px 20px", textAlign: "left" }}>
                        Sin citas activas.
                      </p>
                    ) : (
                      <table className="rn-table">
                        <thead>
                          <tr>
                            <th>Especialidad</th>
                            <th>Prioridad</th>
                            <th>Fecha registro</th>
                            <th>Estado</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {citas.map((c) => {
                            const confirmando = confirmandoId === c.id;
                            const cancelando  = cancelandoCitaId === c.id;
                            return (
                            <tr key={c.id}>
                              <td>{c.especialidad}</td>
                              <td>
                                <span className={`rn-badge rn-badge--${normalizar(c.prioridad)}`}>
                                  {c.prioridad}
                                </span>
                              </td>
                              <td className="rn-td-id">{formatearFecha(c.fechaRegistro)}</td>
                              <td>
                                <span className="rn-badge rn-badge--activo">{c.estado}</span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={`rn-btn ${confirmando ? "rn-btn--danger rn-btn--confirming" : "rn-btn--ghost-danger"}`}
                                  disabled={cancelando}
                                  onClick={() => handleCancelar(c)}
                                  title={confirmando ? "Confirmar cancelación" : "Cancelar cita"}
                                >
                                  {labelBtn(cancelando, confirmando)}
                                </button>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

DoctorPage.propTypes = {
  cancelarCita:         PropTypes.func.isRequired,
  cancelandoCitaId:     PropTypes.number,
  pacientesFiltrados:   PropTypes.array.isRequired,
  solicitudesActivas:   PropTypes.array.isRequired,
  busquedaPacientes:    PropTypes.string.isRequired,
  setBusquedaPacientes: PropTypes.func.isRequired,
  onAgendar:            PropTypes.func.isRequired,
};

export default DoctorPage;
