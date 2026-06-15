import PropTypes from "prop-types";
import { ETIQUETAS_CITA, ETIQUETAS_SOLICITUD } from "../../constants/domain";

const PRIORIDADES = { critica: "Crítica", alta: "Alta", normal: "Normal" };

export default function StatusBadge({ value, className = "" }) {
  const upper = (value ?? "").toUpperCase();
  const lower = (value ?? "").toLowerCase().replace(/[\s-]/g, "_");
  const label = ETIQUETAS_CITA[upper] ?? ETIQUETAS_SOLICITUD[upper] ?? PRIORIDADES[lower] ?? value;
  return (
    <span className={`rn-badge rn-badge--${lower} ${className}`.trim()}>
      {label}
    </span>
  );
}

StatusBadge.propTypes = {
  value:     PropTypes.string,
  className: PropTypes.string,
};
