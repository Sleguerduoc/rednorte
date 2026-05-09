import StatCards from "../components/dashboard/StatCards";
import TimelineReasignaciones from "../components/reasignaciones/TimelineReasignaciones";

function DashboardPage({ pacientes, pacientesPorId, reasignaciones, solicitudesActivas, notificaciones }) {
  return (
    <>
      <StatCards
        notificaciones={notificaciones}
        pacientes={pacientes}
        reasignaciones={reasignaciones}
        solicitudesActivas={solicitudesActivas}
      />

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>Actividad reciente</h2>
            <p>Ultimas reasignaciones registradas por cancelaciones de cita.</p>
          </div>
        </div>
        <TimelineReasignaciones reasignaciones={reasignaciones} pacientesPorId={pacientesPorId} />
      </section>
    </>
  );
}

export default DashboardPage;
