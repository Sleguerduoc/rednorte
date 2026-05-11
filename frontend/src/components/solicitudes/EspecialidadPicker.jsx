import PropTypes from "prop-types";
import { ESPECIALIDADES } from "../../constants/domain";

function EspecialidadPicker({ actualizarLista, erroresLista, listaForm }) {
  const otraEspecialidad = ESPECIALIDADES.includes(listaForm.especialidad)
    ? ""
    : listaForm.especialidad;

  return (
    <div className="rn-field rn-field--full">
      <fieldset style={{ border: "none", padding: 0 }}>
        <legend className="rn-label">Especialidad</legend>
        <div className="rn-chips">
          {ESPECIALIDADES.map((esp) => (
            <button
              type="button"
              key={esp}
              className={`rn-chip${listaForm.especialidad === esp ? " rn-chip--sel" : ""}`}
              onClick={() => actualizarLista("especialidad", esp)}
            >
              {esp}
            </button>
          ))}
        </div>
      </fieldset>
      <input
        className={`rn-input${erroresLista.especialidad ? " rn-input--error" : ""}`}
        style={{ marginTop: "8px" }}
        placeholder="Otra especialidad…"
        value={otraEspecialidad}
        onChange={(e) => actualizarLista("especialidad", e.target.value)}
      />
      {erroresLista.especialidad && (
        <span className="rn-field-error">{erroresLista.especialidad}</span>
      )}
    </div>
  );
}

EspecialidadPicker.propTypes = {
  actualizarLista: PropTypes.func.isRequired,
  erroresLista:    PropTypes.object.isRequired,
  listaForm:       PropTypes.object.isRequired,
};

export default EspecialidadPicker;
