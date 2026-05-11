import PropTypes from "prop-types";

const ICONS = { exito: "✓", success: "✓", error: "✕", info: "i" };

function StatusMessage({ mensaje }) {
  if (!mensaje) return null;
  return (
    <output className={`rn-toast rn-toast--${mensaje.tipo}`}>
      <span className="rn-toast__icon">{ICONS[mensaje.tipo] ?? "i"}</span>
      <span className="rn-toast__text">{mensaje.texto}</span>
    </output>
  );
}

StatusMessage.propTypes = {
  mensaje: PropTypes.shape({
    tipo:  PropTypes.string.isRequired,
    texto: PropTypes.string.isRequired,
  }),
};

export default StatusMessage;
