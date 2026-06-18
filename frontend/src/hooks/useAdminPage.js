import { useCallback, useEffect, useState } from "react";
import { ESPECIALIDADES } from "../constants/domain";
import { rednorteApi } from "../services/rednorteApi";
import { hoy } from "../utils/date";
import { obtenerMensajeError } from "../utils/errors";

export function useAdminPage() {
  const [tab, setTab] = useState("sala");
  const [banner, setBanner] = useState(null);

  // ── Sala del día ────────────────────────────────────────────────
  const [fecha, setFecha]               = useState(hoy());
  const [especialidad, setEspecialidad] = useState(ESPECIALIDADES[0]);
  const [citas, setCitas]               = useState([]);
  const [cargandoSala, setCargandoSala] = useState(false);
  const [cupoLiberado, setCupoLiberado] = useState(false);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  // ── Lista de espera ─────────────────────────────────────────────
  const [solicitudes, setSolicitudes]       = useState([]);
  const [cargandoLista, setCargandoLista]   = useState(false);

  // ── Ofertas ─────────────────────────────────────────────────────
  const [ofertas, setOfertas]             = useState([]);
  const [cargandoOfertas, setCargandoOfertas] = useState(false);

  // ── Wizard ──────────────────────────────────────────────────────
  const [wizard, setWizard]             = useState(null); // { solicitud }
  const [wizardStep, setWizardStep]     = useState(0);
  const [wizardFecha, setWizardFecha]   = useState(hoy());
  const [wizardHora, setWizardHora]     = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState(new Set());
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [agendando, setAgendando]       = useState(false);

  const mostrar = (tipo, texto) => {
    setBanner({ tipo, texto });
    setTimeout(() => setBanner(null), tipo === "error" ? 7000 : 5000);
  };

  // ── Loaders ─────────────────────────────────────────────────────
  const cargarSala = useCallback(async () => {
    setCargandoSala(true);
    try {
      const res = await rednorteApi.salaDelDia(fecha);
      setCitas(res.data);
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "No se pudo cargar la sala del día."));
    } finally {
      setCargandoSala(false);
    }
  }, [fecha]);

  const cargarLista = useCallback(async () => {
    setCargandoLista(true);
    try {
      const res = await rednorteApi.listaEsperaPendiente();
      setSolicitudes(res.data);
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "No se pudo cargar la lista de espera."));
    } finally {
      setCargandoLista(false);
    }
  }, []);

  const cargarOfertas = useCallback(async () => {
    setCargandoOfertas(true);
    try {
      const res = await rednorteApi.ofertas();
      setOfertas(res.data);
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "No se pudo cargar las ofertas."));
    } finally {
      setCargandoOfertas(false);
    }
  }, []);

  useEffect(() => { cargarSala(); }, [cargarSala]);
  useEffect(() => { if (tab === "lista")   cargarLista();   }, [tab, cargarLista]);
  useEffect(() => { if (tab === "ofertas") cargarOfertas(); }, [tab, cargarOfertas]);

  // ── Acciones de sala ────────────────────────────────────────────
  const doCheckIn = async (citaId) => {
    setCargandoAccion(true);
    try {
      await rednorteApi.checkIn(citaId);
      mostrar("exito", "Check-in registrado.");
      cargarSala();
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "Error al registrar check-in."));
    } finally {
      setCargandoAccion(false);
    }
  };

  const doNoShow = async (citaId) => {
    setCargandoAccion(true);
    try {
      await rednorteApi.noShow(citaId);
      mostrar("exito", "No-show registrado. El sistema buscará candidatos para el cupo liberado.");
      setCupoLiberado(true);
      cargarSala();
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "Error al registrar no-show."));
    } finally {
      setCargandoAccion(false);
    }
  };

  const doAtender = async (citaId) => {
    setCargandoAccion(true);
    try {
      await rednorteApi.atenderCita(citaId);
      mostrar("exito", "Cita marcada como atendida.");
      cargarSala();
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "Error al marcar como atendida."));
    } finally {
      setCargandoAccion(false);
    }
  };

  // ── Acción de ofertas ───────────────────────────────────────────
  const doRevisarVencidas = async () => {
    try {
      await rednorteApi.revisarVencidas();
      mostrar("exito", "Ofertas vencidas procesadas. Se notificará al siguiente candidato.");
      cargarOfertas();
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "Error al revisar ofertas vencidas."));
    }
  };

  // ── Wizard ──────────────────────────────────────────────────────
  const abrirWizard = (solicitud) => {
    setWizard({ solicitud });
    setWizardStep(0);
    setWizardFecha(hoy());
    setWizardHora("");
    setHorasOcupadas(new Set());
  };

  const cerrarWizard = () => setWizard(null);

  const cargarHorasOcupadas = useCallback(async (f, esp) => {
    setCargandoHoras(true);
    try {
      const res = await rednorteApi.salaDelDia(f);
      const ocupadas = new Set(
        res.data.filter((c) => c.especialidad === esp && c.estado !== "CANCELADA").map((c) => c.hora)
      );
      setHorasOcupadas(ocupadas);
    } catch {
      setHorasOcupadas(new Set());
    } finally {
      setCargandoHoras(false);
    }
  }, []);

  const avanzarWizard = () => {
    if (wizardStep === 0) {
      cargarHorasOcupadas(wizardFecha, wizard.solicitud.especialidad);
      setWizardStep(1);
    }
  };

  useEffect(() => {
    if (wizard && wizardStep === 1) {
      setWizardHora("");
      cargarHorasOcupadas(wizardFecha, wizard.solicitud.especialidad);
    }
  }, [wizardFecha, wizard, wizardStep, cargarHorasOcupadas]);

  const doAgendar = async () => {
    if (!wizardHora) { mostrar("error", "Selecciona una hora."); return; }
    setAgendando(true);
    try {
      await rednorteApi.agendarCita(wizard.solicitud.id, wizardFecha, wizardHora);
      mostrar("exito", `Cita agendada: ${wizard.solicitud.especialidad} el ${wizardFecha} a las ${wizardHora}.`);
      cerrarWizard();
      cargarLista();
      if (fecha === wizardFecha) cargarSala();
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "No se pudo agendar la cita."));
    } finally {
      setAgendando(false);
    }
  };

  const citasDeEspecialidad = citas
    .filter((c) => c.especialidad === especialidad)
    .sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));

  return {
    tab, setTab,
    banner,
    // Sala
    fecha, setFecha,
    especialidad, setEspecialidad,
    citas: citasDeEspecialidad,
    cargandoSala,
    cargandoAccion,
    cupoLiberado, setCupoLiberado,
    cargarSala,
    doCheckIn, doNoShow, doAtender,
    // Lista
    solicitudes, cargandoLista, cargarLista,
    // Ofertas
    ofertas, cargandoOfertas, cargarOfertas,
    doRevisarVencidas,
    // Wizard
    wizard,
    wizardStep,
    wizardFecha, setWizardFecha,
    wizardHora, setWizardHora,
    horasOcupadas,
    cargandoHoras,
    agendando,
    abrirWizard, cerrarWizard, avanzarWizard, doAgendar,
  };
}
