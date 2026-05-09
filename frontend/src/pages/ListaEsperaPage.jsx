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
  solicitudesActivas
}) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Lista de espera</h2>
          <p>Busca al paciente, seleccionalo y registra la especialidad requerida.</p>
        </div>
      </div>

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

      <TablaSolicitudes solicitudes={solicitudesActivas} />
    </section>
  );
}

export default ListaEsperaPage;
