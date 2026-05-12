import PropTypes from "prop-types";
import CitasTable from "../components/citas/CitasTable";
import TimelineReasignaciones from "../components/reasignaciones/TimelineReasignaciones";

function CitasPage({
  busquedaCitas,
  cancelarCita,
  cancelandoCitaId,
  citasFiltradas,
  pacientesPorId,
  reasignaciones,
  setBusquedaCitas,
}) {
  return (
    <>
      <div className="rn-panel">
        <div className="rn-panel__head">
          <div>
            <h2 className="rn-panel__title">Gestión de citas</h2>
            <p className="rn-panel__sub">Busca por paciente o especialidad y cancela desde la misma fila.</p>
          </div>
          <div className="rn-panel__actions">
            <div className="rn-search">
              <span className="rn-search__icon">⌕</span>
              <input
                className="rn-search__input"
                placeholder="Paciente, RUT, especialidad o ID"
                value={busquedaCitas}
                onChange={(e) => setBusquedaCitas(e.target.value)}
              />
            </div>
          </div>
        </div>
        <CitasTable
          cancelarCita={cancelarCita}
          cancelandoCitaId={cancelandoCitaId}
          citasFiltradas={citasFiltradas}
        />
      </div>

      <div className="rn-panel">
        <div className="rn-panel__head">
          <div>
            <h2 className="rn-panel__title">Avisos de reagendamiento</h2>
            <p className="rn-panel__sub">Al cancelar una cita, el paciente recibe EMAIL y SMS para reagendar. El cupo queda disponible para asignación manual.</p>
          </div>
        </div>
        <TimelineReasignaciones reasignaciones={reasignaciones} pacientesPorId={pacientesPorId} />
      </div>
    </>
  );
}

CitasPage.propTypes = {
  busquedaCitas:    PropTypes.string.isRequired,
  cancelarCita:     PropTypes.func.isRequired,
  cancelandoCitaId: PropTypes.number,
  citasFiltradas:   PropTypes.array.isRequired,
  pacientesPorId:   PropTypes.instanceOf(Map).isRequired,
  reasignaciones:   PropTypes.array.isRequired,
  setBusquedaCitas: PropTypes.func.isRequired,
};

export default CitasPage;
