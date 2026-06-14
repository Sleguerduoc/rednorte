import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CitasPage from "../pages/CitasPage";
import DashboardPage from "../pages/DashboardPage";
import ListaEsperaPage from "../pages/ListaEsperaPage";
import NotificacionesPage from "../pages/NotificacionesPage";
import PacientesPage from "../pages/PacientesPage";
import MisCitasPage from "../pages/cliente/MisCitasPage";
import DoctorPage from "../pages/doctor/DoctorPage";
import StyleguidePage from "../pages/StyleguidePage";

const INICIO_POR_ROL = { ADMIN: "/dashboard", DOCTOR: "/doctor", CLIENTE: "/mis-citas" };

function Inicio() {
  const { user } = useAuth();
  return <Navigate to={INICIO_POR_ROL[user?.rol] ?? "/dashboard"} replace />;
}

function AppRoutes({ acciones, busquedas, colecciones, estado, prepararSolicitudDesdePaciente }) {
  const { user } = useAuth();
  const esAdmin  = user?.rol === "ADMIN";
  const esDoctor = user?.rol === "DOCTOR";

  /* Paciente vinculado al cliente autenticado (búsqueda por RUT) */
  const pacienteCliente = user?.pacienteRut
    ? Array.from(colecciones.pacientesPorId.values()).find(
        (p) => p.rut === user.pacienteRut
      ) ?? null
    : null;

  const solicitudesCliente = pacienteCliente
    ? colecciones.solicitudesActivas.filter(
        (s) => Number(s.pacienteId) === Number(pacienteCliente.id)
      )
    : [];

  return (
    <Routes>
      <Route path="/"           element={<Inicio />} />
      <Route path="/styleguide" element={<StyleguidePage />} />
      <Route path="*"           element={<Inicio />} />

      {/* ── ADMIN ──────────────────────────────────────────── */}
      {esAdmin && (
        <>
          <Route path="/dashboard" element={
            <DashboardPage
              dashboardStats={colecciones.dashboardStats}
              pacientesPorId={colecciones.pacientesPorId}
              reasignaciones={colecciones.reasignaciones}
            />
          } />
          <Route path="/pacientes" element={
            <PacientesPage
              actualizarPaciente={acciones.actualizarPaciente}
              busquedaPacientes={busquedas.busquedaPacientes}
              crearPaciente={acciones.crearPaciente}
              eliminarPaciente={acciones.eliminarPaciente}
              erroresPaciente={estado.erroresPaciente}
              guardandoPaciente={estado.guardandoPaciente}
              pacienteForm={estado.pacienteForm}
              pacientesFiltrados={colecciones.pacientesFiltrados}
              prepararSolicitudDesdePaciente={prepararSolicitudDesdePaciente}
              setBusquedaPacientes={busquedas.setBusquedaPacientes}
            />
          } />
          <Route path="/listas-espera" element={
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
              solicitudesParaMostrar={colecciones.solicitudesActivas}
            />
          } />
          <Route path="/citas" element={
            <CitasPage
              busquedaCitas={busquedas.busquedaCitas}
              cancelarCita={acciones.cancelarCita}
              cancelandoCitaId={estado.cancelandoCitaId}
              citasFiltradas={colecciones.citasFiltradas}
              pacientesPorId={colecciones.pacientesPorId}
              reasignaciones={colecciones.reasignaciones}
              setBusquedaCitas={busquedas.setBusquedaCitas}
            />
          } />
          <Route path="/notificaciones" element={
            <NotificacionesPage
              busquedaNotificaciones={busquedas.busquedaNotificaciones}
              notificacionesFiltradas={colecciones.notificacionesFiltradas}
              setBusquedaNotificaciones={busquedas.setBusquedaNotificaciones}
            />
          } />
        </>
      )}

      {/* ── DOCTOR ─────────────────────────────────────────── */}
      {esDoctor && (
        <>
          <Route path="/doctor" element={
            <DoctorPage
              cancelarCita={acciones.cancelarCita}
              cancelandoCitaId={estado.cancelandoCitaId}
              pacientesFiltrados={colecciones.pacientesFiltrados}
              solicitudesActivas={colecciones.solicitudesActivas}
              busquedaPacientes={busquedas.busquedaPacientes}
              setBusquedaPacientes={busquedas.setBusquedaPacientes}
              onAgendar={prepararSolicitudDesdePaciente}
            />
          } />
          <Route path="/listas-espera" element={
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
              solicitudesParaMostrar={colecciones.solicitudesActivas}
            />
          } />
        </>
      )}

      {/* ── CLIENTE ────────────────────────────────────────── */}
      <Route path="/mis-citas" element={
        <MisCitasPage
          cancelarCita={acciones.cancelarCita}
          cancelandoCitaId={estado.cancelandoCitaId}
          solicitudesActivas={colecciones.solicitudesActivas}
          pacientesPorId={colecciones.pacientesPorId}
        />
      } />
      <Route path="/listas-espera" element={
        <ListaEsperaPage
          actualizarLista={acciones.actualizarLista}
          busquedaSolicitud={busquedas.busquedaSolicitud}
          crearSolicitud={acciones.crearSolicitud}
          erroresLista={estado.erroresLista}
          guardandoSolicitud={estado.guardandoSolicitud}
          listaForm={estado.listaForm}
          pacienteAutoselect={pacienteCliente}
          pacienteSeleccionado={estado.pacienteSeleccionado}
          pacientesLength={colecciones.pacientes.length}
          pacientesParaSolicitud={colecciones.pacientesParaSolicitud}
          seleccionarPacienteSolicitud={acciones.seleccionarPacienteSolicitud}
          setBusquedaSolicitud={busquedas.setBusquedaSolicitud}
          solicitudesParaMostrar={solicitudesCliente}
        />
      } />
    </Routes>
  );
}

export default AppRoutes;
