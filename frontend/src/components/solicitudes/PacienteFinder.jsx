function PacienteFinder({
  busquedaSolicitud,
  erroresLista,
  listaForm,
  pacientesParaSolicitud,
  seleccionarPacienteSolicitud,
  setBusquedaSolicitud,
  actualizarLista
}) {
  return (
    <div className="finder">
      <label>
        <span>Buscar paciente</span>
        <input
          aria-invalid={Boolean(erroresLista.pacienteId)}
          placeholder="RUT, nombre o telefono"
          value={busquedaSolicitud}
          onChange={(e) => {
            setBusquedaSolicitud(e.target.value);
            actualizarLista("pacienteId", "");
          }}
        />
        {erroresLista.pacienteId && <small>{erroresLista.pacienteId}</small>}
      </label>

      <div className="finder-results">
        {pacientesParaSolicitud.length === 0 ? (
          <span className="empty-inline">Sin resultados</span>
        ) : (
          pacientesParaSolicitud.map((paciente) => (
            <button
              type="button"
              className={Number(listaForm.pacienteId) === Number(paciente.id) ? "result selected" : "result"}
              key={paciente.id}
              onClick={() => seleccionarPacienteSolicitud(paciente)}
            >
              <strong>{paciente.nombre}</strong>
              <span>{paciente.rut} - {paciente.email}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default PacienteFinder;
