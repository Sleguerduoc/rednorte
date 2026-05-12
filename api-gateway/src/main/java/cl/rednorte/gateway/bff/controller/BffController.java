package cl.rednorte.gateway.bff.controller;

import cl.rednorte.gateway.bff.dto.DashboardResponse;
import cl.rednorte.gateway.bff.dto.SolicitudCompletaResponse;
import cl.rednorte.gateway.bff.service.BffService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/bff")
@RequiredArgsConstructor
public class BffController {

    private final BffService bffService;

    /**
     * Agrega totales de los 4 microservicios en una sola respuesta.
     * Requiere JWT válido (validado por JwtAuthFilter).
     */
    @GetMapping("/dashboard")
    public Mono<DashboardResponse> getDashboard() {
        return bffService.getDashboard();
    }

    /**
     * Devuelve las solicitudes de lista de espera enriquecidas con
     * datos del paciente (nombre completo, RUT).
     * Requiere JWT válido (validado por JwtAuthFilter).
     */
    @GetMapping("/lista-espera/completa")
    public Flux<SolicitudCompletaResponse> getListaCompletaConPacientes() {
        return bffService.getListaCompletaConPacientes();
    }
}
