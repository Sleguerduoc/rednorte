function PacienteList({ pacientesFiltrados, prepararSolicitudDesdePaciente }) {
  return (
    <div className="record-list">
      {pacientesFiltrados.length === 0 ? (
        <div className="empty">No hay pacientes que coincidan con la busqueda.</div>
      ) : (
        pacientesFiltrados.map((paciente) => (
          <article className="record-row" key={paciente.id}>
            <div>
              <strong>{paciente.nombre}</strong>
              <span>{paciente.rut} - {paciente.email}</span>
            </div>
            <div className="record-meta">
              <span>{paciente.telefono}</span>
              <span className="badge">{paciente.estado || "ACTIVO"}</span>
            </div>
            <button type="button" className="secondary" onClick={() => prepararSolicitudDesdePaciente(paciente)}>
              Nueva solicitud
            </button>
          </article>
        ))
      )}
    </div>
  );
}

export default PacienteList;
