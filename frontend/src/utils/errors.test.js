import { describe, expect, it } from "vitest";
import { obtenerMensajeError } from "./errors";

describe("obtenerMensajeError", () => {
  it("prioriza el mensaje de response.data.message", () => {
    const error = { response: { data: { message: "mensaje específico" } } };
    expect(obtenerMensajeError(error, "fallback")).toBe("mensaje específico");
  });

  it("usa response.data.error si no hay message", () => {
    const error = { response: { data: { error: "error específico" } } };
    expect(obtenerMensajeError(error, "fallback")).toBe("error específico");
  });

  it("usa error.message si no hay datos de response", () => {
    const error = { message: "fallo de red" };
    expect(obtenerMensajeError(error, "fallback")).toBe("fallo de red");
  });

  it("usa el mensaje de fallback si no hay nada más", () => {
    const error = {};
    expect(obtenerMensajeError(error, "fallback")).toBe("fallback");
  });
});
