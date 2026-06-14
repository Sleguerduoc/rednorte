import { useCallback, useEffect, useState } from "react";
import { ESPECIALIDADES } from "../constants/domain";
import { rednorteApi } from "../services/rednorteApi";
import { hoy } from "../utils/date";
import { obtenerMensajeError } from "../utils/errors";

export function useDoctorAgenda() {
  const [fecha, setFecha]               = useState(hoy());
  const [especialidad, setEspecialidad] = useState(ESPECIALIDADES[0]);
  const [citas, setCitas]               = useState([]);
  const [solicitudes, setSolicitudes]   = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [cargandoSol, setCargandoSol]   = useState(false);
  const [banner, setBanner]             = useState(null);

  const mostrar = (tipo, texto) => {
    setBanner({ tipo, texto });
    setTimeout(() => setBanner(null), 5000);
  };

  const cargarCitas = useCallback(async () => {
    setCargandoCitas(true);
    try {
      const res = await rednorteApi.salaDelDia(fecha);
      setCitas(
        res.data
          .filter((c) => c.especialidad === especialidad)
          .sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""))
      );
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "No se pudo cargar la agenda."));
    } finally {
      setCargandoCitas(false);
    }
  }, [fecha, especialidad]);

  const cargarSolicitudes = useCallback(async () => {
    setCargandoSol(true);
    try {
      const res = await rednorteApi.listaEsperaPendiente();
      setSolicitudes(res.data.filter((s) => s.especialidad === especialidad));
    } catch (e) {
      mostrar("error", obtenerMensajeError(e, "No se pudo cargar la lista de espera."));
    } finally {
      setCargandoSol(false);
    }
  }, [especialidad]);

  useEffect(() => { cargarCitas(); },       [cargarCitas]);
  useEffect(() => { cargarSolicitudes(); }, [cargarSolicitudes]);

  return {
    fecha, setFecha,
    especialidad, setEspecialidad,
    citas, solicitudes,
    cargandoCitas, cargandoSol,
    cargarCitas, cargarSolicitudes,
    banner,
  };
}
