import PropTypes from "prop-types";

function PacienteForm({ actualizarPaciente, crearPaciente, erroresPaciente, guardandoPaciente, pacienteForm }) {
  return (
    <form onSubmit={crearPaciente} className="rn-form" noValidate>
      <div className="rn-field">
        <label className="rn-label" htmlFor="pac-rut">RUT</label>
        <input
          id="pac-rut"
          className={`rn-input${erroresPaciente.rut ? " rn-input--error" : ""}`}
          placeholder="12345678-9"
          value={pacienteForm.rut}
          onChange={(e) => actualizarPaciente("rut", e.target.value)}
        />
        {erroresPaciente.rut && <span className="rn-field-error">{erroresPaciente.rut}</span>}
      </div>

      <div className="rn-field rn-field--2">
        <label className="rn-label" htmlFor="pac-nombre">Nombre</label>
        <input
          id="pac-nombre"
          className={`rn-input${erroresPaciente.nombre ? " rn-input--error" : ""}`}
          placeholder="Nombre completo"
          value={pacienteForm.nombre}
          onChange={(e) => actualizarPaciente("nombre", e.target.value)}
        />
        {erroresPaciente.nombre && <span className="rn-field-error">{erroresPaciente.nombre}</span>}
      </div>

      <div className="rn-field">
        <label className="rn-label" htmlFor="pac-email">Email</label>
        <input
          id="pac-email"
          type="email"
          className={`rn-input${erroresPaciente.email ? " rn-input--error" : ""}`}
          placeholder="paciente@email.cl"
          value={pacienteForm.email}
          onChange={(e) => actualizarPaciente("email", e.target.value)}
        />
        {erroresPaciente.email && <span className="rn-field-error">{erroresPaciente.email}</span>}
      </div>

      <div className="rn-field">
        <label className="rn-label" htmlFor="pac-tel">Teléfono</label>
        <input
          id="pac-tel"
          className={`rn-input${erroresPaciente.telefono ? " rn-input--error" : ""}`}
          placeholder="+56 9 1234 5678"
          value={pacienteForm.telefono}
          onChange={(e) => actualizarPaciente("telefono", e.target.value)}
        />
        {erroresPaciente.telefono && <span className="rn-field-error">{erroresPaciente.telefono}</span>}
      </div>

      <div className="rn-field rn-field--2">
        <label className="rn-label" htmlFor="pac-dir">Dirección</label>
        <input
          id="pac-dir"
          className={`rn-input${erroresPaciente.direccion ? " rn-input--error" : ""}`}
          placeholder="Dirección del paciente"
          value={pacienteForm.direccion}
          onChange={(e) => actualizarPaciente("direccion", e.target.value)}
        />
        {erroresPaciente.direccion && <span className="rn-field-error">{erroresPaciente.direccion}</span>}
      </div>

      <div className="rn-field" style={{ alignSelf: "flex-end" }}>
        <button type="submit" className="rn-btn rn-btn--primary" disabled={guardandoPaciente}>
          {guardandoPaciente ? "Guardando..." : "Crear paciente"}
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
