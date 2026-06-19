package cl.rednorte.gateway.bff.client;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PacientesClientTest {

    private MockWebServer server;
    private PacientesClient client;

    @BeforeEach
    void setUp() throws IOException {
        server = new MockWebServer();
        server.start();
        client = new PacientesClient(server.url("/").toString());
    }

    @AfterEach
    void tearDown() throws IOException {
        server.shutdown();
    }

    @Test
    void listar_devuelveDatosCuandoElServicioRespondeOk() {
        server.enqueue(new MockResponse()
                .setBody("[{\"id\":1,\"rut\":\"11111111-1\",\"nombres\":\"Juan\",\"apellidoPaterno\":\"Perez\",\"apellidoMaterno\":\"Soto\",\"estado\":\"ACTIVO\"}]")
                .addHeader("Content-Type", "application/json"));

        StepVerifier.create(client.listar())
                .assertNext(p -> {
                    assertEquals(1L, p.getId());
                    assertEquals("11111111-1", p.getRut());
                    assertEquals("Juan", p.getNombres());
                    assertEquals("Perez", p.getApellidoPaterno());
                    assertEquals("Soto", p.getApellidoMaterno());
                    assertEquals("ACTIVO", p.getEstado());
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
}
