function StatCards({ notificaciones, pacientes, reasignaciones, solicitudesActivas }) {
  return (
    <section className="cards">
      <div className="card">
        <span>Pacientes activos</span>
        <strong>{pacientes.length}</strong>
      </div>
      <div className="card">
        <span>En lista de espera</span>
        <strong>{solicitudesActivas.length}</strong>
      </div>
      <div className="card">
        <span>Reasignaciones</span>
        <strong>{reasignaciones.length}</strong>
      </div>
      <div className="card">
        <span>Notificaciones emitidas</span>
        <strong>{notificaciones.length}</strong>
      </div>
    </section>
  );
}

export default StatCards;
