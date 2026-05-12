import PropTypes from "prop-types";
import { useEffect } from "react";
import SolicitudForm from "../components/solicitudes/SolicitudForm";
import TablaSolicitudes from "../components/solicitudes/TablaSolicitudes";

function ListaEsperaPage({
  actualizarLista,
  busquedaSolicitud,
  crearSolicitud,
  erroresLista,
  guardandoSolicitud,
  listaForm,
  pacienteAutoselect,
  pacienteSeleccionado,
  pacientesLength,
  pacientesParaSolicitud,
  seleccionarPacienteSolicitud,
  setBusquedaSolicitud,
  solicitudesParaMostrar,
}) {
  /* Si se provee pacienteAutoselect (vista cliente) y aún no hay paciente
     seleccionado, lo pre-seleccionamos automáticamente. */
  useEffect(() => {
    if (pacienteAutoselect && !pacienteSeleccionado) {
      seleccionarPacienteSolicitud(pacienteAutoselect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteAutoselect]);

  const titulo    = pacienteAutoselect ? "Solicitar una hora" : "Lista de espera";
  const subtitulo = pacienteAutoselect
    ? "Selecciona la especialidad y prioridad para tu solicitud."
    : "Busca al paciente, selecciónalo y registra la especialidad requerida.";

  return (
    <div className="rn-panel">
      <div className="rn-panel__head">
        <div>
          <h2 className="rn-panel__title">{titulo}</h2>
          <p className="rn-panel__sub">{subtitulo}</p>
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
          modoCliente={!!pacienteAutoselect}
          pacienteSeleccionado={pacienteSeleccionado}
          pacientesLength={pacientesLength}
          pacientesParaSolicitud={pacientesParaSolicitud}
          seleccionarPacienteSolicitud={seleccionarPacienteSolicitud}
          setBusquedaSolicitud={setBusquedaSolicitud}
        />
      </div>

      <TablaSolicitudes solicitudes={solicitudesParaMostrar} />
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
  pacienteAutoselect:           PropTypes.object,
  pacienteSeleccionado:         PropTypes.object,
  pacientesLength:              PropTypes.number.isRequired,
  pacientesParaSolicitud:       PropTypes.array.isRequired,
  seleccionarPacienteSolicitud: PropTypes.func.isRequired,
  setBusquedaSolicitud:         PropTypes.func.isRequired,
  solicitudesParaMostrar:       PropTypes.array.isRequired,
};

export default ListaEsperaPage;
