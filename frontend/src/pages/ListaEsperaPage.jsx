import PropTypes from "prop-types";
import SolicitudForm from "../components/solicitudes/SolicitudForm";
import TablaSolicitudes from "../components/solicitudes/TablaSolicitudes";

function ListaEsperaPage({
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
  setBusquedaSolicitud,
  solicitudesActivas,
}) {
  return (
    <div className="rn-panel">
      <div className="rn-panel__head">
        <div>
          <h2 className="rn-panel__title">Lista de espera</h2>
          <p className="rn-panel__sub">Busca al paciente, selecciónalo y registra la especialidad requerida.</p>
        </div>
      </div>

      <div className="rn-panel__body">
        <SolicitudForm
          actualizarLista={actualizarLista}
          busquedaSolicitud={busquedaSolicitud}
          crearSolicitud={crearSolicitud}
          erroresLista={erroresLista}
          guardandoSolicitud={guardandoSolicitud}
          listaForm={listaForm}
          pacienteSeleccionado={pacienteSeleccionado}
          pacientesLength={pacientesLength}
          pacientesParaSolicitud={pacientesParaSolicitud}
          seleccionarPacienteSolicitud={seleccionarPacienteSolicitud}
          setBusquedaSolicitud={setBusquedaSolicitud}
        />
      </div>

      <TablaSolicitudes solicitudes={solicitudesActivas} />
    </div>
  );
}

ListaEsperaPage.propTypes = {
  actualizarLista:              PropTypes.func.isRequired,
  busquedaSolicitud:            PropTypes.string.isRequired,
  crearSolicitud:               PropTypes.func.isRequired,
  erroresLista:                 PropTypes.object.isRequired,
  guardandoSolicitud:           PropTypes.bool.isRequired,
  listaForm:                    PropTypes.object.isRequired,
  pacienteSeleccionado:         PropTypes.object,
  pacientesLength:              PropTypes.number.isRequired,
  pacientesParaSolicitud:       PropTypes.array.isRequired,
  seleccionarPacienteSolicitud: PropTypes.func.isRequired,
  setBusquedaSolicitud:         PropTypes.func.isRequired,
  solicitudesActivas:           PropTypes.array.isRequired,
};

export default ListaEsperaPage;
