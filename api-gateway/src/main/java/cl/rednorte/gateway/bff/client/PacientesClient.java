package cl.rednorte.gateway.bff.client;

import cl.rednorte.gateway.bff.dto.PacienteDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Component
public class PacientesClient {

    private final WebClient webClient;

    public PacientesClient(
            WebClient.Builder builder,
            @Value("${services.pacientes.url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    public Flux<PacienteDto> listar() {
        return webClient.get()
                .uri("/pacientes")
                .retrieve()
                .bodyToFlux(PacienteDto.class)
                .onErrorResume(e -> Flux.empty());
    }
}
