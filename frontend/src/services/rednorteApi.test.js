import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_URL } from "../config/api";
import { rednorteApi } from "./rednorteApi";

vi.mock("axios");

const STORAGE_KEY = "rednorte_user";

describe("rednorteApi", () => {
  beforeEach(() => {
    localStorage.clear();
    axios.get.mockResolvedValue({ data: {} });
    axios.post.mockResolvedValue({ data: {} });
    axios.delete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("login envía POST a /auth/login con username y password, sin headers de auth", () => {
    rednorteApi.login("user1", "pass1");
    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/auth/login`, {
      username: "user1",
      password: "pass1",
    });
  });

  describe("cuando hay un usuario autenticado en localStorage", () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: "abc123" }));
    });

    it("cargarDatos llama a los 5 endpoints con el header Authorization y combina las respuestas", async () => {
      axios.get.mockImplementation((url) => {
        if (url === `${API_URL}/bff/dashboard`) return Promise.resolve({ data: { totalPacientes: 1 } });
        if (url === `${API_URL}/pacientes`) return Promise.resolve({ data: [{ id: 1 }] });
        if (url === `${API_URL}/bff/lista-espera/completa`) return Promise.resolve({ data: [{ id: 2 }] });
        if (url === `${API_URL}/reasignaciones`) return Promise.resolve({ data: [{ id: 3 }] });
        if (url === `${API_URL}/notificaciones`) return Promise.resolve({ data: [{ id: 4 }] });
        return Promise.resolve({ data: null });
      });

      const resultado = await rednorteApi.cargarDatos();

      expect(axios.get).toHaveBeenCalledTimes(5);
      const headers = { Authorization: "Bearer abc123" };
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/bff/dashboard`, { headers });
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/pacientes`, { headers });
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/bff/lista-espera/completa`, { headers });
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/reasignaciones`, { headers });
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/notificaciones`, { headers });

      expect(resultado).toEqual({
        dashboardStats: { totalPacientes: 1 },
        pacientes: [{ id: 1 }],
        listas: [{ id: 2 }],
        reasignaciones: [{ id: 3 }],
        notificaciones: [{ id: 4 }],
      });
    });

    it("crearPaciente envía POST a /pacientes con el body y headers de auth", () => {
      const paciente = { rut: "12345678-9" };
      rednorteApi.crearPaciente(paciente);
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/pacientes`, paciente, {
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("crearSolicitud envía POST a /listas-espera con el body y headers de auth", () => {
      const solicitud = { pacienteId: 1, especialidad: "Cardiología" };
      rednorteApi.crearSolicitud(solicitud);
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/listas-espera`, solicitud, {
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("cancelarCita envía POST con querystring de params y headers de auth", () => {
      rednorteApi.cancelarCita({ citaId: "5", pacienteId: "10" });
      const expectedUrl = `${API_URL}/listas-espera/cancelar-cita?${new URLSearchParams({
        citaId: "5",
        pacienteId: "10",
      }).toString()}`;
      expect(axios.post).toHaveBeenCalledWith(expectedUrl, null, {
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("eliminarPaciente envía DELETE a /pacientes/:id con headers de auth", () => {
      rednorteApi.eliminarPaciente(7);
      expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/pacientes/7`, {
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("salaDelDia envía GET a /bff/sala-del-dia con fecha como param", () => {
      rednorteApi.salaDelDia("2024-01-01");
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/bff/sala-del-dia`, {
        params: { fecha: "2024-01-01" },
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("listaEsperaPendiente envía GET a /bff/lista-espera", () => {
      rednorteApi.listaEsperaPendiente();
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/bff/lista-espera`, {
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("ofertas envía GET a /bff/ofertas", () => {
      rednorteApi.ofertas();
      expect(axios.get).toHaveBeenCalledWith(`${API_URL}/bff/ofertas`, {
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("agendarCita envía POST a /citas/agendar con solicitudId, fecha y hora", () => {
      rednorteApi.agendarCita(3, "2024-01-01", "09:00");
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/citas/agendar`,
        { solicitudId: 3, fecha: "2024-01-01", hora: "09:00" },
        { headers: { Authorization: "Bearer abc123" } }
      );
    });

    it("checkIn envía POST a /citas/:id/check-in", () => {
      rednorteApi.checkIn(9);
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/citas/9/check-in`, null, {
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("noShow envía POST a /citas/:id/no-show", () => {
      rednorteApi.noShow(9);
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/citas/9/no-show`, null, {
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("atenderCita envía POST a /citas/:id/atender", () => {
      rednorteApi.atenderCita(9);
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/citas/9/atender`, null, {
        headers: { Authorization: "Bearer abc123" },
      });
    });

    it("revisarVencidas envía POST a /ofertas/revisar-vencidas", () => {
      rednorteApi.revisarVencidas();
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/ofertas/revisar-vencidas`, null, {
        headers: { Authorization: "Bearer abc123" },
      });
    });
  });

  describe("cuando no hay usuario en localStorage", () => {
    it("usa headers vacíos", () => {
      rednorteApi.checkIn(1);
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/citas/1/check-in`, null, { headers: {} });
    });

    it("usa headers vacíos si el contenido de localStorage no es JSON válido", () => {
      localStorage.setItem(STORAGE_KEY, "no-es-json");
      rednorteApi.checkIn(1);
      expect(axios.post).toHaveBeenCalledWith(`${API_URL}/citas/1/check-in`, null, { headers: {} });
    });
  });
});
