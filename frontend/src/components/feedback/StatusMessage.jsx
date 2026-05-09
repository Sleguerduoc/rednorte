function StatusMessage({ mensaje }) {
  if (!mensaje) return null;

  return (
    <div className={`status status-${mensaje.tipo}`} role="status">
      {mensaje.texto}
    </div>
  );
}

export default StatusMessage;
