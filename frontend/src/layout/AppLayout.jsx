import { NavLink } from "react-router-dom";
import StatusMessage from "../components/feedback/StatusMessage";

function AppLayout({ cargandoDatos, children, mensaje, onActualizar }) {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>RedNorte</h2>
        <p>Gestion hospitalaria</p>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/pacientes">Pacientes</NavLink>
          <NavLink to="/listas-espera">Lista de espera</NavLink>
          <NavLink to="/citas">Citas</NavLink>
          <NavLink to="/notificaciones">Notificaciones</NavLink>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>RedNorte</h1>
            <p>Gestion integral de pacientes, listas de espera, cancelaciones y notificaciones.</p>
          </div>
          <button type="button" onClick={onActualizar} disabled={cargandoDatos}>
            {cargandoDatos ? "Actualizando..." : "Actualizar datos"}
          </button>
        </header>

        <StatusMessage mensaje={mensaje} />
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
