import axios from "axios";
import { API_URL } from "../config/api";

const STORAGE_KEY = "rednorte_user";

function authHeaders() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { token } = JSON.parse(stored);
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // ignore
  }
  return {};
}

export const rednorteApi = {
  login(username, password) {
    return axios.post(`${API_URL}/auth/login`, { username, password });
  },

  async cargarDatos() {
    const headers = authHeaders();
    const [pacientes, listas, reasignaciones, notificaciones] = await Promise.all([
      axios.get(`${API_URL}/pacientes`,       { headers }),
      axios.get(`${API_URL}/listas-espera`,   { headers }),
      axios.get(`${API_URL}/reasignaciones`,  { headers }),
      axios.get(`${API_URL}/notificaciones`,  { headers }),
    ]);
    return {
      pacientes:     pacientes.data,
      listas:        listas.data,
      reasignaciones: reasignaciones.data,
      notificaciones: notificaciones.data,
    };
  },

  crearPaciente(paciente) {
    return axios.post(`${API_URL}/pacientes`, paciente, { headers: authHeaders() });
  },

  crearSolicitud(solicitud) {
    return axios.post(`${API_URL}/listas-espera`, solicitud, { headers: authHeaders() });
  },

  cancelarCita(params) {
    return axios.post(
      `${API_URL}/listas-espera/cancelar-cita?${new URLSearchParams(params).toString()}`,
      null,
      { headers: authHeaders() }
    );
  },

  eliminarPaciente(id) {
    return axios.delete(`${API_URL}/pacientes/${id}`, { headers: authHeaders() });
  },
};
