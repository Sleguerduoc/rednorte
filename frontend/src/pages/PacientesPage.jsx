import PacienteForm from "../components/pacientes/PacienteForm";
import PacienteList from "../components/pacientes/PacienteList";

function PacientesPage({
  actualizarPaciente,
  busquedaPacientes,
  crearPaciente,
  erroresPaciente,
  guardandoPaciente,
  pacienteForm,
  pacientesFiltrados,
  prepararSolicitudDesdePaciente,
  setBusquedaPacientes
}) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Pacientes</h2>
          <p>Registro rapido y busqueda por RUT, nombre, email o telefono.</p>
        </div>
        <label className="search-box">
          <span>Buscar paciente</span>
          <input
            placeholder="RUT, nombre o contacto"
            value={busquedaPacientes}
            onChange={(e) => setBusquedaPacientes(e.target.value)}
          />
        </label>
      </div>

      <PacienteForm
        actualizarPaciente={actualizarPaciente}
        crearPaciente={crearPaciente}
        erroresPaciente={erroresPaciente}
        guardandoPaciente={guardandoPaciente}
        pacienteForm={pacienteForm}
      />

      <PacienteList
        pacientesFiltrados={pacientesFiltrados}
        prepararSolicitudDesdePaciente={prepararSolicitudDesdePaciente}
      />
    </section>
  );
}

export default PacientesPage;
