import { formatearFecha } from "../../utils/date";

function TimelineReasignaciones({ pacientesPorId, reasignaciones }) {
  return (
    <div className="timeline">
      {reasignaciones.length === 0 ? (
        <div className="empty">No hay reasignaciones registradas.</div>
      ) : (
        reasignaciones.slice().reverse().map((reasignacion) => {
          const paciente = pacientesPorId.get(Number(reasignacion.pacienteId));

          return (
            <article className="timeline-item" key={reasignacion.id}>
              <strong>{reasignacion.especialidad}</strong>
              <span>
                Cita #{reasignacion.citaId} - {paciente?.nombre || `Paciente ${reasignacion.pacienteId || "sin asignar"}`} - {formatearFecha(reasignacion.fecha)}
              </span>
              <span className="badge">{reasignacion.estado}</span>
            </article>
          );
        })
      )}
    </div>
  );
}

export default TimelineReasignaciones;
