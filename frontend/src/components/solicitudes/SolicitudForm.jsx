import PropTypes from "prop-types";
import { inicialesPaciente, nombreCompleto } from "../../utils/text";
import EspecialidadPicker from "./EspecialidadPicker";
import PacienteFinder from "./PacienteFinder";

const PRIORIDADES = [
  { value: "NORMAL",     label: "Normal",     mod: "normal"     },
  { value: "ALTA",       label: "Alta",       mod: "alta"       },
  { value: "CRITICA",    label: "Crítica",    mod: "urgente"    },
  { value: "SOBRE_CUPO", label: "Sobre cupo", mod: "sobre_cupo" },
];

function SolicitudForm({
  actualizarLista,
  busquedaSolicitud,
  crearSolicitud,
  erroresLista,
  guardandoSolicitud,
  listaForm,
  modoCliente,
  pacienteSeleccionado,
  pacientesLength,
  pacientesParaSolicitud,
  seleccionarPacienteSolicitud,
  setBusquedaSolicitud,
}) {
  return (
    <form onSubmit={crearSolicitud} className="rn-split-form" noValidate>

      {/* Columna izquierda: buscador (oculto en modo cliente) */}
      <div className="rn-split-form__left">
        {modoCliente && pacienteSeleccionado && (
          <div className="rn-sel-patient rn-sel-patient--readonly">
            <div className="rn-sel-patient__av">{inicialesPaciente(pacienteSeleccionado)}</div>
            <div className="rn-sel-patient__info">
              <div className="rn-sel-patient__name">{nombreCompleto(pacienteSeleccionado)}</div>
              <div className="rn-sel-patient__rut">{pacienteSeleccionado.rut}</div>
            </div>
          </div>
        )}
        {modoCliente && !pacienteSeleccionado && (
          <p className="rn-field-error" style={{ marginTop: 0 }}>
            Cargando datos del paciente…
          </p>
        )}
        {!modoCliente && (
          /* Vista admin / doctor: buscador completo */
          <>
            <PacienteFinder
              actualizarLista={actualizarLista}
              busquedaSolicitud={busquedaSolicitud}
              erroresLista={erroresLista}
              listaForm={listaForm}
              pacientesParaSolicitud={pacientesParaSolicitud}
              seleccionarPacienteSolicitud={seleccionarPacienteSolicitud}
              setBusquedaSolicitud={setBusquedaSolicitud}
            />
            {pacienteSeleccionado && (
              <div className="rn-sel-patient">
                <div className="rn-sel-patient__av">{inicialesPaciente(pacienteSeleccionado)}</div>
                <div className="rn-sel-patient__info">
                  <div className="rn-sel-patient__name">{nombreCompleto(pacienteSeleccionado)}</div>
                  <div className="rn-sel-patient__rut">{pacienteSeleccionado.rut}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Columna derecha: especialidad + prioridad + submit */}
      <div className="rn-split-form__right">
        <EspecialidadPicker
          actualizarLista={actualizarLista}
          erroresLista={erroresLista}
          listaForm={listaForm}
        />

        <div className="rn-field">
          <span className="rn-label">Prioridad</span>
          <div className="rn-prio-group">
            {PRIORIDADES.map(({ value, label, mod }) => (
              <div key={value} className={`rn-prio-opt rn-prio-opt--${mod}`}>
                <input
                  type="radio"
                  id={`prio-${value}`}
                  name="prioridad"
                  value={value}
                  checked={listaForm.prioridad === value}
                  onChange={() => actualizarLista("prioridad", value)}
                />
                <label htmlFor={`prio-${value}`}>{label}</label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="rn-btn rn-btn--primary"
          disabled={guardandoSolicitud || pacientesLength === 0}
        >
          {guardandoSolicitud ? "Registrando…" : "Agregar a lista"}
        </button>
      </div>
    </form>
  );
}

SolicitudForm.propTypes = {
  actualizarLista:              PropTypes.func.isRequired,
  busquedaSolicitud:            PropTypes.string.isRequired,
  crearSolicitud:               PropTypes.func.isRequired,
  erroresLista:                 PropTypes.object.isRequired,
  guardandoSolicitud:           PropTypes.bool.isRequired,
  listaForm:                    PropTypes.object.isRequired,
  modoCliente:                  PropTypes.bool,
  pacienteSeleccionado:         PropTypes.object,
  pacientesLength:              PropTypes.number.isRequired,
  pacientesParaSolicitud:       PropTypes.array.isRequired,
  seleccionarPacienteSolicitud: PropTypes.func.isRequired,
  setBusquedaSolicitud:         PropTypes.func.isRequired,
};

export default SolicitudForm;
