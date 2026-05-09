import { formatearFecha } from "../../utils/date";

function NotificationList({ notificacionesFiltradas }) {
  return (
    <div className="notification-list">
      {notificacionesFiltradas.length === 0 ? (
        <div className="empty">No hay notificaciones que coincidan con la busqueda.</div>
      ) : (
        notificacionesFiltradas.slice().reverse().map((notificacion) => (
          <article className="notification" key={notificacion.id}>
            <div className="notification-icon">{notificacion.canal === "SMS" ? "SMS" : "EMAIL"}</div>
            <div>
              <strong>{notificacion.paciente?.nombre || `Paciente ${notificacion.pacienteId}`}</strong>
              <p>{notificacion.mensaje}</p>
              <span>{formatearFecha(notificacion.fechaEnvio)} - Estado {notificacion.estado}</span>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

export default NotificationList;
