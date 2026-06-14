package cl.rednorte.gateway.bff.client;

import cl.rednorte.gateway.bff.dto.CitaDto;
import cl.rednorte.gateway.bff.dto.SolicitudDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Component
public class ListaEsperaClient {

    private final WebClient webClient;

    public ListaEsperaClient(@Value("${services.lista-espera.url}") String baseUrl) {
        this.webClient = WebClient.create(baseUrl);
    }

    public Flux<SolicitudDto> listar() {
        return webClient.get()
                .uri("/listas-espera")
                .retrieve()
                .bodyToFlux(SolicitudDto.class)
                .onErrorResume(e -> Flux.empty());
    }

    public Flux<CitaDto> listarCitasDelDia(String fecha) {
        return webClient.get()
                .uri(u -> u.path("/citas/del-dia").queryParam("fecha", fecha).build())
                .retrieve()
                .bodyToFlux(CitaDto.class)
                .onErrorResume(e -> Flux.empty());
    }
}
