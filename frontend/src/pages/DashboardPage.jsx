import PropTypes from "prop-types";
import StatCards from "../components/dashboard/StatCards";
import TimelineReasignaciones from "../components/reasignaciones/TimelineReasignaciones";

function DashboardPage({ dashboardStats, pacientesPorId, reasignaciones }) {
  return (
    <>
      <StatCards dashboardStats={dashboardStats} />

      <div className="rn-panel">
        <div className="rn-panel__head">
          <div>
            <h2 className="rn-panel__title">Cancelaciones recientes</h2>
            <p className="rn-panel__sub">Pacientes notificados para reagendar tras cancelar una cita.</p>
          </div>
        </div>
        <TimelineReasignaciones reasignaciones={reasignaciones} pacientesPorId={pacientesPorId} />
      </div>
    </>
  );
}

DashboardPage.propTypes = {
  dashboardStats: PropTypes.shape({
    totalPacientes:        PropTypes.number.isRequired,
    solicitudesPendientes: PropTypes.number.isRequired,
    totalReasignaciones:   PropTypes.number.isRequired,
    totalNotificaciones:   PropTypes.number.isRequired,
  }).isRequired,
  pacientesPorId: PropTypes.instanceOf(Map).isRequired,
  reasignaciones: PropTypes.array.isRequired,
};

export default DashboardPage;
