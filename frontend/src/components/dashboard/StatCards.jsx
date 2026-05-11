import PropTypes from "prop-types";

function StatCards({ notificaciones, pacientes, reasignaciones, solicitudesActivas }) {
  const stats = [
    { mod: "a", icon: "♥", value: pacientes.length,          label: "Pacientes activos"      },
    { mod: "b", icon: "⋯", value: solicitudesActivas.length,  label: "En lista de espera"     },
    { mod: "c", icon: "↻", value: reasignaciones.length,      label: "Reasignaciones"         },
    { mod: "d", icon: "✉", value: notificaciones.length,      label: "Notificaciones emitidas" },
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
  pacientes:         PropTypes.array.isRequired,
  solicitudesActivas: PropTypes.array.isRequired,
  reasignaciones:    PropTypes.array.isRequired,
  notificaciones:    PropTypes.array.isRequired,
};

export default StatCards;
