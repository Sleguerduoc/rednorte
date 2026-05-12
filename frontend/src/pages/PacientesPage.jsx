import PropTypes from "prop-types";
import PacienteForm from "../components/pacientes/PacienteForm";
import PacienteList from "../components/pacientes/PacienteList";

function PacientesPage({
  actualizarPaciente,
  busquedaPacientes,
  crearPaciente,
  eliminarPaciente,
  erroresPaciente,
  guardandoPaciente,
  pacienteForm,
  pacientesFiltrados,
  prepararSolicitudDesdePaciente,
  setBusquedaPacientes,
}) {
  return (
    <div className="rn-panel">
      <div className="rn-panel__head">
        <div>
          <h2 className="rn-panel__title">Pacientes</h2>
          <p className="rn-panel__sub">Registro rápido y búsqueda por RUT, nombre, email o teléfono.</p>
        </div>
        <div className="rn-panel__actions">
          <div className="rn-search">
            <span className="rn-search__icon">⌕</span>
            <input
              className="rn-search__input"
              placeholder="RUT, nombre o contacto"
              value={busquedaPacientes}
              onChange={(e) => setBusquedaPacientes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rn-panel__body">
        <PacienteForm
          actualizarPaciente={actualizarPaciente}
          crearPaciente={crearPaciente}
          erroresPaciente={erroresPaciente}
          guardandoPaciente={guardandoPaciente}
          pacienteForm={pacienteForm}
        />
      </div>

      <PacienteList
        eliminarPaciente={eliminarPaciente}
        pacientesFiltrados={pacientesFiltrados}
        prepararSolicitudDesdePaciente={prepararSolicitudDesdePaciente}
      />
    </div>
  );
}

PacientesPage.propTypes = {
  actualizarPaciente:             PropTypes.func.isRequired,
  busquedaPacientes:              PropTypes.string.isRequired,
  crearPaciente:                  PropTypes.func.isRequired,
  eliminarPaciente:               PropTypes.func.isRequired,
  erroresPaciente:                PropTypes.object.isRequired,
  guardandoPaciente:              PropTypes.bool.isRequired,
  pacienteForm:                   PropTypes.object.isRequired,
  pacientesFiltrados:             PropTypes.array.isRequired,
  prepararSolicitudDesdePaciente: PropTypes.func.isRequired,
  setBusquedaPacientes:           PropTypes.func.isRequired,
};

export default PacientesPage;
