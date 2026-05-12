import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import AppRoutes from "./routes/AppRoutes";
import { useRedNorteData } from "./hooks/useRedNorteData";
import "./App.css";

function AppAutenticada() {
  const navigate = useNavigate();
  const { acciones, busquedas, colecciones, estado } = useRedNorteData();

  const prepararSolicitudDesdePaciente = (paciente) => {
    acciones.seleccionarPacienteSolicitud(paciente);
    navigate("/listas-espera");
  };

  return (
    <AppLayout
      cargandoDatos={estado.cargandoDatos}
      mensaje={estado.mensaje}
      onActualizar={acciones.cargarDatos}
    >
      <AppRoutes
        acciones={acciones}
        busquedas={busquedas}
        colecciones={colecciones}
        estado={estado}
        prepararSolicitudDesdePaciente={prepararSolicitudDesdePaciente}
      />
    </AppLayout>
  );
}

function App() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)   return <LoginPage />;
  return <AppAutenticada />;
}

export default App;
