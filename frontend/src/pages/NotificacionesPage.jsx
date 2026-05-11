import PropTypes from "prop-types";
import NotificationList from "../components/notificaciones/NotificationList";

function NotificacionesPage({ busquedaNotificaciones, notificacionesFiltradas, setBusquedaNotificaciones }) {
  return (
    <div className="rn-panel">
      <div className="rn-panel__head">
        <div>
          <h2 className="rn-panel__title">Notificaciones</h2>
          <p className="rn-panel__sub">Seguimiento de avisos enviados por canal y paciente.</p>
        </div>
        <div className="rn-panel__actions">
          <div className="rn-search">
            <span className="rn-search__icon">⌕</span>
            <input
              className="rn-search__input"
              placeholder="Paciente, canal o texto"
              value={busquedaNotificaciones}
              onChange={(e) => setBusquedaNotificaciones(e.target.value)}
            />
          </div>
        </div>
      </div>
      <NotificationList notificacionesFiltradas={notificacionesFiltradas} />
    </div>
  );
}

NotificacionesPage.propTypes = {
  busquedaNotificaciones:    PropTypes.string.isRequired,
  notificacionesFiltradas:   PropTypes.array.isRequired,
  setBusquedaNotificaciones: PropTypes.func.isRequired,
};

export default NotificacionesPage;
