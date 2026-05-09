import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:8080";

function App() {
  const [pacientes, setPacientes] = useState([]);
  const [listas, setListas] = useState([]);
  const [reasignaciones, setReasignaciones] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);

  const [pacienteForm, setPacienteForm] = useState({
    rut: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: ""
  });

  const [listaForm, setListaForm] = useState({
    pacienteId: "",
    especialidad: "",
    prioridad: "NORMAL"
  });

  const cargarDatos = async () => {
    try {
      const [pacRes, listaRes, reasRes, notiRes] = await Promise.all([
        axios.get(`${API_URL}/pacientes`),
        axios.get(`${API_URL}/listas-espera`),
        axios.get(`${API_URL}/reasignaciones`),
        axios.get(`${API_URL}/notificaciones`)
      ]);

      setPacientes(pacRes.data);
      setListas(listaRes.data);
      setReasignaciones(reasRes.data);
      setNotificaciones(notiRes.data);
    } catch (error) {
      console.error("Error cargando datos", error);
    }
  };

  const crearPaciente = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(`${API_URL}/pacientes`, pacienteForm);

    console.log("Paciente creado:", response.data);

    setPacientes((prev) => [...prev, response.data]);

    setPacienteForm({
      rut: "",
      nombre: "",
      email: "",
      telefono: "",
      direccion: ""
    });

    await cargarDatos();
  } catch (error) {
    console.error("Error creando paciente:", error);
    alert("No se pudo crear el paciente. Revisa la consola.");
  }
};

  const crearSolicitud = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/listas-espera`, {
      pacienteId: Number(listaForm.pacienteId),
      especialidad: listaForm.especialidad,
      prioridad: listaForm.prioridad
    });

    setListaForm({
      pacienteId: "",
      especialidad: "",
      prioridad: "NORMAL"
    });

    cargarDatos();
  };

  const cancelarCita = async () => {
    const citaId = Math.floor(Math.random() * 1000) + 1;
    const especialidad = "Traumatologia";
    const fecha = "2026-05-30";

    await axios.post(
      `${API_URL}/listas-espera/cancelar-cita?citaId=${citaId}&especialidad=${especialidad}&fecha=${fecha}`
    );

    setTimeout(cargarDatos, 1000);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>RedNorte</h2>
        <p>Gestión hospitalaria</p>
        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#pacientes">Pacientes</a>
          <a href="#listas">Lista de espera</a>
          <a href="#eventos">Eventos</a>
          <a href="#notificaciones">Notificaciones</a>
        </nav>
      </aside>

      <main className="main">
        <section id="dashboard" className="hero">
          <h1>Panel RedNorte</h1>
          <p>Sistema de gestión de listas de espera con microservicios, API Gateway y eventos.</p>
        </section>

        <section className="cards">
          <div className="card">
            <span>Pacientes</span>
            <strong>{pacientes.length}</strong>
          </div>
          <div className="card">
            <span>Solicitudes</span>
            <strong>{listas.length}</strong>
          </div>
          <div className="card">
            <span>Reasignaciones</span>
            <strong>{reasignaciones.length}</strong>
          </div>
          <div className="card">
            <span>Notificaciones</span>
            <strong>{notificaciones.length}</strong>
          </div>
        </section>

        <section id="pacientes" className="panel">
          <h2>Pacientes</h2>

          <form onSubmit={crearPaciente} className="form-grid">
            <input placeholder="RUT" value={pacienteForm.rut} onChange={(e) => setPacienteForm({ ...pacienteForm, rut: e.target.value })} />
            <input placeholder="Nombre" value={pacienteForm.nombre} onChange={(e) => setPacienteForm({ ...pacienteForm, nombre: e.target.value })} />
            <input placeholder="Email" value={pacienteForm.email} onChange={(e) => setPacienteForm({ ...pacienteForm, email: e.target.value })} />
            <input placeholder="Teléfono" value={pacienteForm.telefono} onChange={(e) => setPacienteForm({ ...pacienteForm, telefono: e.target.value })} />
            <input placeholder="Dirección" value={pacienteForm.direccion} onChange={(e) => setPacienteForm({ ...pacienteForm, direccion: e.target.value })} />
            <button type="submit">Crear paciente</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.rut}</td>
                  <td>{p.nombre}</td>
                  <td>{p.email}</td>
                  <td>{p.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="listas" className="panel">
          <h2>Lista de espera</h2>

          <form onSubmit={crearSolicitud} className="form-grid">
            <input placeholder="ID Paciente" value={listaForm.pacienteId} onChange={(e) => setListaForm({ ...listaForm, pacienteId: e.target.value })} />
            <input placeholder="Especialidad" value={listaForm.especialidad} onChange={(e) => setListaForm({ ...listaForm, especialidad: e.target.value })} />
            <select value={listaForm.prioridad} onChange={(e) => setListaForm({ ...listaForm, prioridad: e.target.value })}>
              <option value="NORMAL">NORMAL</option>
              <option value="ALTA">ALTA</option>
              <option value="CRITICA">CRITICA</option>
            </select>
            <button type="submit">Crear solicitud</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Especialidad</th>
                <th>Prioridad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {listas.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.pacienteId}</td>
                  <td>{l.especialidad}</td>
                  <td>{l.prioridad}</td>
                  <td>{l.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="eventos" className="panel">
          <h2>Flujo de eventos</h2>
          <p>Este botón simula una cita cancelada. El backend publica el evento en RabbitMQ, genera una reasignación y luego crea notificaciones.</p>
          <button onClick={cancelarCita} className="danger">
            Simular cita cancelada
          </button>

          <h3>Reasignaciones</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cita</th>
                <th>Especialidad</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reasignaciones.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.citaId}</td>
                  <td>{r.especialidad}</td>
                  <td>{r.fecha}</td>
                  <td>{r.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="notificaciones" className="panel">
          <h2>Notificaciones</h2>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Canal</th>
                <th>Mensaje</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {notificaciones.map((n) => (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td>{n.pacienteId}</td>
                  <td>{n.canal}</td>
                  <td>{n.mensaje}</td>
                  <td>{n.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;