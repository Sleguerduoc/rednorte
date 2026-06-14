export default function DaySelector({ dias = [], diaActivo, onChange }) {
  return (
    <div className="rn-day-sel" role="tablist">
      {dias.map((dia) => {
        const active = dia.value === diaActivo;
        return (
          <button
            key={dia.value}
            role="tab"
            aria-selected={active}
            type="button"
            className={`rn-day-sel__item${active ? ' rn-day-sel__item--active' : ''}`}
            onClick={() => onChange?.(dia.value)}
          >
            <span className="rn-day-sel__dow">{dia.dow}</span>
            <span className="rn-day-sel__num">{dia.num}</span>
            {dia.count != null && dia.count > 0 && (
              <span className="rn-day-sel__badge">{dia.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
