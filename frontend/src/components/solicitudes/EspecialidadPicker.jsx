import { ESPECIALIDADES } from "../../constants/domain";

function EspecialidadPicker({ actualizarLista, erroresLista, listaForm }) {
  return (
    <div>
      <span className="field-title">Especialidad</span>
      <div className="option-grid" aria-label="Especialidad">
        {ESPECIALIDADES.map((especialidad) => (
          <button
            type="button"
            className={listaForm.especialidad === especialidad ? "option-chip selected" : "option-chip"}
            key={especialidad}
            onClick={() => actualizarLista("especialidad", especialidad)}
          >
            {especialidad}
          </button>
        ))}
      </div>
      <label className="manual-specialty">
        <span>Otra especialidad</span>
        <input
          aria-invalid={Boolean(erroresLista.especialidad)}
          placeholder="Escribir especialidad"
          value={ESPECIALIDADES.includes(listaForm.especialidad) ? "" : listaForm.especialidad}
          onChange={(e) => actualizarLista("especialidad", e.target.value)}
        />
      </label>
      {erroresLista.especialidad && <small>{erroresLista.especialidad}</small>}
    </div>
  );
}

export default EspecialidadPicker;
