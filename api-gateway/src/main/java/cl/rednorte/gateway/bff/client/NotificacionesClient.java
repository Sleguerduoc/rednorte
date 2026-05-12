package cl.rednorte.gateway.bff.client;

import cl.rednorte.gateway.bff.dto.NotificacionDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Component
public class NotificacionesClient {

    private final WebClient webClient;

    public NotificacionesClient(
            WebClient.Builder builder,
            @Value("${services.notificaciones.url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    public Flux<NotificacionDto> listar() {
        return webClient.get()
                .uri("/notificaciones")
                .retrieve()
                .bodyToFlux(NotificacionDto.class)
                .onErrorResume(e -> Flux.empty());
    }
}
