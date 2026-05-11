import PropTypes from "prop-types";
import { formatearFecha } from "../../utils/date";
import ListHeader from "../common/ListHeader";

function NotificationList({ notificacionesFiltradas }) {
  return (
    <div>
      <ListHeader count={notificacionesFiltradas.length} label="Notificaciones" />
      <div className="rn-notif-list">
        {notificacionesFiltradas.length === 0 ? (
          <div className="rn-empty">No hay notificaciones que coincidan con la búsqueda.</div>
        ) : (
          notificacionesFiltradas.slice().reverse().map((notif) => {
            const esEmail = notif.canal === "EMAIL";
            return (
              <div className="rn-notif-item" key={notif.id}>
                <div className={`rn-notif-item__ch rn-notif-item__ch--${esEmail ? "email" : "sms"}`}>
                  {esEmail ? "✉" : "✆"}
                </div>
                <div className="rn-notif-item__body">
                  <div className="rn-notif-item__name">
                    {notif.paciente?.nombre || `Paciente ${notif.pacienteId}`}
                  </div>
                  <div className="rn-notif-item__msg">{notif.mensaje}</div>
                  <div className="rn-notif-item__meta">
                    <span>{formatearFecha(notif.fechaEnvio)}</span>
                    <span className={`rn-badge rn-badge--${esEmail ? "email" : "sms"}`}>
                      {notif.canal}
                    </span>
                    <span>{notif.estado}</span>
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

NotificationList.propTypes = {
  notificacionesFiltradas: PropTypes.array.isRequired,
};

export default NotificationList;
