import NotificationList from "../components/notificaciones/NotificationList";

function NotificacionesPage({ busquedaNotificaciones, notificacionesFiltradas, setBusquedaNotificaciones }) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>Notificaciones</h2>
          <p>Seguimiento de avisos enviados por canal y paciente.</p>
        </div>
        <label className="search-box">
          <span>Buscar notificacion</span>
          <input
            placeholder="Paciente, canal o texto"
            value={busquedaNotificaciones}
            onChange={(e) => setBusquedaNotificaciones(e.target.value)}
          />
        </label>
      </div>

      <NotificationList notificacionesFiltradas={notificacionesFiltradas} />
    </section>
  );
}

export default NotificacionesPage;
