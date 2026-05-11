import PropTypes from "prop-types";
import { formatearFecha } from "../../utils/date";
import { nombreCompleto } from "../../utils/text";
import ListHeader from "../common/ListHeader";

function NotificationList({ notificacionesFiltradas }) {
  return (
    <div>
      <ListHeader count={notificacionesFiltradas.length} label="Notificaciones" />
      <div className="rn-notif-list">
        {notificacionesFiltradas.length === 0 ? (
          <div className="rn-empty">No hay notificaciones que coincidan con la búsqueda.</div>
        ) : (
          notificacionesFiltradas.slice().reverse().map((n) => {
            const esEmail = n.canal === "EMAIL";
            return (
              <div className="rn-notif-item" key={n.id}>
                <div className={`rn-notif-item__ch rn-notif-item__ch--${esEmail ? "email" : "sms"}`}>
                  {esEmail ? "✉" : "✆"}
                </div>
                <div className="rn-notif-item__body">
                  <div className="rn-notif-item__name">
                    {nombreCompleto(n.paciente) || `Paciente ${n.pacienteId}`}
                  </div>
                  <div className="rn-notif-item__msg">{n.mensaje}</div>
                  <div className="rn-notif-item__meta">
                    <span>{formatearFecha(n.fechaEnvio)}</span>
                    <span className={`rn-badge rn-badge--${esEmail ? "email" : "sms"}`}>{n.canal}</span>
                    <span>{n.estado}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

NotificationList.propTypes = { notificacionesFiltradas: PropTypes.array.isRequired };

export default NotificationList;