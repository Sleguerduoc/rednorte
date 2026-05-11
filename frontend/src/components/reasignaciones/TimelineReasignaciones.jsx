import PropTypes from "prop-types";
import { formatearFecha } from "../../utils/date";
import { nombreCompleto } from "../../utils/text";
import ListHeader from "../common/ListHeader";

function TimelineReasignaciones({ pacientesPorId, reasignaciones }) {
  return (
    <div>
      <ListHeader count={reasignaciones.length} label="Reasignaciones" />
      <div className="rn-timeline">
        {reasignaciones.length === 0 ? (
          <div className="rn-empty">No hay reasignaciones registradas.</div>
        ) : (
          reasignaciones.slice().reverse().map((r) => {
            const paciente = pacientesPorId.get(Number(r.pacienteId));
            return (
              <div className="rn-tl-item" key={r.id}>
                <div className="rn-tl-item__dot">#{r.citaId}</div>
                <div className="rn-tl-item__body">
                  <div className="rn-tl-item__title">{r.especialidad}</div>
                  <div className="rn-tl-item__desc">
                    {nombreCompleto(paciente) || `Paciente ${r.pacienteId || "sin asignar"}`}
                    {" · "}
                    <span className="rn-badge rn-badge--default">{r.estado}</span>
                  </div>
                </div>
                <div className="rn-tl-item__date">{formatearFecha(r.fecha)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

TimelineReasignaciones.propTypes = {
  pacientesPorId: PropTypes.instanceOf(Map).isRequired,
  reasignaciones: PropTypes.array.isRequired,
};

export default TimelineReasignaciones;