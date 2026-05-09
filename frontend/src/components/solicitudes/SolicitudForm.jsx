import EspecialidadPicker from "./EspecialidadPicker";
import PacienteFinder from "./PacienteFinder";

function SolicitudForm({
  actualizarLista,
  busquedaSolicitud,
  crearSolicitud,
  erroresLista,
  guardandoSolicitud,
  listaForm,
  pacienteSeleccionado,
  pacientesLength,
  pacientesParaSolicitud,
  seleccionarPacienteSolicitud,
  setBusquedaSolicitud
}) {
  return (
    <form onSubmit={crearSolicitud} className="split-form" noValidate>
      <PacienteFinder
        actualizarLista={actualizarLista}
        busquedaSolicitud={busquedaSolicitud}
        erroresLista={erroresLista}
        listaForm={listaForm}
        pacientesParaSolicitud={pacientesParaSolicitud}
        seleccionarPacienteSolicitud={seleccionarPacienteSolicitud}
        setBusquedaSolicitud={setBusquedaSolicitud}
      />

      <div className="request-fields">
        {pacienteSeleccionado && (
          <div className="selected-patient">
            <span>Paciente seleccionado</span>
            <strong>{pacienteSeleccionado.nombre}</strong>
          </div>
        )}
        <EspecialidadPicker actualizarLista={actualizarLista} erroresLista={erroresLista} listaForm={listaForm} />
        <label>
          <span>Prioridad</span>
          <select value={listaForm.prioridad} onChange={(e) => actualizarLista("prioridad", e.target.value)}>
            <option value="NORMAL">Normal</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Critica</option>
          </select>
        </label>
        <button type="submit" disabled={guardandoSolicitud || pacientesLength === 0}>
          {guardandoSolicitud ? "Registrando..." : "Agregar a lista"}
        </button>
      </div>
    </form>
  );
}

export default SolicitudForm;
