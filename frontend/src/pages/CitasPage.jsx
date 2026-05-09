import CitasTable from "../components/citas/CitasTable";
import TimelineReasignaciones from "../components/reasignaciones/TimelineReasignaciones";

function CitasPage({
  busquedaCitas,
  cancelarCita,
  cancelandoCitaId,
  citasFiltradas,
  pacientesPorId,
  reasignaciones,
  setBusquedaCitas
}) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Gestion de citas</h2>
          <p>Busca una cita por paciente o especialidad y cancela desde la misma fila.</p>
        </div>
        <label className="search-box">
          <span>Buscar cita</span>
          <input
            placeholder="Paciente, RUT, especialidad o ID"
            value={busquedaCitas}
            onChange={(e) => setBusquedaCitas(e.target.value)}
          />
        </label>
      </div>

      <CitasTable cancelarCita={cancelarCita} cancelandoCitaId={cancelandoCitaId} citasFiltradas={citasFiltradas} />

      <h3>Reasignaciones recientes</h3>
      <TimelineReasignaciones reasignaciones={reasignaciones} pacientesPorId={pacientesPorId} />
    </section>
  );
}

export default CitasPage;
