const ESTADO_MAP = {
  // estados de Cita
  programada:  'programada',
  en_sala:     'en_sala',
  atendida:    'atendida',
  no_show:     'no_show',
  cancelada:   'cancelada',
  reasignada:  'reasignada',
  // prioridades de Solicitud
  critica:     'critica',
  alta:        'alta',
  normal:      'normal',
};

const LABEL_MAP = {
  programada: 'Programada',
  en_sala:    'En sala',
  atendida:   'Atendida',
  no_show:    'No show',
  cancelada:  'Cancelada',
  reasignada: 'Reasignada',
  critica:    'Crítica',
  alta:       'Alta',
  normal:     'Normal',
};

export default function StatusBadge({ value, className = '' }) {
  const key = (value ?? '').toLowerCase().replace(/[\s-]/g, '_');
  const modifier = ESTADO_MAP[key] ?? key;
  const label = LABEL_MAP[key] ?? value;
  return (
    <span className={`rn-badge rn-badge--${modifier} ${className}`}>
      {label}
    </span>
  );
}
