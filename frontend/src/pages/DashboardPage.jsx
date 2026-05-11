import PropTypes from "prop-types";
import StatCards from "../components/dashboard/StatCards";
import TimelineReasignaciones from "../components/reasignaciones/TimelineReasignaciones";

function DashboardPage({ notificaciones, pacientes, pacientesPorId, reasignaciones, solicitudesActivas }) {
  return (
    <>
      <StatCards
        notificaciones={notificaciones}
        pacientes={pacientes}
        reasignaciones={reasignaciones}
        solicitudesActivas={solicitudesActivas}
      />

      <div className="rn-panel">
        <div className="rn-panel__head">
          <div>
            <h2 className="rn-panel__title">Actividad reciente</h2>
            <p className="rn-panel__sub">Últimas reasignaciones por cancelación de cita.</p>
          </div>
        </div>
        <TimelineReasignaciones reasignaciones={reasignaciones} pacientesPorId={pacientesPorId} />
      </div>
    </>
  );
}

DashboardPage.propTypes = {
  notificaciones:    PropTypes.array.isRequired,
  pacientes:         PropTypes.array.isRequired,
  pacientesPorId:    PropTypes.instanceOf(Map).isRequired,
  reasignaciones:    PropTypes.array.isRequired,
  solicitudesActivas: PropTypes.array.isRequired,
};

export default DashboardPage;
