package cl.rednorte.gateway.bff.client;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ListaEsperaClientTest {

    private MockWebServer server;
    private ListaEsperaClient client;

    @BeforeEach
    void setUp() throws IOException {
        server = new MockWebServer();
        server.start();
        client = new ListaEsperaClient(server.url("/").toString());
    }

    @AfterEach
    void tearDown() throws IOException {
        server.shutdown();
    }

    @Test
    void listar_devuelveDatosCuandoElServicioRespondeOk() {
        server.enqueue(new MockResponse()
                .setBody("[{\"id\":1,\"pacienteId\":10,\"especialidad\":\"Cardiologia\",\"prioridad\":\"ALTA\",\"estado\":\"PENDIENTE\",\"fechaRegistro\":\"2026-06-01T10:00:00\"}]")
                .addHeader("Content-Type", "application/json"));

        StepVerifier.create(client.listar())
                .assertNext(s -> {
                    assertEquals(1L, s.getId());
                    assertEquals(10L, s.getPacienteId());
                    assertEquals("Cardiologia", s.getEspecialidad());
                    assertEquals("ALTA", s.getPrioridad());
                    assertEquals("PENDIENTE", s.getEstado());
                })
                .verifyComplete();
    }

    @Test
    void listar_devuelveFluxVacioCuandoElServicioRespondeError500() {
        server.enqueue(new MockResponse().setResponseCode(500));

        StepVerifier.create(client.listar())
                .verifyComplete();
    }

    @Test
    void listar_devuelveFluxVacioCuandoElServidorNoResponde() throws IOException {
        server.shutdown();

        StepVerifier.create(client.listar())
                .verifyComplete();
    }

    @Test
    void listarCitasDelDia_devuelveDatosYEnviaQueryParamFecha() throws InterruptedException {
        server.enqueue(new MockResponse()
                .setBody("[{\"id\":5,\"solicitudId\":1,\"pacienteId\":10,\"especialidad\":\"Cardiologia\",\"fecha\":\"2026-06-16\",\"hora\":\"10:00\",\"estado\":\"CONFIRMADA\"}]")
                .addHeader("Content-Type", "application/json"));

        StepVerifier.create(client.listarCitasDelDia("2026-06-16"))
                .assertNext(c -> {
                    assertEquals(5L, c.getId());
                    assertEquals(10L, c.getPacienteId());
                    assertEquals("2026-06-16", c.getFecha());
                    assertEquals("10:00", c.getHora());
                })
                .verifyComplete();

        RecordedRequest recorded = server.takeRequest();
        assertTrue(recorded.getPath().startsWith("/citas/del-dia"));
        assertTrue(recorded.getPath().contains("fecha=2026-06-16"));
    }

    @Test
    void listarCitasDelDia_devuelveFluxVacioCuandoElServicioRespondeError500() {
        server.enqueue(new MockResponse().setResponseCode(500));

        StepVerifier.create(client.listarCitasDelDia("2026-06-16"))
                .verifyComplete();
    }

    @Test
    void listarCitasDelDia_devuelveFluxVacioCuandoElServidorNoResponde() throws IOException {
        server.shutdown();

        StepVerifier.create(client.listarCitasDelDia("2026-06-16"))
                .verifyComplete();
    }
}
