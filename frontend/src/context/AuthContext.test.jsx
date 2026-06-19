import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

const STORAGE_KEY = "rednorte_user";

function Consumidor() {
  const { user, login, logout, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.username : "sin-usuario"}</span>
      <button onClick={() => login({ username: "nuevo", token: "tok" })}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("inicia sin usuario y con loading false tras montar cuando no hay datos guardados", () => {
    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("sin-usuario");
  });

  it("carga el usuario inicial desde localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: "guardado", token: "t1" }));
    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    expect(screen.getByTestId("user")).toHaveTextContent("guardado");
  });

  it("limpia localStorage si el contenido guardado no es JSON válido", () => {
    localStorage.setItem(STORAGE_KEY, "esto-no-es-json");
    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    expect(screen.getByTestId("user")).toHaveTextContent("sin-usuario");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("login actualiza el usuario y persiste en localStorage", () => {
    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    act(() => {
      screen.getByText("login").click();
    });
    expect(screen.getByTestId("user")).toHaveTextContent("nuevo");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({ username: "nuevo", token: "tok" });
  });

  it("logout limpia el usuario y remueve de localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: "guardado", token: "t1" }));
    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );
    act(() => {
      screen.getByText("logout").click();
    });
    expect(screen.getByTestId("user")).toHaveTextContent("sin-usuario");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
