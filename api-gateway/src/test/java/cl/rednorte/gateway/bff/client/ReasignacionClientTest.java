package cl.rednorte.gateway.bff.client;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ReasignacionClientTest {

    private MockWebServer server;
    private ReasignacionClient client;

    @BeforeEach
    void setUp() throws IOException {
        server = new MockWebServer();
        server.start();
        client = new ReasignacionClient(server.url("/").toString());
    }

    @AfterEach
    void tearDown() throws IOException {
        server.shutdown();
    }

    @Test
    void listar_devuelveDatosCuandoElServicioRespondeOk() {
        server.enqueue(new MockResponse()
                .setBody("[{\"id\":1,\"estado\":\"COMPLETADA\"}]")
                .addHeader("Content-Type", "application/json"));

        StepVerifier.create(client.listar())
                .assertNext(r -> {
                    assertEquals(1L, r.getId());
                    assertEquals("COMPLETADA", r.getEstado());
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
    void listarOfertas_devuelveDatosCuandoElServicioRespondeOk() {
        server.enqueue(new MockResponse()
                .setBody("[{\"id\":7,\"token\":\"abc123\",\"pacienteId\":10,\"solicitudId\":1,\"citaId\":5,"
                        + "\"especialidad\":\"Cardiologia\",\"fechaCupo\":\"2026-06-20\",\"horaCupo\":\"09:30\","
                        + "\"estado\":\"OFRECIDA\",\"origen\":\"AUTOMATICO\",\"creadaEn\":\"2026-06-18T08:00:00\","
                        + "\"expiraEn\":\"2026-06-19T08:00:00\",\"prioridadMinima\":\"ALTA\"}]")
                .addHeader("Content-Type", "application/json"));

        StepVerifier.create(client.listarOfertas())
                .assertNext(o -> {
                    assertEquals(7L, o.getId());
                    assertEquals("abc123", o.getToken());
                    assertEquals(10L, o.getPacienteId());
                    assertEquals("OFRECIDA", o.getEstado());
                    assertEquals("2026-06-20", o.getFechaCupo());
                    assertEquals("09:30", o.getHoraCupo());
                })
                .verifyComplete();
    }

    @Test
    void listarOfertas_devuelveFluxVacioCuandoElServicioRespondeError500() {
        server.enqueue(new MockResponse().setResponseCode(500));

        StepVerifier.create(client.listarOfertas())
                .verifyComplete();
    }

    @Test
    void listarOfertas_devuelveFluxVacioCuandoElServidorNoResponde() throws IOException {
        server.shutdown();

        StepVerifier.create(client.listarOfertas())
                .verifyComplete();
    }
}
