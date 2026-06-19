import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DoctorPage from "./DoctorPage";

const pacientes = [
  {
    id: 1,
    rut: "11111111-1",
    nombres: "Juan",
    apellidoPaterno: "Perez",
    apellidoMaterno: "Soto",
    fechaNacimiento: "1990-01-01",
    sexo: "MASCULINO",
    prevision: "FONASA",
  },
  {
    id: 2,
    rut: "22222222-2",
    nombres: "Ana",
    apellidoPaterno: "Lopez",
    apellidoMaterno: "Diaz",
  },
];

const solicitudes = [
  {
    id: 100,
    pacienteId: 1,
    especialidad: "Cardiología",
    prioridad: "NORMAL",
    fechaRegistro: "2024-01-01T00:00:00",
    estado: "PENDIENTE",
  },
];

function renderPage(overrides = {}) {
  const props = {
    cancelarCita: vi.fn(),
    cancelandoCitaId: null,
    pacientesFiltrados: pacientes,
    solicitudesActivas: solicitudes,
    busquedaPacientes: "",
    setBusquedaPacientes: vi.fn(),
    onAgendar: vi.fn(),
    ...overrides,
  };
  render(<DoctorPage {...props} />);
  return props;
}

describe("DoctorPage", () => {
  it("renderiza la lista de pacientes filtrados", () => {
    renderPage();
    expect(screen.getByText("Juan Perez Soto")).toBeInTheDocument();
    expect(screen.getByText("Ana Lopez Diaz")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay pacientes filtrados", () => {
    renderPage({ pacientesFiltrados: [] });
    expect(screen.getByText("No hay pacientes que coincidan.")).toBeInTheDocument();
  });

  it("llama a setBusquedaPacientes al escribir en el buscador", () => {
    const props = renderPage();
    fireEvent.change(screen.getByPlaceholderText("RUT, nombre o contacto"), {
      target: { value: "juan" },
    });
    expect(props.setBusquedaPacientes).toHaveBeenCalledWith("juan");
  });

  it("llama a onAgendar con el paciente al hacer click en + Agendar", () => {
    const props = renderPage();
    const botones = screen.getAllByRole("button", { name: /\+ Agendar/i });
    fireEvent.click(botones[0]);
    expect(props.onAgendar).toHaveBeenCalledWith(pacientes[0]);
  });

  it("expande y colapsa la lista de citas de un paciente", () => {
    renderPage();
    expect(screen.queryByText("Cardiología")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Ver citas/i })[0]);
    expect(screen.getByText("Cardiología")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Ocultar/i }));
    expect(screen.queryByText("Cardiología")).not.toBeInTheDocument();
  });

  it("muestra 'Sin citas activas' cuando el paciente expandido no tiene citas", () => {
    renderPage();
    const botonesVerCitas = screen.getAllByRole("button", { name: /Ver citas/i });
    fireEvent.click(botonesVerCitas[1]); // paciente Ana sin citas
    expect(screen.getByText("Sin citas activas.")).toBeInTheDocument();
  });

  it("requiere doble click para confirmar la cancelación de una cita", () => {
    const props = renderPage();
    fireEvent.click(screen.getAllByRole("button", { name: /Ver citas/i })[0]);

    const botonCancelar = screen.getByTitle("Cancelar cita");
    fireEvent.click(botonCancelar);
    expect(props.cancelarCita).not.toHaveBeenCalled();
    expect(screen.getByTitle("Confirmar cancelación")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Confirmar cancelación"));
    expect(props.cancelarCita).toHaveBeenCalledWith(solicitudes[0]);
  });

  it("deshabilita el botón de cancelar cuando cancelandoCitaId coincide", () => {
    renderPage({ cancelandoCitaId: 100 });
    fireEvent.click(screen.getAllByRole("button", { name: /Ver citas/i })[0]);
    expect(screen.getByText("Cancelando…")).toBeDisabled();
  });
});
