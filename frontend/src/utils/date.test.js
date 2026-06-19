import { describe, expect, it } from "vitest";
import { fechaDesdeSolicitud, formatearFecha, generarDias, hoy } from "./date";

describe("generarDias", () => {
  it("genera 7 días por defecto a partir de la fecha indicada", () => {
    const dias = generarDias(7, new Date("2024-01-01T00:00:00"));
    expect(dias).toHaveLength(7);
    expect(dias[0].value).toBe("2024-01-01");
    expect(dias[0].num).toBe(1);
    expect(dias[0].dow).toBe("LUN");
  });

  it("permite generar una cantidad distinta de días", () => {
    const dias = generarDias(3, new Date("2024-01-01T00:00:00"));
    expect(dias).toHaveLength(3);
    expect(dias.map((d) => d.value)).toEqual(["2024-01-01", "2024-01-02", "2024-01-03"]);
  });
});

describe("hoy", () => {
  it("retorna la fecha actual en formato YYYY-MM-DD", () => {
    const esperado = new Date().toISOString().slice(0, 10);
    expect(hoy()).toBe(esperado);
  });
});

describe("fechaDesdeSolicitud", () => {
  it("retorna la fecha de registro recortada cuando existe", () => {
    expect(fechaDesdeSolicitud({ fechaRegistro: "2024-05-10T12:30:00Z" })).toBe("2024-05-10");
  });

  it("retorna la fecha actual cuando no hay fechaRegistro", () => {
    const esperado = new Date().toISOString().slice(0, 10);
    expect(fechaDesdeSolicitud({})).toBe(esperado);
  });
});

describe("formatearFecha", () => {
  it("retorna 'Sin fecha' cuando el valor es vacío", () => {
    expect(formatearFecha("")).toBe("Sin fecha");
    expect(formatearFecha(null)).toBe("Sin fecha");
    expect(formatearFecha(undefined)).toBe("Sin fecha");
  });

  it("retorna el valor original cuando la fecha no es válida", () => {
    expect(formatearFecha("no-es-fecha")).toBe("no-es-fecha");
  });

  it("formatea una fecha válida usando formato es-CL", () => {
    const resultado = formatearFecha("2024-05-10T00:00:00");
    expect(typeof resultado).toBe("string");
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado).not.toBe("Sin fecha");
  });
});
