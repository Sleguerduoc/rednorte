export default function StepProgress({ pasos = [], pasoActual = 0 }) {
  return (
    <div className="rn-steps" role="list">
      {pasos.map((label, i) => {
        const done   = i < pasoActual;
        const active = i === pasoActual;
        const mod    = done ? 'done' : active ? 'active' : '';
        return (
          <div key={i} style={{ display: 'contents' }}>
            <div
              role="listitem"
              className={`rn-steps__item${mod ? ` rn-steps__item--${mod}` : ''}`}
            >
              <div className="rn-steps__dot">
                {done ? '✓' : i + 1}
              </div>
              <span className="rn-steps__label">{label}</span>
            </div>
            {i < pasos.length - 1 && (
              <div className={`rn-steps__line${done ? ' rn-steps__line--done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
