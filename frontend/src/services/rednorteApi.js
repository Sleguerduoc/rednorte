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

  /**
   * Carga inicial: usa los endpoints BFF para dashboard y lista de espera.
   * El resto (pacientes, reasignaciones, notificaciones) se llama directamente
   * porque tienen vistas propias que necesitan el detalle completo.
   */
  async cargarDatos() {
    const headers = authHeaders();

    const [bffDashboard, pacientes, bffLista, reasignaciones, notificaciones] = await Promise.all([
      axios.get(`${API_URL}/bff/dashboard`,               { headers }),  // BFF: totales agregados
      axios.get(`${API_URL}/pacientes`,                   { headers }),  // directo: lista completa
      axios.get(`${API_URL}/bff/lista-espera/completa`,   { headers }),  // BFF: solicitudes + paciente
      axios.get(`${API_URL}/reasignaciones`,              { headers }),  // directo: timeline
      axios.get(`${API_URL}/notificaciones`,              { headers }),  // directo: detalle notif
    ]);

    return {
      dashboardStats: bffDashboard.data,
      pacientes:      pacientes.data,
      listas:         bffLista.data,       // ya enriquecidas con pacienteNombre/pacienteRut
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

  // ── Admin / Sala del día ────────────────────────────────────────
  salaDelDia(fecha) {
    return axios.get(`${API_URL}/bff/sala-del-dia`, { params: { fecha }, headers: authHeaders() });
  },

  listaEsperaPendiente() {
    return axios.get(`${API_URL}/bff/lista-espera`, { headers: authHeaders() });
  },

  ofertas() {
    return axios.get(`${API_URL}/bff/ofertas`, { headers: authHeaders() });
  },

  agendarCita(solicitudId, fecha, hora) {
    return axios.post(`${API_URL}/citas/agendar`, { solicitudId, fecha, hora }, { headers: authHeaders() });
  },

  checkIn(citaId) {
    return axios.post(`${API_URL}/citas/${citaId}/check-in`, null, { headers: authHeaders() });
  },

  noShow(citaId) {
    return axios.post(`${API_URL}/citas/${citaId}/no-show`, null, { headers: authHeaders() });
  },

  atenderCita(citaId) {
    return axios.post(`${API_URL}/citas/${citaId}/atender`, null, { headers: authHeaders() });
  },

  revisarVencidas() {
    return axios.post(`${API_URL}/ofertas/revisar-vencidas`, null, { headers: authHeaders() });
  },
};
