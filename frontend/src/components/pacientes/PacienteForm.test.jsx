import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { estadoInicialPaciente } from "../../constants/domain";
import PacienteForm from "./PacienteForm";

function renderForm(overrides = {}) {
  const props = {
    actualizarPaciente: vi.fn(),
    crearPaciente: vi.fn((e) => e.preventDefault()),
    erroresPaciente: {},
    guardandoPaciente: false,
    pacienteForm: estadoInicialPaciente,
    ...overrides,
  };
  render(<PacienteForm {...props} />);
  return props;
}

describe("PacienteForm", () => {
  it("renderiza todos los campos del formulario", () => {
    renderForm();
    expect(screen.getByLabelText("RUT")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha de nacimiento")).toBeInTheDocument();
    expect(screen.getByLabelText("Sexo")).toBeInTheDocument();
    expect(screen.getByLabelText("Previsión")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombres")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellido paterno")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellido materno")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
    expect(screen.getByLabelText("Dirección")).toBeInTheDocument();
  });

  it("llama a actualizarPaciente con el campo y el valor al escribir en el RUT", () => {
    const props = renderForm();
    fireEvent.change(screen.getByLabelText("RUT"), { target: { value: "12345678-9" } });
    expect(props.actualizarPaciente).toHaveBeenCalledWith("rut", "12345678-9");
  });

  it("llama a actualizarPaciente al cambiar el select de sexo", () => {
    const props = renderForm();
    fireEvent.change(screen.getByLabelText("Sexo"), { target: { value: "FEMENINO" } });
    expect(props.actualizarPaciente).toHaveBeenCalledWith("sexo", "FEMENINO");
  });

  it("llama a actualizarPaciente al cambiar el select de previsión", () => {
    const props = renderForm();
    fireEvent.change(screen.getByLabelText("Previsión"), { target: { value: "ISAPRE" } });
    expect(props.actualizarPaciente).toHaveBeenCalledWith("prevision", "ISAPRE");
  });

  it("llama a actualizarPaciente al escribir en nombres, apellidos, email, teléfono y dirección", () => {
    const props = renderForm();
    fireEvent.change(screen.getByLabelText("Nombres"), { target: { value: "Juan" } });
    expect(props.actualizarPaciente).toHaveBeenCalledWith("nombres", "Juan");
    fireEvent.change(screen.getByLabelText("Apellido paterno"), { target: { value: "Perez" } });
    expect(props.actualizarPaciente).toHaveBeenCalledWith("apellidoPaterno", "Perez");
    fireEvent.change(screen.getByLabelText("Apellido materno"), { target: { value: "Soto" } });
    expect(props.actualizarPaciente).toHaveBeenCalledWith("apellidoMaterno", "Soto");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.cl" } });
    expect(props.actualizarPaciente).toHaveBeenCalledWith("email", "a@b.cl");
    fireEvent.change(screen.getByLabelText("Teléfono"), { target: { value: "+56911112222" } });
    expect(props.actualizarPaciente).toHaveBeenCalledWith("telefono", "+56911112222");
    fireEvent.change(screen.getByLabelText("Dirección"), { target: { value: "Calle 123" } });
    expect(props.actualizarPaciente).toHaveBeenCalledWith("direccion", "Calle 123");
  });

  it("muestra mensajes de error cuando erroresPaciente está poblado", () => {
    renderForm({
      erroresPaciente: {
        rut: "Formato requerido: 12345678-9.",
        email: "Email inválido.",
      },
    });
    expect(screen.getByText("Formato requerido: 12345678-9.")).toBeInTheDocument();
    expect(screen.getByText("Email inválido.")).toBeInTheDocument();
    expect(screen.getByLabelText("RUT")).toHaveClass("rn-input--error");
  });

  it("no muestra errores cuando erroresPaciente está vacío", () => {
    renderForm();
    expect(screen.queryByText(/Ingresa/)).not.toBeInTheDocument();
  });

  it("deshabilita el botón de submit y muestra 'Guardando…' cuando guardandoPaciente es true", () => {
    renderForm({ guardandoPaciente: true });
    const boton = screen.getByRole("button", { name: /guardando/i });
    expect(boton).toBeDisabled();
  });

  it("el botón de submit está habilitado y dice 'Registrar paciente' cuando no se está guardando", () => {
    renderForm({ guardandoPaciente: false });
    const boton = screen.getByRole("button", { name: /registrar paciente/i });
    expect(boton).toBeEnabled();
  });

  it("llama a crearPaciente al enviar el formulario", () => {
    const props = renderForm();
    fireEvent.click(screen.getByRole("button", { name: /registrar paciente/i }));
    expect(props.crearPaciente).toHaveBeenCalledTimes(1);
  });
});
