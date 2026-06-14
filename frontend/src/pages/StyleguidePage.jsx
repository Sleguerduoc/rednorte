import { useState } from 'react';
import StatusBadge  from '../components/common/StatusBadge';
import HoraChip    from '../components/common/HoraChip';
import DaySelector  from '../components/common/DaySelector';
import StepProgress from '../components/common/StepProgress';

const ESTADOS_CITA      = ['PROGRAMADA','EN_SALA','ATENDIDA','NO_SHOW','CANCELADA','REASIGNADA'];
const PRIORIDADES        = ['CRITICA','ALTA','NORMAL'];
const HORAS              = ['09:00','09:30','10:00','10:30','11:00'];
const DIAS               = [
  { value:'2026-06-09', dow:'LUN', num:9,  count:3 },
  { value:'2026-06-10', dow:'MAR', num:10, count:0 },
  { value:'2026-06-11', dow:'MIÉ', num:11, count:7 },
  { value:'2026-06-12', dow:'JUE', num:12 },
  { value:'2026-06-13', dow:'VIE', num:13, count:2 },
];
const PASOS = ['Seleccionar hora','Confirmar datos'];

export default function StyleguidePage() {
  const [diaActivo, setDiaActivo]     = useState('2026-06-11');
  const [horaActiva, setHoraActiva]   = useState('10:00');
  const [pasoActual, setPasoActual]   = useState(0);

  return (
    <div className="rn-content" style={{ maxWidth: 860, paddingBottom: 64 }}>
      <h1 className="rn-page-title">Styleguide</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 40 }}>
        Componentes compartidos — solo para desarrollo, ruta no enlazada.
      </p>

      {/* ── StatusBadge ─────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 className="rn-section-title">StatusBadge</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {ESTADOS_CITA.map(e => <StatusBadge key={e} value={e} />)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {PRIORIDADES.map(p => <StatusBadge key={p} value={p} />)}
        </div>
      </section>

      {/* ── HoraChip ────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 className="rn-section-title">HoraChip</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {HORAS.map((h, i) => (
            <HoraChip
              key={h}
              hora={h}
              estado={
                i === 2 ? 'reservada' :
                h === horaActiva ? 'seleccionada' : 'disponible'
              }
              onClick={() => setHoraActiva(h)}
            />
          ))}
        </div>
        <p style={{ color:'var(--muted)', fontSize:'.8125rem', marginTop:10 }}>
          Seleccionada: <strong>{horaActiva}</strong> · 10:00 siempre reservada
        </p>
      </section>

      {/* ── DaySelector ─────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 className="rn-section-title">DaySelector</h2>
        <div className="rn-card" style={{ overflow: 'hidden', padding: 0 }}>
          <DaySelector dias={DIAS} diaActivo={diaActivo} onChange={setDiaActivo} />
          <p style={{ padding:'16px 20px', color:'var(--muted)', fontSize:'.8125rem', margin:0 }}>
            Día activo: <strong>{diaActivo}</strong>
          </p>
        </div>
      </section>

      {/* ── StepProgress ────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 className="rn-section-title">StepProgress</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {[0,1,2].map(paso => (
            <div key={paso} className="rn-card" style={{ padding:'20px 24px' }}>
              <p style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:12 }}>
                pasoActual={paso}
              </p>
              <StepProgress pasos={PASOS} pasoActual={paso} />
            </div>
          ))}
        </div>
        <p style={{ color:'var(--muted)', fontSize:'.8125rem', marginTop:16 }}>
          Interactivo:
        </p>
        <div className="rn-card" style={{ padding:'20px 24px', marginTop:8 }}>
          <StepProgress pasos={PASOS} pasoActual={pasoActual} />
          <div style={{ display:'flex', gap:8, marginTop:16 }}>
            <button className="rn-btn rn-btn--secondary rn-btn--sm"
              onClick={() => setPasoActual(Math.max(0, pasoActual - 1))}>
              Anterior
            </button>
            <button className="rn-btn rn-btn--primary rn-btn--sm"
              onClick={() => setPasoActual(Math.min(PASOS.length, pasoActual + 1))}>
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {/* ── Botones ─────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 className="rn-section-title">Botones</h2>
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
          <button className="rn-btn rn-btn--primary">Primario</button>
          <button className="rn-btn rn-btn--secondary">Secundario</button>
          <button className="rn-btn rn-btn--primary rn-btn--sm">Primario sm</button>
          <button className="rn-btn rn-btn--secondary rn-btn--sm">Secundario sm</button>
          <button className="rn-btn rn-btn--primary" disabled>Deshabilitado</button>
        </div>
      </section>
    </div>
  );
}
