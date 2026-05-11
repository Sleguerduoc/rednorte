import { Navigate, Route, Routes } from "react-router-dom";
import CitasPage from "../pages/CitasPage";
import DashboardPage from "../pages/DashboardPage";
import ListaEsperaPage from "../pages/ListaEsperaPage";
import NotificacionesPage from "../pages/NotificacionesPage";
import PacientesPage from "../pages/PacientesPage";

function AppRoutes({ acciones, busquedas, colecciones, estado, prepararSolicitudDesdePaciente }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <DashboardPage
            notificaciones={colecciones.notificaciones}
            pacientes={colecciones.pacientes}
            pacientesPorId={colecciones.pacientesPorId}
            reasignaciones={colecciones.reasignaciones}
            solicitudesActivas={colecciones.solicitudesActivas}
          />
        }
      />
      <Route
        path="/pacientes"
        element={
          <PacientesPage
            actualizarPaciente={acciones.actualizarPaciente}
            busquedaPacientes={busquedas.busquedaPacientes}
            crearPaciente={acciones.crearPaciente}
            erroresPaciente={estado.erroresPaciente}
            guardandoPaciente={estado.guardandoPaciente}
            pacienteForm={estado.pacienteForm}
            pacientesFiltrados={colecciones.pacientesFiltrados}
            prepararSolicitudDesdePaciente={prepararSolicitudDesdePaciente}
            setBusquedaPacientes={busquedas.setBusquedaPacientes}
          />
        }
      />
      <Route
        path="/listas-espera"
        element={
          <ListaEsperaPage
            actualizarLista={acciones.actualizarLista}
            busquedaSolicitud={busquedas.busquedaSolicitud}
            crearSolicitud={acciones.crearSolicitud}
            erroresLista={estado.erroresLista}
            guardandoSolicitud={estado.guardandoSolicitud}
            listaForm={estado.listaForm}
            pacienteSeleccionado={estado.pacienteSeleccionado}
            pacientesLength={colecciones.pacientes.length}
            pacientesParaSolicitud={colecciones.pacientesParaSolicitud}
            seleccionarPacienteSolicitud={acciones.seleccionarPacienteSolicitud}
            setBusquedaSolicitud={busquedas.setBusquedaSolicitud}
            solicitudesActivas={colecciones.solicitudesActivas}
          />
        }
      />
      <Route
        path="/citas"
        element={
          <CitasPage
            busquedaCitas={busquedas.busquedaCitas}
            cancelarCita={acciones.cancelarCita}
            cancelandoCitaId={estado.cancelandoCitaId}
            citasFiltradas={colecciones.citasFiltradas}
            pacientesPorId={colecciones.pacientesPorId}
            reasignaciones={colecciones.reasignaciones}
            setBusquedaCitas={busquedas.setBusquedaCitas}
          />
        }
      />
      <Route
        path="/notificaciones"
        element={
          <NotificacionesPage
            busquedaNotificaciones={busquedas.busquedaNotificaciones}
            notificacionesFiltradas={colecciones.notificacionesFiltradas}
            setBusquedaNotificaciones={busquedas.setBusquedaNotificaciones}
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;
