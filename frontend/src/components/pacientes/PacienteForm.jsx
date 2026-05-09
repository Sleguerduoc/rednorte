function PacienteForm({ actualizarPaciente, crearPaciente, erroresPaciente, guardandoPaciente, pacienteForm }) {
  return (
    <form onSubmit={crearPaciente} className="form-grid patient-form" noValidate>
      <label>
        <span>RUT</span>
        <input
          aria-invalid={Boolean(erroresPaciente.rut)}
          placeholder="12345678-9"
          value={pacienteForm.rut}
          onChange={(e) => actualizarPaciente("rut", e.target.value)}
        />
        {erroresPaciente.rut && <small>{erroresPaciente.rut}</small>}
      </label>
      <label className="wide-field">
        <span>Nombre</span>
        <input
          aria-invalid={Boolean(erroresPaciente.nombre)}
          placeholder="Nombre completo"
          value={pacienteForm.nombre}
          onChange={(e) => actualizarPaciente("nombre", e.target.value)}
        />
        {erroresPaciente.nombre && <small>{erroresPaciente.nombre}</small>}
      </label>
      <label>
        <span>Email</span>
        <input
          aria-invalid={Boolean(erroresPaciente.email)}
          placeholder="paciente@email.cl"
          value={pacienteForm.email}
          onChange={(e) => actualizarPaciente("email", e.target.value)}
        />
        {erroresPaciente.email && <small>{erroresPaciente.email}</small>}
      </label>
      <label>
        <span>Telefono</span>
        <input
          aria-invalid={Boolean(erroresPaciente.telefono)}
          placeholder="+56 9 1234 5678"
          value={pacienteForm.telefono}
          onChange={(e) => actualizarPaciente("telefono", e.target.value)}
        />
        {erroresPaciente.telefono && <small>{erroresPaciente.telefono}</small>}
      </label>
      <label className="wide-field">
        <span>Direccion</span>
        <input
          aria-invalid={Boolean(erroresPaciente.direccion)}
          placeholder="Direccion del paciente"
          value={pacienteForm.direccion}
          onChange={(e) => actualizarPaciente("direccion", e.target.value)}
        />
        {erroresPaciente.direccion && <small>{erroresPaciente.direccion}</small>}
      </label>
      <button type="submit" disabled={guardandoPaciente}>
        {guardandoPaciente ? "Guardando..." : "Crear paciente"}
      </button>
    </form>
  );
}

export default PacienteForm;
