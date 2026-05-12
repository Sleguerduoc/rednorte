import PropTypes from "prop-types";
import { inicialesPaciente, nombreCompleto } from "../../utils/text";

function PacienteFinder({
  actualizarLista,
  busquedaSolicitud,
  erroresLista,
  listaForm,
  pacientesParaSolicitud,
  seleccionarPacienteSolicitud,
  setBusquedaSolicitud,
}) {
  /* Ocultar el dropdown si ya hay un paciente seleccionado */
  const mostrarDropdown = busquedaSolicitud.trim().length > 0 && !listaForm.pacienteId;

  return (
    <div className="rn-field rn-finder">
      <label className="rn-label" htmlFor="finder-input">Buscar paciente</label>
      <input
        id="finder-input"
        className={`rn-input${erroresLista.pacienteId ? " rn-input--error" : ""}`}
        placeholder="RUT, nombre o teléfono"
        value={busquedaSolicitud}
        onChange={(e) => {
          setBusquedaSolicitud(e.target.value);
          actualizarLista("pacienteId", "");
        }}
      />
      {erroresLista.pacienteId && (
        <span className="rn-field-error">{erroresLista.pacienteId}</span>
      )}

      {mostrarDropdown && (
        <div className="rn-finder__results">
          {pacientesParaSolicitud.length === 0 ? (
            <div className="rn-finder__empty">Sin resultados</div>
          ) : (
            pacientesParaSolicitud.map((paciente) => (
              <button
                type="button"
                key={paciente.id}
                className={`rn-finder__opt${Number(listaForm.pacienteId) === Number(paciente.id) ? " rn-finder__opt--sel" : ""}`}
                onClick={() => seleccionarPacienteSolicitud(paciente)}
              >
                <span className="rn-finder__opt-name">
                  {inicialesPaciente(paciente)}&nbsp;&nbsp;{nombreCompleto(paciente)}
                </span>
                <span className="rn-finder__opt-rut">{paciente.rut} · {paciente.email}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

PacienteFinder.propTypes = {
  actualizarLista:              PropTypes.func.isRequired,
  busquedaSolicitud:            PropTypes.string.isRequired,
  erroresLista:                 PropTypes.object.isRequired,
  listaForm:                    PropTypes.object.isRequired,
  pacientesParaSolicitud:       PropTypes.array.isRequired,
  seleccionarPacienteSolicitud: PropTypes.func.isRequired,
  setBusquedaSolicitud:         PropTypes.func.isRequired,
};

export default PacienteFinder;
