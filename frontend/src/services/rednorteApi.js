import axios from "axios";
import { API_URL } from "../config/api";

export const rednorteApi = {
  async cargarDatos() {
    const [pacientes, listas, reasignaciones, notificaciones] = await Promise.all([
      axios.get(`${API_URL}/pacientes`),
      axios.get(`${API_URL}/listas-espera`),
      axios.get(`${API_URL}/reasignaciones`),
      axios.get(`${API_URL}/notificaciones`)
    ]);

    return {
      pacientes: pacientes.data,
      listas: listas.data,
      reasignaciones: reasignaciones.data,
      notificaciones: notificaciones.data
    };
  },

  crearPaciente(paciente) {
    return axios.post(`${API_URL}/pacientes`, paciente);
  },

  crearSolicitud(solicitud) {
    return axios.post(`${API_URL}/listas-espera`, solicitud);
  },

  cancelarCita(params) {
    return axios.post(`${API_URL}/listas-espera/cancelar-cita?${new URLSearchParams(params).toString()}`);
  }
};
