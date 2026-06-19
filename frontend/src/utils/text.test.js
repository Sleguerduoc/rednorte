import { describe, expect, it } from "vitest";
import { inicialesPaciente, nombreCompleto, normalizar } from "./text";

describe("normalizar", () => {
  it("convierte a minúsculas y remueve tildes", () => {
    expect(normalizar("José Pérez")).toBe("jose perez");
  });

  it("retorna cadena vacía para valores nulos o undefined", () => {
    expect(normalizar(null)).toBe("");
    expect(normalizar(undefined)).toBe("");
  });

  it("convierte valores no-string usando String()", () => {
    expect(normalizar(123)).toBe("123");
  });
});

describe("nombreCompleto", () => {
  it("retorna cadena vacía si no hay paciente", () => {
    expect(nombreCompleto(null)).toBe("");
    expect(nombreCompleto(undefined)).toBe("");
  });

  it("concatena nombres y apellidos cuando existen", () => {
    expect(
      nombreCompleto({ nombres: "Juan", apellidoPaterno: "Perez", apellidoMaterno: "Soto" })
    ).toBe("Juan Perez Soto");
  });

  it("omite apellido materno si no existe", () => {
    expect(nombreCompleto({ nombres: "Juan", apellidoPaterno: "Perez" })).toBe("Juan Perez");
  });

  it("usa el campo 'nombre' legado cuando no hay nombres/apellidos", () => {
    expect(nombreCompleto({ nombre: "Juan Antiguo" })).toBe("Juan Antiguo");
  });
});

describe("inicialesPaciente", () => {
  it("retorna '?' si no hay paciente", () => {
    expect(inicialesPaciente(null)).toBe("?");
  });

  it("retorna iniciales de nombres y apellido paterno en mayúsculas", () => {
    expect(inicialesPaciente({ nombres: "juan", apellidoPaterno: "perez" })).toBe("JP");
  });

  it("usa el campo 'nombre' legado cuando no hay 'nombres'", () => {
    expect(inicialesPaciente({ nombre: "ana", apellidoPaterno: "lopez" })).toBe("AL");
  });

  it("retorna '?' cuando no hay datos suficientes", () => {
    expect(inicialesPaciente({})).toBe("?");
  });
});
