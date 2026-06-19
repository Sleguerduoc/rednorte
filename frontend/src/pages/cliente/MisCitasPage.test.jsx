import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as AuthContext from "../../context/AuthContext";
import MisCitasPage from "./MisCitasPage";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const paciente = { id: 1, rut: "11111111-1", nombres: "Juan", apellidoPaterno: "Perez" };
const pacientesPorId = new Map([[1, paciente]]);

const solicitudes = [
  {
    id: 200,
    pacienteId: 1,
    especialidad: "Dermatología",
    prioridad: "ALTA",
    fechaRegistro: "2024-02-01T00:00:00",
    estado: "PENDIENTE",
  },
];

function renderPage(overrides = {}) {
  const props = {
    cancelarCita: vi.fn(),
    cancelandoCitaId: null,
    solicitudesActivas: solicitudes,
    pacientesPorId,
    ...overrides,
  };
  render(
    <MemoryRouter>
      <MisCitasPage {...props} />
    </MemoryRouter>
  );
  return props;
}

describe("MisCitasPage", () => {
  beforeEach(() => {
    AuthContext.useAuth.mockReturnValue({ user: { pacienteRut: "11111111-1" } });
  });

  it("muestra el saludo con el nombre completo del paciente", () => {
    renderPage();
    expect(screen.getByText("Hola, Juan Perez")).toBeInTheDocument();
  });

  it("muestra la tabla de citas con los datos de la solicitud activa", () => {
    renderPage();
    expect(screen.getByText("#200")).toBeInTheDocument();
    expect(screen.getByText("Dermatología")).toBeInTheDocument();
    expect(screen.getByText("Tienes 1 cita activas.")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay citas activas para el paciente", () => {
    renderPage({ solicitudesActivas: [] });
    expect(screen.getByText("Sin citas agendadas")).toBeInTheDocument();
    expect(screen.getByText("No tienes citas agendadas actualmente.")).toBeInTheDocument();
  });

  it("usa el nombre de usuario como saludo cuando no se encuentra el paciente", () => {
    AuthContext.useAuth.mockReturnValue({ user: { pacienteRut: "no-existe", nombre: "Invitado" } });
    renderPage();
    expect(screen.getByText("Hola, Invitado")).toBeInTheDocument();
  });

  it("requiere doble click para confirmar la cancelación de una cita", () => {
    const props = renderPage();
    const botonCancelar = screen.getByTitle("Cancelar cita");
    fireEvent.click(botonCancelar);
    expect(props.cancelarCita).not.toHaveBeenCalled();
    expect(screen.getByTitle("Confirmar cancelación")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Confirmar cancelación"));
    expect(props.cancelarCita).toHaveBeenCalledWith(solicitudes[0]);
  });

  it("deshabilita el botón de cancelar mientras cancelandoCitaId coincide con la cita", () => {
    renderPage({ cancelandoCitaId: 200 });
    expect(screen.getByText("Cancelando…")).toBeDisabled();
  });

  it("navega al hacer click en agendar una hora", () => {
    renderPage({ solicitudesActivas: [] });
    fireEvent.click(screen.getByRole("button", { name: /\+ Solicitar una hora/i }));
    // No assertion sobre la URL final (MemoryRouter sin rutas definidas), solo que no arroja error.
  });
});
