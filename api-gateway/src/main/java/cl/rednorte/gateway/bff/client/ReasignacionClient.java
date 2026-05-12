package cl.rednorte.gateway.bff.client;

import cl.rednorte.gateway.bff.dto.ReasignacionDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Component
public class ReasignacionClient {

    private final WebClient webClient;

    public ReasignacionClient(
            WebClient.Builder builder,
            @Value("${services.reasignacion.url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    public Flux<ReasignacionDto> listar() {
        return webClient.get()
                .uri("/reasignaciones")
                .retrieve()
                .bodyToFlux(ReasignacionDto.class)
                .onErrorResume(e -> Flux.empty());
    }
}
