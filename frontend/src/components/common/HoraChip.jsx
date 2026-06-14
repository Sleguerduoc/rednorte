export default function HoraChip({ hora, estado = 'disponible', onClick }) {
  const disabled = estado === 'reservada';
  return (
    <button
      type="button"
      className={`rn-hora-chip rn-hora-chip--${estado}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={estado === 'seleccionada'}
    >
      {hora}
    </button>
  );
}
