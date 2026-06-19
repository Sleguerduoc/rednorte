import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as AuthContext from "../context/AuthContext";
import { rednorteApi } from "../services/rednorteApi";
import LoginPage from "./LoginPage";

vi.mock("../services/rednorteApi", () => ({
  rednorteApi: {
    login: vi.fn(),
  },
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("LoginPage", () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    AuthContext.useAuth.mockReturnValue({ login: loginMock });
  });

  it("permite escribir en los campos de usuario y contraseña", () => {
    render(<LoginPage />);
    const userInput = screen.getByPlaceholderText("admin / doctor1 / cliente1");
    const passInput = document.querySelector("#login-pass");

    fireEvent.change(userInput, { target: { value: "  admin  " } });
    fireEvent.change(passInput, { target: { value: "secreto" } });

    expect(userInput).toHaveValue("  admin  ");
    expect(passInput).toHaveValue("secreto");
  });

  it("en éxito llama a rednorteApi.login con el username recortado y luego a login() del contexto", async () => {
    rednorteApi.login.mockResolvedValueOnce({ data: { username: "admin", token: "tok123" } });
    render(<LoginPage />);

    fireEvent.change(document.querySelector("#login-user"), { target: { value: "  admin  " } });
    fireEvent.change(document.querySelector("#login-pass"), { target: { value: "secreto" } });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => expect(rednorteApi.login).toHaveBeenCalledWith("admin", "secreto"));
    await waitFor(() => expect(loginMock).toHaveBeenCalledWith({ username: "admin", token: "tok123" }));
    expect(screen.queryByText(/Credenciales incorrectas/i)).not.toBeInTheDocument();
  });

  it("en error muestra el mensaje de credenciales incorrectas y no llama a login()", async () => {
    rednorteApi.login.mockRejectedValueOnce(new Error("401"));
    render(<LoginPage />);

    fireEvent.change(document.querySelector("#login-user"), { target: { value: "admin" } });
    fireEvent.change(document.querySelector("#login-pass"), { target: { value: "malo" } });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() =>
      expect(screen.getByText("Credenciales incorrectas. Verifica tu usuario y contraseña.")).toBeInTheDocument()
    );
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("deshabilita el botón mientras está cargando", async () => {
    let resolveLogin;
    rednorteApi.login.mockImplementationOnce(
      () => new Promise((resolve) => { resolveLogin = resolve; })
    );
    render(<LoginPage />);

    fireEvent.change(document.querySelector("#login-user"), { target: { value: "admin" } });
    fireEvent.change(document.querySelector("#login-pass"), { target: { value: "secreto" } });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(screen.getByRole("button", { name: /ingresando/i })).toBeDisabled();

    resolveLogin({ data: { username: "admin" } });
    await waitFor(() => expect(loginMock).toHaveBeenCalled());
  });
});
