import PropTypes from "prop-types";
import { PREVISIONES, SEXOS } from "../../constants/domain";

function Campo({ id, label, error, children }) {
  return (
    <div className="rn-field">
      <label className="rn-label" htmlFor={id}>{label}</label>
      {children}
      {error && <span className="rn-field-error">{error}</span>}
    </div>
  );
}

Campo.propTypes = {
  id:       PropTypes.string.isRequired,
  label:    PropTypes.string.isRequired,
  error:    PropTypes.string,
  children: PropTypes.node.isRequired,
};

function PacienteForm({ actualizarPaciente, crearPaciente, erroresPaciente, guardandoPaciente, pacienteForm }) {
  const f  = pacienteForm;
  const e  = erroresPaciente;
  const up = actualizarPaciente;

  const input = (id, campo, placeholder, tipo = "text", extra = {}) => (
    <Campo id={id} label={extra.label ?? id} error={e[campo]}>
      <input
        id={id}
        type={tipo}
        className={`rn-input${e[campo] ? " rn-input--error" : ""}`}
        placeholder={placeholder}
        value={f[campo]}
        onChange={(ev) => up(campo, ev.target.value)}
      />
    </Campo>
  );

  return (
    <form onSubmit={crearPaciente} noValidate>

      {/* ── Sección: Identificación ──────────────────────── */}
      <p className="rn-form-section-title">Identificación</p>
      <div className="rn-form rn-form--4">
        <Campo id="pac-rut" label="RUT" error={e.rut}>
          <input
            id="pac-rut"
            className={`rn-input${e.rut ? " rn-input--error" : ""}`}
            placeholder="12345678-9"
            value={f.rut}
            onChange={(ev) => up("rut", ev.target.value)}
          />
        </Campo>

        <Campo id="pac-fnac" label="Fecha de nacimiento" error={e.fechaNacimiento}>
          <input
            id="pac-fnac"
            type="date"
            className={`rn-input${e.fechaNacimiento ? " rn-input--error" : ""}`}
            value={f.fechaNacimiento}
            onChange={(ev) => up("fechaNacimiento", ev.target.value)}
          />
        </Campo>

        <Campo id="pac-sexo" label="Sexo" error={e.sexo}>
          <select
            id="pac-sexo"
            className={`rn-select${e.sexo ? " rn-input--error" : ""}`}
            value={f.sexo}
            onChange={(ev) => up("sexo", ev.target.value)}
          >
            <option value="">Seleccionar…</option>
            {SEXOS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Campo>

        <Campo id="pac-prev" label="Previsión" error={e.prevision}>
          <select
            id="pac-prev"
            className={`rn-select${e.prevision ? " rn-input--error" : ""}`}
            value={f.prevision}
            onChange={(ev) => up("prevision", ev.target.value)}
          >
            <option value="">Seleccionar…</option>
            {PREVISIONES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Campo>
      </div>

      {/* ── Sección: Nombre ──────────────────────────────── */}
      <p className="rn-form-section-title">Nombre completo</p>
      <div className="rn-form rn-form--3">
        <Campo id="pac-nombres" label="Nombres" error={e.nombres}>
          <input
            id="pac-nombres"
            className={`rn-input${e.nombres ? " rn-input--error" : ""}`}
            placeholder="Juan Carlos"
            value={f.nombres}
            onChange={(ev) => up("nombres", ev.target.value)}
          />
        </Campo>

        <Campo id="pac-ap" label="Apellido paterno" error={e.apellidoPaterno}>
          <input
            id="pac-ap"
            className={`rn-input${e.apellidoPaterno ? " rn-input--error" : ""}`}
            placeholder="González"
            value={f.apellidoPaterno}
            onChange={(ev) => up("apellidoPaterno", ev.target.value)}
          />
        </Campo>

        <Campo id="pac-am" label="Apellido materno" error={e.apellidoMaterno}>
          <input
            id="pac-am"
            className={`rn-input${e.apellidoMaterno ? " rn-input--error" : ""}`}
            placeholder="Muñoz (opcional)"
            value={f.apellidoMaterno}
            onChange={(ev) => up("apellidoMaterno", ev.target.value)}
          />
        </Campo>
      </div>

      {/* ── Sección: Contacto ────────────────────────────── */}
      <p className="rn-form-section-title">Contacto</p>
      <div className="rn-form rn-form--3">
        <Campo id="pac-email" label="Email" error={e.email}>
          <input
            id="pac-email"
            type="email"
            className={`rn-input${e.email ? " rn-input--error" : ""}`}
            placeholder="paciente@email.cl"
            value={f.email}
            onChange={(ev) => up("email", ev.target.value)}
          />
        </Campo>

        <Campo id="pac-tel" label="Teléfono" error={e.telefono}>
          <input
            id="pac-tel"
            className={`rn-input${e.telefono ? " rn-input--error" : ""}`}
            placeholder="+56 9 1234 5678"
            value={f.telefono}
            onChange={(ev) => up("telefono", ev.target.value)}
          />
        </Campo>

        <Campo id="pac-dir" label="Dirección" error={e.direccion}>
          <input
            id="pac-dir"
            className={`rn-input${e.direccion ? " rn-input--error" : ""}`}
            placeholder="Av. Ejemplo 123, comuna"
            value={f.direccion}
            onChange={(ev) => up("direccion", ev.target.value)}
          />
        </Campo>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
        <button type="submit" className="rn-btn rn-btn--primary" disabled={guardandoPaciente}>
          {guardandoPaciente ? "Guardando…" : "Registrar paciente"}
        </button>
      </div>
    </form>
  );
}

PacienteForm.propTypes = {
  actualizarPaciente: PropTypes.func.isRequired,
  crearPaciente:      PropTypes.func.isRequired,
  erroresPaciente:    PropTypes.object.isRequired,
  guardandoPaciente:  PropTypes.bool.isRequired,
  pacienteForm:       PropTypes.object.isRequired,
};

export default PacienteForm;