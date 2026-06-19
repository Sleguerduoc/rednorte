import { describe, expect, it } from "vitest";
import { validarPacienteForm, validarSolicitudForm } from "./validators";

const pacienteValido = {
  rut: "12345678-9",
  nombres: "Juan",
  apellidoPaterno: "Perez",
  apellidoMaterno: "Soto",
  fechaNacimiento: "1990-01-01",
  sexo: "MASCULINO",
  prevision: "FONASA",
  email: "juan@correo.cl",
  telefono: "+56912345678",
  direccion: "Av. Siempre Viva 123",
};

describe("validarPacienteForm", () => {
  it("retorna objeto vacío cuando todos los campos son válidos", () => {
    expect(validarPacienteForm(pacienteValido)).toEqual({});
  });

  it("exige el RUT", () => {
    const errores = validarPacienteForm({ ...pacienteValido, rut: "" });
    expect(errores.rut).toBe("Ingresa el RUT.");
  });

  it("valida el formato del RUT", () => {
    const errores = validarPacienteForm({ ...pacienteValido, rut: "abc" });
    expect(errores.rut).toBe("Formato requerido: 12345678-9.");
  });

  it("acepta RUT con k minúscula o mayúscula", () => {
    expect(validarPacienteForm({ ...pacienteValido, rut: "12345678-k" }).rut).toBeUndefined();
    expect(validarPacienteForm({ ...pacienteValido, rut: "12345678-K" }).rut).toBeUndefined();
  });

  it("exige nombres con mínimo de caracteres", () => {
    const vacio = validarPacienteForm({ ...pacienteValido, nombres: "" });
    expect(vacio.nombres).toMatch(/Ingresa/);
    const corto = validarPacienteForm({ ...pacienteValido, nombres: "J" });
    expect(corto.nombres).toMatch(/Mínimo/);
  });

  it("exige apellido paterno", () => {
    const errores = validarPacienteForm({ ...pacienteValido, apellidoPaterno: "" });
    expect(errores.apellidoPaterno).toMatch(/Ingresa/);
  });

  it("exige fecha de nacimiento", () => {
    const errores = validarPacienteForm({ ...pacienteValido, fechaNacimiento: "" });
    expect(errores.fechaNacimiento).toBe("Ingresa la fecha de nacimiento.");
  });

  it("rechaza fecha de nacimiento futura", () => {
    const futura = new Date();
    futura.setFullYear(futura.getFullYear() + 1);
    const errores = validarPacienteForm({
      ...pacienteValido,
      fechaNacimiento: futura.toISOString().slice(0, 10),
    });
    expect(errores.fechaNacimiento).toBe("La fecha no puede ser futura.");
  });

  it("rechaza fecha de nacimiento con edad mayor a 120 años", () => {
    const errores = validarPacienteForm({ ...pacienteValido, fechaNacimiento: "1800-01-01" });
    expect(errores.fechaNacimiento).toBe("Fecha no válida.");
  });

  it("exige sexo", () => {
    const errores = validarPacienteForm({ ...pacienteValido, sexo: "" });
    expect(errores.sexo).toBe("Selecciona el sexo.");
  });

  it("exige previsión", () => {
    const errores = validarPacienteForm({ ...pacienteValido, prevision: "" });
    expect(errores.prevision).toBe("Selecciona la previsión.");
  });

  it("exige email", () => {
    const errores = validarPacienteForm({ ...pacienteValido, email: "" });
    expect(errores.email).toBe("Ingresa el email.");
  });

  it("valida formato de email", () => {
    const errores = validarPacienteForm({ ...pacienteValido, email: "no-es-email" });
    expect(errores.email).toBe("Email inválido.");
  });

  it("exige teléfono", () => {
    const errores = validarPacienteForm({ ...pacienteValido, telefono: "" });
    expect(errores.telefono).toBe("Ingresa el teléfono.");
  });

  it("valida formato de teléfono", () => {
    const errores = validarPacienteForm({ ...pacienteValido, telefono: "abc" });
    expect(errores.telefono).toBe("Teléfono inválido.");
  });

  it("exige dirección con mínimo de caracteres", () => {
    const vacio = validarPacienteForm({ ...pacienteValido, direccion: "" });
    expect(vacio.direccion).toMatch(/Ingresa/);
    const corta = validarPacienteForm({ ...pacienteValido, direccion: "Av1" });
    expect(corta.direccion).toMatch(/Mínimo/);
  });
});

describe("validarSolicitudForm", () => {
  const solicitudValida = { pacienteId: "5", especialidad: "Cardiología" };

  it("retorna objeto vacío cuando todos los campos son válidos", () => {
    expect(validarSolicitudForm(solicitudValida)).toEqual({});
  });

  it("exige seleccionar un paciente cuando falta pacienteId", () => {
    const errores = validarSolicitudForm({ ...solicitudValida, pacienteId: "" });
    expect(errores.pacienteId).toBe("Busca y selecciona un paciente.");
  });

  it("rechaza pacienteId no entero", () => {
    const errores = validarSolicitudForm({ ...solicitudValida, pacienteId: "abc" });
    expect(errores.pacienteId).toBe("Busca y selecciona un paciente.");
  });

  it("rechaza pacienteId menor o igual a cero", () => {
    const errores = validarSolicitudForm({ ...solicitudValida, pacienteId: "0" });
    expect(errores.pacienteId).toBe("Busca y selecciona un paciente.");
  });

  it("exige especialidad con mínimo de caracteres", () => {
    const vacio = validarSolicitudForm({ ...solicitudValida, especialidad: "" });
    expect(vacio.especialidad).toMatch(/Ingresa/);
    const corta = validarSolicitudForm({ ...solicitudValida, especialidad: "Ca" });
    expect(corta.especialidad).toMatch(/Mínimo/);
  });
});
