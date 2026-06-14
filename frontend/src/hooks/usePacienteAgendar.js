import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { rednorteApi } from "../services/rednorteApi";
import { hoy } from "../utils/date";
import { obtenerMensajeError } from "../utils/errors";

export const PASOS_AGENDAR = ["Tu solicitud", "Fecha y hora"];

export function usePacienteAgendar() {
  const { user } = useAuth();

  const [solicitudes, setSolicitudes]       = useState([]);
  const [cargandoSol, setCargandoSol]       = useState(false);
  const [solicitudActiva, setSolicitudActiva] = useState(null);
  const [step, setStep]                     = useState(0);

  const [wizardFecha, setWizardFecha]       = useState(hoy());
  const [wizardHora, setWizardHora]         = useState("");
  const [horasOcupadas, setHorasOcupadas]   = useState(new Set());
  const [cargandoHoras, setCargandoHoras]   = useState(false);

  const [agendando, setAgendando]           = useState(false);
  const [citaAgendada, setCitaAgendada]     = useState(null);
  const [banner, setBanner]                 = useState(null);

  const mostrar = (tipo, texto) => {
    setBanner({ tipo, texto });
    if (tipo !== "exito") setTimeout(() => setBanner(null), 5000);
  };

  const cargarSolicitudes = useCallback(async () => {
    if (!user?.pacienteRut) return;
    setCargandoSol(true);
    try {
      const res = await rednorteApi.listaEsperaPendiente();
      const mias = res.data.filter((s) => s.pacienteRut === user.pacienteRut);
      setSolicitudes(mias);
      if (mias.length === 1) setSolicitudActiva(mias[0]);
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "No se pudieron cargar tus solicitudes."));
    } finally {
      setCargandoSol(false);
    }
  }, [user?.pacienteRut]);

  useEffect(() => { cargarSolicitudes(); }, [cargarSolicitudes]);

  const cargarHoras = useCallback(async (f, esp) => {
    setCargandoHoras(true);
    try {
      const res = await rednorteApi.salaDelDia(f);
      const ocupadas = new Set(
        res.data
          .filter((c) => c.especialidad === esp
            && c.estado !== "CANCELADA"
            && c.estado !== "NO_SHOW")
          .map((c) => c.hora)
      );
      setHorasOcupadas(ocupadas);
    } catch {
      setHorasOcupadas(new Set());
    } finally {
      setCargandoHoras(false);
    }
  }, []);

  // Reload hours when date changes in step 1
  useEffect(() => {
    if (step === 1 && solicitudActiva) {
      setWizardHora("");
      cargarHoras(wizardFecha, solicitudActiva.especialidad);
    }
  }, [wizardFecha, step, solicitudActiva, cargarHoras]);

  const irAPaso1 = (s) => {
    setSolicitudActiva(s);
    setStep(1);
    setWizardHora("");
    cargarHoras(wizardFecha, s.especialidad);
  };

  const volverAtras = () => {
    setStep(0);
    setWizardHora("");
    if (solicitudes.length > 1) setSolicitudActiva(null);
  };

  const doAgendar = async () => {
    if (!wizardHora || !solicitudActiva) return;
    setAgendando(true);
    try {
      await rednorteApi.agendarCita(solicitudActiva.id, wizardFecha, wizardHora);
      setCitaAgendada({ especialidad: solicitudActiva.especialidad, fecha: wizardFecha, hora: wizardHora });
      mostrar("exito", `Cita confirmada: ${solicitudActiva.especialidad} el ${wizardFecha} a las ${wizardHora}.`);
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "No se pudo agendar. Es posible que la hora ya esté ocupada."));
    } finally {
      setAgendando(false);
    }
  };

  return {
    solicitudes, cargandoSol,
    solicitudActiva, setSolicitudActiva,
    step,
    wizardFecha, setWizardFecha,
    wizardHora, setWizardHora,
    horasOcupadas, cargandoHoras,
    agendando, citaAgendada,
    banner,
    irAPaso1,
    volverAtras,
    doAgendar,
  };
}
