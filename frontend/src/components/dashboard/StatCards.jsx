import PropTypes from "prop-types";

function StatCards({ dashboardStats }) {
  const stats = [
    { mod: "a", icon: "♥", value: dashboardStats.totalPacientes,        label: "Pacientes activos"      },
    { mod: "b", icon: "⋯", value: dashboardStats.solicitudesPendientes,  label: "En lista de espera"     },
    { mod: "c", icon: "↻", value: dashboardStats.totalReasignaciones,    label: "Avisos de cancelación"  },
    { mod: "d", icon: "✉", value: dashboardStats.totalNotificaciones,    label: "Notificaciones emitidas" },
  ];

  return (
    <div className="rn-stats">
      {stats.map(({ mod, icon, value, label }) => (
        <div key={mod} className={`rn-stat rn-stat--${mod}`}>
          <div className="rn-stat__stripe" />
          <div className="rn-stat__icon">{icon}</div>
          <div className="rn-stat__value">{value}</div>
          <div className="rn-stat__label">{label}</div>
        </div>
      ))}
    </div>
  );
}

StatCards.propTypes = {
  dashboardStats: PropTypes.shape({
    totalPacientes:        PropTypes.number.isRequired,
    solicitudesPendientes: PropTypes.number.isRequired,
    totalReasignaciones:   PropTypes.number.isRequired,
    totalNotificaciones:   PropTypes.number.isRequired,
  }).isRequired,
};

export default StatCards;
