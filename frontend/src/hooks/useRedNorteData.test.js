import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rednorteApi } from "../services/rednorteApi";
import { useRedNorteData } from "./useRedNorteData";

vi.mock("../services/rednorteApi", () => ({
  rednorteApi: {
    cargarDatos: vi.fn(),
    crearPaciente: vi.fn(),
    crearSolicitud: vi.fn(),
    cancelarCita: vi.fn(),
    eliminarPaciente: vi.fn(),
  },
}));

const pacientes = [
  {
    id: 1,
    rut: "11111111-1",
    nombres: "Juan",
    apellidoPaterno: "Perez",
    apellidoMaterno: "Soto",
    email: "juan@correo.cl",
    telefono: "+56911112222",
  },
  {
    id: 2,
    rut: "22222222-2",
    nombres: "Ana",
    apellidoPaterno: "Lopez",
    apellidoMaterno: "Diaz",
    email: "ana@correo.cl",
    telefono: "+56933334444",
  },
];

const listas = [
  { id: 100, pacienteId: 1, especialidad: "Cardiología", prioridad: "NORMAL", estado: "PENDIENTE", fechaRegistro: "2024-01-01T00:00:00" },
  { id: 101, pacienteId: 2, especialidad: "Dermatología", prioridad: "ALTA", estado: "CANCELADA", fechaRegistro: "2024-01-02T00:00:00" },
];

const notificaciones = [
  { id: 200, pacienteId: 1, canal: "EMAIL", estado: "ENVIADA", mensaje: "Su cita fue confirmada" },
];

const datosBase = {
  dashboardStats: { totalPacientes: 2, totalSolicitudes: 2 },
  pacientes,
  listas,
  reasignaciones: [{ id: 1, motivo: "no-show" }],
  notificaciones,
};

const pacienteFormValido = {
  rut: "33333333-3",
  nombres: "Carlos",
  apellidoPaterno: "Diaz",
  apellidoMaterno: "Soto",
  fechaNacimiento: "1990-01-01",
  sexo: "MASCULINO",
  prevision: "FONASA",
  email: "carlos@correo.cl",
  telefono: "+56955556666",
  direccion: "Av. Siempre Viva 742",
};

describe("useRedNorteData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rednorteApi.cargarDatos.mockResolvedValue(datosBase);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("carga los datos automáticamente al montar y expone las colecciones", async () => {
    const { result } = renderHook(() => useRedNorteData());

    await waitFor(() => expect(rednorteApi.cargarDatos).toHaveBeenCalled());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    expect(result.current.colecciones.dashboardStats.totalPacientes).toBe(2);
    expect(result.current.colecciones.reasignaciones).toHaveLength(1);
    expect(result.current.colecciones.notificaciones).toHaveLength(1);
    expect(result.current.estado.cargandoDatos).toBe(false);
  });

  it("solicitudesActivas excluye las canceladas y se enriquecen con el paciente", async () => {
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    const activas = result.current.colecciones.solicitudesActivas;
    expect(activas).toHaveLength(1);
    expect(activas[0].id).toBe(100);
    expect(activas[0].paciente.nombres).toBe("Juan");
  });

  it("pacientesFiltrados filtra por texto normalizado de búsqueda", async () => {
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    act(() => result.current.busquedas.setBusquedaPacientes("ana"));
    expect(result.current.colecciones.pacientesFiltrados).toHaveLength(1);
    expect(result.current.colecciones.pacientesFiltrados[0].nombres).toBe("Ana");

    act(() => result.current.busquedas.setBusquedaPacientes(""));
    expect(result.current.colecciones.pacientesFiltrados).toHaveLength(2);
  });

  it("notificacionesFiltradas enriquece con paciente y filtra por texto", async () => {
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    expect(result.current.colecciones.notificacionesFiltradas[0].paciente.nombres).toBe("Juan");

    act(() => result.current.busquedas.setBusquedaNotificaciones("no-existe-nada"));
    expect(result.current.colecciones.notificacionesFiltradas).toHaveLength(0);
  });

  it("actualizarPaciente actualiza el form y limpia el error del campo", async () => {
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    act(() => result.current.acciones.actualizarPaciente("nombres", "Pedro"));
    expect(result.current.estado.pacienteForm.nombres).toBe("Pedro");
  });

  it("crearPaciente con formulario inválido seteo errores y no llama a la API", async () => {
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    await act(async () => {
      await result.current.acciones.crearPaciente({ preventDefault: () => {} });
    });

    expect(rednorteApi.crearPaciente).not.toHaveBeenCalled();
    expect(Object.keys(result.current.estado.erroresPaciente).length).toBeGreaterThan(0);
    expect(result.current.estado.mensaje).toEqual({
      tipo: "error",
      texto: "Revisa los campos marcados antes de crear el paciente.",
    });
  });

  it("crearPaciente con formulario válido llama a la API, resetea el form y recarga datos", async () => {
    rednorteApi.crearPaciente.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    act(() => {
      Object.entries(pacienteFormValido).forEach(([campo, valor]) => {
        result.current.acciones.actualizarPaciente(campo, valor);
      });
    });

    await act(async () => {
      await result.current.acciones.crearPaciente({ preventDefault: () => {} });
    });

    expect(rednorteApi.crearPaciente).toHaveBeenCalledWith(
      expect.objectContaining({ rut: "33333333-3", nombres: "Carlos" })
    );
    expect(result.current.estado.pacienteForm.rut).toBe("");
    expect(result.current.estado.mensaje).toEqual({ tipo: "exito", texto: "Paciente creado correctamente." });
    expect(rednorteApi.cargarDatos).toHaveBeenCalledTimes(2);
  });

  it("crearPaciente maneja errores de la API mostrando el mensaje correspondiente", async () => {
    rednorteApi.crearPaciente.mockRejectedValue({ response: { data: { message: "RUT duplicado" } } });
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    act(() => {
      Object.entries(pacienteFormValido).forEach(([campo, valor]) => {
        result.current.acciones.actualizarPaciente(campo, valor);
      });
    });

    await act(async () => {
      await result.current.acciones.crearPaciente({ preventDefault: () => {} });
    });

    expect(result.current.estado.mensaje).toEqual({ tipo: "error", texto: "RUT duplicado" });
    expect(result.current.estado.guardandoPaciente).toBe(false);
  });

  it("eliminarPaciente quita al paciente de la colección en éxito", async () => {
    rednorteApi.eliminarPaciente.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    await act(async () => {
      await result.current.acciones.eliminarPaciente(1);
    });

    expect(result.current.colecciones.pacientes).toHaveLength(1);
    expect(result.current.estado.mensaje).toEqual({ tipo: "exito", texto: "Paciente eliminado correctamente." });
  });

  it("eliminarPaciente muestra error cuando la API falla", async () => {
    rednorteApi.eliminarPaciente.mockRejectedValue({ message: "fallo de red" });
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    await act(async () => {
      await result.current.acciones.eliminarPaciente(1);
    });

    expect(result.current.estado.mensaje).toEqual({ tipo: "error", texto: "fallo de red" });
  });

  it("seleccionarPacienteSolicitud rellena el formulario de lista y la búsqueda", async () => {
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    act(() => result.current.acciones.seleccionarPacienteSolicitud(pacientes[0]));

    expect(result.current.estado.listaForm.pacienteId).toBe("1");
    expect(result.current.busquedas.busquedaSolicitud).toContain("Juan");
  });

  it("crearSolicitud con formulario inválido no llama a la API", async () => {
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    await act(async () => {
      await result.current.acciones.crearSolicitud({ preventDefault: () => {} });
    });

    expect(rednorteApi.crearSolicitud).not.toHaveBeenCalled();
    expect(Object.keys(result.current.estado.erroresLista).length).toBeGreaterThan(0);
  });

  it("crearSolicitud válida llama a la API y recarga datos", async () => {
    rednorteApi.crearSolicitud.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    act(() => {
      result.current.acciones.actualizarLista("pacienteId", "1");
      result.current.acciones.actualizarLista("especialidad", "Pediatría");
    });

    await act(async () => {
      await result.current.acciones.crearSolicitud({ preventDefault: () => {} });
    });

    expect(rednorteApi.crearSolicitud).toHaveBeenCalledWith({
      pacienteId: 1,
      especialidad: "Pediatría",
      prioridad: "NORMAL",
    });
    expect(result.current.estado.mensaje).toEqual({
      tipo: "exito",
      texto: "Solicitud incorporada a la lista de espera.",
    });
  });

  it("crearSolicitud maneja error de la API", async () => {
    rednorteApi.crearSolicitud.mockRejectedValue({ message: "fallo solicitud" });
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    act(() => {
      result.current.acciones.actualizarLista("pacienteId", "1");
      result.current.acciones.actualizarLista("especialidad", "Pediatría");
    });

    await act(async () => {
      await result.current.acciones.crearSolicitud({ preventDefault: () => {} });
    });

    expect(result.current.estado.mensaje).toEqual({ tipo: "error", texto: "fallo solicitud" });
  });

  it("cancelarCita marca la solicitud como CANCELADA en éxito", async () => {
    rednorteApi.cancelarCita.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    await act(async () => {
      await result.current.acciones.cancelarCita({ id: 100, pacienteId: 1, especialidad: "Cardiología", fechaRegistro: "2024-01-01T00:00:00" });
    });

    expect(rednorteApi.cancelarCita).toHaveBeenCalledWith({
      citaId: "100",
      pacienteId: "1",
      especialidad: "Cardiología",
      fecha: "2024-01-01",
    });
    expect(result.current.colecciones.solicitudesActivas.find((s) => s.id === 100)).toBeUndefined();
    expect(result.current.estado.mensaje.tipo).toBe("exito");
  });

  it("cancelarCita maneja error de la API y limpia cancelandoCitaId", async () => {
    rednorteApi.cancelarCita.mockRejectedValue({ message: "no se pudo cancelar" });
    const { result } = renderHook(() => useRedNorteData());
    await waitFor(() => expect(result.current.colecciones.pacientes).toHaveLength(2));

    await act(async () => {
      await result.current.acciones.cancelarCita({ id: 100, pacienteId: 1, especialidad: "Cardiología", fechaRegistro: "2024-01-01T00:00:00" });
    });

    expect(result.current.estado.mensaje).toEqual({ tipo: "error", texto: "no se pudo cancelar" });
    expect(result.current.estado.cancelandoCitaId).toBeNull();
  });

  it("cargarDatos maneja error y expone el mensaje correspondiente", async () => {
    rednorteApi.cargarDatos.mockReset();
    rednorteApi.cargarDatos.mockRejectedValue({ message: "error de carga" });
    const { result } = renderHook(() => useRedNorteData());

    await waitFor(() => expect(result.current.estado.mensaje).toEqual({ tipo: "error", texto: "error de carga" }));
    expect(result.current.estado.cargandoDatos).toBe(false);
  });
});
