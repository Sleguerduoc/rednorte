import PropTypes from "prop-types";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/feedback/StatusMessage";
import rednorteLogo from "../assets/rednorte-logo.png";

const NAV_POR_ROL = {
  ADMIN: [
    { to: "/dashboard",      label: "Dashboard",      icon: "◈" },
    { to: "/admin",          label: "Sala del día",   icon: "◐" },
    { to: "/pacientes",      label: "Pacientes",       icon: "◉" },
    { to: "/listas-espera",  label: "Lista de espera", icon: "◎" },
    { to: "/citas",          label: "Citas",            icon: "◇" },
    { to: "/notificaciones", label: "Notificaciones",  icon: "◬" },
  ],
  DOCTOR: [
    { to: "/agenda",       label: "Mi agenda",        icon: "◐" },
    { to: "/doctor",       label: "Pacientes",        icon: "◉" },
    { to: "/listas-espera", label: "Agendar / Cupo",  icon: "◎" },
  ],
  CLIENTE: [
    { to: "/mis-citas", label: "Mis citas",    icon: "◇" },
    { to: "/agendar",   label: "Agendar hora", icon: "＋" },
  ],
};

function AppLayout({ cargandoDatos, children, mensaje, onActualizar }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = NAV_POR_ROL[user?.rol] ?? [];
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="rn-shell">
      <div
        className={`rn-overlay${sidebarOpen ? "" : " rn-overlay--hidden"}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside className={`rn-sidebar${sidebarOpen ? " rn-sidebar--open" : ""}`}>
        {/* Brand */}
        <div className="rn-brand">
          <div className="rn-brand__logo">
            <img src={rednorteLogo} alt="Logo RedNorte" />
          </div>
          <div className="rn-brand__text">
            <span className="rn-brand__name">RedNorte</span>
            <span className="rn-brand__tagline">Conectamos posibilidades</span>
          </div>
        </div>

        <div className="rn-sidebar__div" />

        {/* Nav */}
        <nav className="rn-nav">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `rn-nav__item${isActive ? " rn-nav__item--active" : ""}`
              }
            >
              <span className="rn-nav__icon">{icon}</span>
              <span className="rn-nav__label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User card + logout */}
        <div className="rn-sidebar__user">
          <div className="rn-user-card">
            <span className="rn-user-card__name">{user?.nombre}</span>
            <span className={`rn-role-badge rn-role-badge--${user?.rol}`}>
              {user?.rol}
            </span>
          </div>
          <button type="button" className="rn-logout-btn" onClick={logout}>
            ← Cerrar sesión
          </button>
        </div>

        <div className="rn-sidebar__footer">
          <span>Sistema Operativo</span>
          <span>v2.0</span>
        </div>
      </aside>

      <div className="rn-body">
        <header className="rn-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="rn-hamburger"
              type="button"
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              ☰
            </button>
            <div className="rn-topbar__info">
              <h1 className="rn-topbar__title">RedNorte</h1>
              <p className="rn-topbar__subtitle">
                Gestión integral de pacientes, listas de espera y notificaciones
              </p>
            </div>
          </div>
          <button
            className="rn-btn rn-btn--refresh"
            type="button"
            onClick={onActualizar}
            disabled={cargandoDatos}
          >
            <span className="rn-btn__icon">↻</span>
            {cargandoDatos ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        <div className="rn-content">
          <StatusMessage mensaje={mensaje} />
          {children}
        </div>
      </div>
    </div>
  );
}

AppLayout.propTypes = {
  cargandoDatos: PropTypes.bool.isRequired,
  children:      PropTypes.node.isRequired,
  mensaje:       PropTypes.object,
  onActualizar:  PropTypes.func.isRequired,
};

export default AppLayout;
