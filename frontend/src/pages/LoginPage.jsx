import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { rednorteApi } from "../services/rednorteApi";
import rednorteLogo from "../assets/rednorte-logo.png";

const ROLES_ES = { ADMIN: "Administrador", DOCTOR: "Médico", CLIENTE: "Paciente" };

function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await rednorteApi.login(username.trim(), password);
      login(res.data);
    } catch {
      setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rn-login-bg">
      <div className="rn-login-card">
        {/* Logo */}
        <div className="rn-login-brand">
          <div className="rn-login-logo">
            <img src={rednorteLogo} alt="RedNorte" />
          </div>
          <h1 className="rn-login-title">RedNorte</h1>
          <p className="rn-login-sub">Sistema de listas de espera</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rn-login-form" noValidate>
          <div className="rn-field">
            <label className="rn-label" htmlFor="login-user">Usuario</label>
            <input
              id="login-user"
              className="rn-input"
              placeholder="admin / doctor1 / cliente1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="rn-field">
            <label className="rn-label" htmlFor="login-pass">Contraseña</label>
            <input
              id="login-pass"
              type="password"
              className="rn-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="rn-login-error">{error}</p>
          )}

          <button
            type="submit"
            className="rn-btn rn-btn--primary rn-login-btn"
            disabled={cargando}
          >
            {cargando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        {/* Hint de roles */}
        <div className="rn-login-hints">
          {Object.entries(ROLES_ES).map(([rol, etiqueta]) => (
            <span key={rol} className={`rn-role-badge rn-role-badge--${rol}`}>
              {etiqueta}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
