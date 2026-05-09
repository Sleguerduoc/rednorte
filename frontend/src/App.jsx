import { useNavigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import AppRoutes from "./routes/AppRoutes";
import { useRedNorteData } from "./hooks/useRedNorteData";
import "./App.css";

function App() {
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

export default App;
