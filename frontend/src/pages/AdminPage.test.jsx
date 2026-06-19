import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rednorteApi } from "../services/rednorteApi";
import AdminPage from "./AdminPage";

vi.mock("../services/rednorteApi", () => ({
  rednorteApi: {
    salaDelDia: vi.fn(),
    listaEsperaPendiente: vi.fn(),
    ofertas: vi.fn(),
    checkIn: vi.fn(),
    noShow: vi.fn(),
    atenderCita: vi.fn(),
    revisarVencidas: vi.fn(),
    agendarCita: vi.fn(),
  },
}));

const citasSala = [
  {
    id: 1,
    especialidad: "Cardiología",
    fecha: "2024-01-01",
    hora: "08:00",
    estado: "PROGRAMADA",
    pacienteNombre: "Juan Perez",
  },
  {
    id: 2,
    especialidad: "Cardiología",
    fecha: "2024-01-01",
    hora: "08:30",
    estado: "EN_SALA",
    pacienteNombre: "Ana Lopez",
  },
];

const solicitudesLista = [
  {
    id: 50,
    pacienteNombre: "Carlos Diaz",
    especialidad: "Cardiología",
    prioridad: "NORMAL",
    fechaRegistro: "2024-01-01T00:00:00",
  },
];

const ofertasMock = [
  {
    id: 9,
    pacienteNombre: "Marta Soto",
    especialidad: "Cardiología",
    fechaCupo: "2024-01-02",
    horaCupo: "09:00",
    estado: "PENDIENTE",
    origen: "NO_SHOW",
    expiraEn: new Date(Date.now() + 3600_000).toISOString(),
  },
];

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rednorteApi.salaDelDia.mockResolvedValue({ data: citasSala });
    rednorteApi.listaEsperaPendiente.mockResolvedValue({ data: solicitudesLista });
    rednorteApi.ofertas.mockResolvedValue({ data: ofertasMock });
    rednorteApi.checkIn.mockResolvedValue({ data: {} });
    rednorteApi.noShow.mockResolvedValue({ data: {} });
    rednorteApi.atenderCita.mockResolvedValue({ data: {} });
    rednorteApi.revisarVencidas.mockResolvedValue({ data: {} });
    rednorteApi.agendarCita.mockResolvedValue({ data: {} });
  });

  it("carga la sala del día al montar y muestra las citas", async () => {
    render(<AdminPage />);

    await waitFor(() => expect(rednorteApi.salaDelDia).toHaveBeenCalled());
    expect(await screen.findByText("Juan Perez")).toBeInTheDocument();
    expect(screen.getByText("Ana Lopez")).toBeInTheDocument();
  });

  it("cambia a la pestaña de lista de espera y carga las solicitudes", async () => {
    render(<AdminPage />);
    await screen.findByText("Juan Perez");

    fireEvent.click(screen.getByRole("button", { name: "Lista de espera" }));

    await waitFor(() => expect(rednorteApi.listaEsperaPendiente).toHaveBeenCalled());
    expect(await screen.findByText("Carlos Diaz")).toBeInTheDocument();
  });

  it("cambia a la pestaña de ofertas y carga las ofertas", async () => {
    render(<AdminPage />);
    await screen.findByText("Juan Perez");

    fireEvent.click(screen.getByRole("button", { name: "Ofertas" }));

    await waitFor(() => expect(rednorteApi.ofertas).toHaveBeenCalled());
    expect(await screen.findByText("Marta Soto")).toBeInTheDocument();
  });

  it("click en 'Revisar vencidas' llama al endpoint y muestra el banner de éxito", async () => {
    render(<AdminPage />);
    await screen.findByText("Juan Perez");

    fireEvent.click(screen.getByRole("button", { name: "Ofertas" }));
    await screen.findByText("Marta Soto");

    fireEvent.click(screen.getByRole("button", { name: "Revisar vencidas" }));

    await waitFor(() => expect(rednorteApi.revisarVencidas).toHaveBeenCalled());
    expect(await screen.findByText(/Ofertas vencidas procesadas/i)).toBeInTheDocument();
  });

  it("check-in en una fila programada llama a rednorteApi.checkIn y recarga la sala", async () => {
    render(<AdminPage />);
    await screen.findByText("Juan Perez");

    const filaJuan = screen.getByText("Juan Perez").closest("tr");
    fireEvent.click(within(filaJuan).getByRole("button", { name: "Check-in" }));

    await waitFor(() => expect(rednorteApi.checkIn).toHaveBeenCalledWith(1));
    expect(await screen.findByText("Check-in registrado.")).toBeInTheDocument();
    expect(rednorteApi.salaDelDia).toHaveBeenCalledTimes(2);
  });

  it("no-show en una fila programada llama a rednorteApi.noShow y muestra el banner de cupo liberado", async () => {
    render(<AdminPage />);
    await screen.findByText("Juan Perez");

    const filaJuan = screen.getByText("Juan Perez").closest("tr");
    fireEvent.click(within(filaJuan).getByRole("button", { name: "No asistió" }));

    await waitFor(() => expect(rednorteApi.noShow).toHaveBeenCalledWith(1));
    expect(await screen.findByText(/No-show registrado/i)).toBeInTheDocument();
    expect(screen.getByText("Se liberó un cupo para reasignación automática.")).toBeInTheDocument();
  });

  it("atender en una fila en sala llama a rednorteApi.atenderCita", async () => {
    render(<AdminPage />);
    await screen.findByText("Ana Lopez");

    const filaAna = screen.getByText("Ana Lopez").closest("tr");
    fireEvent.click(within(filaAna).getByRole("button", { name: "Atender" }));

    await waitFor(() => expect(rednorteApi.atenderCita).toHaveBeenCalledWith(2));
    expect(await screen.findByText("Cita marcada como atendida.")).toBeInTheDocument();
  });

  it("abre el wizard de agendamiento desde la lista de espera y agenda una cita", async () => {
    render(<AdminPage />);
    await screen.findByText("Juan Perez");

    fireEvent.click(screen.getByRole("button", { name: "Lista de espera" }));
    await screen.findByText("Carlos Diaz");

    fireEvent.click(screen.getByRole("button", { name: "Agendar" }));

    // Paso 0 del wizard: confirma datos de la solicitud
    expect(screen.getByText("Agendar cita")).toBeInTheDocument();
    expect(screen.getAllByText("Carlos Diaz").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));

    // Paso 1: elegir hora
    await waitFor(() => expect(rednorteApi.salaDelDia).toHaveBeenCalled());
    const chipHora = await screen.findByRole("button", { name: "09:30" });
    fireEvent.click(chipHora);

    const confirmar = screen.getByRole("button", { name: /Confirmar cita/i });
    expect(confirmar).toBeEnabled();
    fireEvent.click(confirmar);

    await waitFor(() => expect(rednorteApi.agendarCita).toHaveBeenCalledWith(50, expect.any(String), "09:30"));
    expect(await screen.findByText(/Cita agendada/i)).toBeInTheDocument();
  });

  it("muestra el mensaje de error cuando falla la carga de la sala", async () => {
    rednorteApi.salaDelDia.mockReset();
    rednorteApi.salaDelDia.mockRejectedValue({ response: { data: { message: "Backend caído" } } });

    render(<AdminPage />);

    expect(await screen.findByText("Backend caído")).toBeInTheDocument();
  });
});
