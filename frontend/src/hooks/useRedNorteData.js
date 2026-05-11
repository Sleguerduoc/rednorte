import { useCallback, useEffect, useMemo, useState } from "react";
import { estadoInicialLista, estadoInicialPaciente } from "../constants/domain";
import { rednorteApi } from "../services/rednorteApi";
import { fechaDesdeSolicitud } from "../utils/date";
import { obtenerMensajeError } from "../utils/errors";
import { normalizar } from "../utils/text";
import { validarPacienteForm, validarSolicitudForm } from "../utils/validators";

const estaCancelada = (solicitud) => solicitud.estado === "CANCELADA";

export function useRedNorteData() {
  const [pacientes, setPacientes] = useState([]);
  const [listas, setListas] = useState([]);
  const [reasignaciones, setReasignaciones] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);

  const [pacienteForm, setPacienteForm] = useState(estadoInicialPaciente);
  const [listaForm, setListaForm] = useState(estadoInicialLista);
  const [erroresPaciente, setErroresPaciente] = useState({});
  const [erroresLista, setErroresLista] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [guardandoPaciente, setGuardandoPaciente] = useState(false);
  const [guardandoSolicitud, setGuardandoSolicitud] = useState(false);
  const [cancelandoCitaId, setCancelandoCitaId] = useState(null);
  const [busquedaPacientes, setBusquedaPacientes] = useState("");
  const [busquedaSolicitud, setBusquedaSolicitud] = useState("");
  const [busquedaCitas, setBusquedaCitas] = useState("");
  const [busquedaNotificaciones, setBusquedaNotificaciones] = useState("");

  const pacientesPorId = useMemo(
    () => new Map(pacientes.map((paciente) => [Number(paciente.id), paciente])),
    [pacientes]
  );

  const solicitudesEnriquecidas = useMemo(
    () =>
      listas.map((solicitud) => ({
        ...solicitud,
        paciente: pacientesPorId.get(Number(solicitud.pacienteId))
      })),
    [listas, pacientesPorId]
  );

  const solicitudesActivas = useMemo(
    () => solicitudesEnriquecidas.filter((solicitud) => !estaCancelada(solicitud)),
    [solicitudesEnriquecidas]
  );

  const pacienteSeleccionado = pacientesPorId.get(Number(listaForm.pacienteId));

  const pacientesFiltrados = useMemo(() => {
    const texto = normalizar(busquedaPacientes);
    if (!texto) return pacientes;

    return pacientes.filter((paciente) =>
      normalizar(`${paciente.rut} ${paciente.nombre} ${paciente.email} ${paciente.telefono}`).includes(texto)
    );
  }, [pacientes, busquedaPacientes]);

  const pacientesParaSolicitud = useMemo(() => {
    const texto = normalizar(busquedaSolicitud);
    if (!texto) return pacientes.slice(0, 5);

    return pacientes
      .filter((paciente) =>
        normalizar(`${paciente.rut} ${paciente.nombre} ${paciente.email} ${paciente.telefono}`).includes(texto)
      )
      .slice(0, 6);
  }, [pacientes, busquedaSolicitud]);

  const citasFiltradas = useMemo(() => {
    const texto = normalizar(busquedaCitas);
    if (!texto) return solicitudesActivas;

    return solicitudesActivas.filter((solicitud) =>
      normalizar(
        `${solicitud.id} ${solicitud.especialidad} ${solicitud.prioridad} ${solicitud.paciente?.rut} ${solicitud.paciente?.nombre}`
      ).includes(texto)
    );
  }, [solicitudesActivas, busquedaCitas]);

  const notificacionesFiltradas = useMemo(() => {
    const texto = normalizar(busquedaNotificaciones);
    const enriquecidas = notificaciones.map((notificacion) => ({
      ...notificacion,
      paciente: pacientesPorId.get(Number(notificacion.pacienteId))
    }));

    if (!texto) return enriquecidas;

    return enriquecidas.filter((notificacion) =>
      normalizar(
        `${notificacion.canal} ${notificacion.estado} ${notificacion.mensaje} ${notificacion.paciente?.nombre} ${notificacion.paciente?.rut}`
      ).includes(texto)
    );
  }, [notificaciones, pacientesPorId, busquedaNotificaciones]);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
  };

  const cargarDatos = useCallback(async () => {
    setCargandoDatos(true);

    try {
      const datos = await rednorteApi.cargarDatos();
      setPacientes(datos.pacientes);
      setListas(datos.listas);
      setReasignaciones(datos.reasignaciones);
      setNotificaciones(datos.notificaciones);
    } catch (error) {
      console.error("Error cargando datos", error);
      mostrarMensaje("error", obtenerMensajeError(error, "No se pudieron cargar los datos."));
    } finally {
      setCargandoDatos(false);
    }
  }, []);

  const actualizarPaciente = (campo, valor) => {
    setPacienteForm((prev) => ({ ...prev, [campo]: valor }));
    setErroresPaciente((prev) => ({ ...prev, [campo]: "" }));
  };

  const actualizarLista = (campo, valor) => {
    setListaForm((prev) => ({ ...prev, [campo]: valor }));
    setErroresLista((prev) => ({ ...prev, [campo]: "" }));
  };

  const seleccionarPacienteSolicitud = (paciente) => {
    setListaForm((prev) => ({ ...prev, pacienteId: String(paciente.id) }));
    setBusquedaSolicitud(`${paciente.rut} - ${paciente.nombre}`);
    setErroresLista((prev) => ({ ...prev, pacienteId: "" }));
  };

  const crearPaciente = async (e) => {
    e.preventDefault();
    const errores = validarPacienteForm(pacienteForm);

    if (Object.keys(errores).length > 0) {
      setErroresPaciente(errores);
      mostrarMensaje("error", "Revisa los campos marcados antes de crear el paciente.");
      return;
    }

    setGuardandoPaciente(true);
    setMensaje(null);

    try {
      await rednorteApi.crearPaciente({
        rut: pacienteForm.rut.trim(),
        nombre: pacienteForm.nombre.trim(),
        email: pacienteForm.email.trim(),
        telefono: pacienteForm.telefono.trim(),
        direccion: pacienteForm.direccion.trim()
      });

      setPacienteForm(estadoInicialPaciente);
      setErroresPaciente({});
      mostrarMensaje("exito", "Paciente creado correctamente.");
      await cargarDatos();
    } catch (error) {
      console.error("Error creando paciente:", error);
      mostrarMensaje("error", obtenerMensajeError(error, "No se pudo crear el paciente."));
    } finally {
      setGuardandoPaciente(false);
    }
  };

  const crearSolicitud = async (e) => {
    e.preventDefault();
    const errores = validarSolicitudForm(listaForm);

    if (Object.keys(errores).length > 0) {
      setErroresLista(errores);
      mostrarMensaje("error", "Revisa los campos marcados antes de crear la solicitud.");
      return;
    }

    setGuardandoSolicitud(true);
    setMensaje(null);

    try {
      await rednorteApi.crearSolicitud({
        pacienteId: Number(listaForm.pacienteId),
        especialidad: listaForm.especialidad.trim(),
        prioridad: listaForm.prioridad
      });

      setListaForm(estadoInicialLista);
      setBusquedaSolicitud("");
      setErroresLista({});
      mostrarMensaje("exito", "Solicitud incorporada a la lista de espera.");
      await cargarDatos();
    } catch (error) {
      console.error("Error creando solicitud:", error);
      mostrarMensaje("error", obtenerMensajeError(error, "No se pudo crear la solicitud."));
    } finally {
      setGuardandoSolicitud(false);
    }
  };

  const cancelarCita = async (solicitud) => {
    setCancelandoCitaId(solicitud.id);
    setMensaje(null);

    try {
      await rednorteApi.cancelarCita({
        citaId: String(solicitud.id),
        pacienteId: String(solicitud.pacienteId),
        especialidad: solicitud.especialidad,
        fecha: fechaDesdeSolicitud(solicitud)
      });

      setListas((actuales) =>
        actuales.map((item) => (Number(item.id) === Number(solicitud.id) ? { ...item, estado: "CANCELADA" } : item))
      );
      mostrarMensaje("exito", `Cita ${solicitud.id} cancelada. Reasignacion y notificaciones en proceso.`);
      setTimeout(cargarDatos, 1000);
    } catch (error) {
      console.error("Error cancelando cita:", error);
      mostrarMensaje("error", obtenerMensajeError(error, "No se pudo cancelar la cita."));
    } finally {
      setCancelandoCitaId(null);
    }
  };

  useEffect(() => {
    const cargaInicial = window.setTimeout(cargarDatos, 0);
    return () => window.clearTimeout(cargaInicial);
  }, [cargarDatos]);

  useEffect(() => {
    if (!mensaje) return undefined;

    const cierreMensaje = window.setTimeout(() => setMensaje(null), 4500);
    return () => window.clearTimeout(cierreMensaje);
  }, [mensaje]);

  return {
    acciones: {
      actualizarLista,
      actualizarPaciente,
      cancelarCita,
      cargarDatos,
      crearPaciente,
      crearSolicitud,
      seleccionarPacienteSolicitud
    },
    busquedas: {
      busquedaCitas,
      busquedaNotificaciones,
      busquedaPacientes,
      busquedaSolicitud,
      setBusquedaCitas,
      setBusquedaNotificaciones,
      setBusquedaPacientes,
      setBusquedaSolicitud
    },
    colecciones: {
      citasFiltradas,
      notificaciones,
      notificacionesFiltradas,
      pacientes,
      pacientesFiltrados,
      pacientesParaSolicitud,
      pacientesPorId,
      reasignaciones,
      solicitudesActivas
    },
    estado: {
      cancelandoCitaId,
      cargandoDatos,
      erroresLista,
      erroresPaciente,
      guardandoPaciente,
      guardandoSolicitud,
      listaForm,
      mensaje,
      pacienteForm,
      pacienteSeleccionado
    }
  };
}
