package cl.rednorte.gateway.bff.controller;

import cl.rednorte.gateway.bff.dto.CitaCompletaResponse;
import cl.rednorte.gateway.bff.dto.DashboardResponse;
import cl.rednorte.gateway.bff.dto.OfertaResponse;
import cl.rednorte.gateway.bff.dto.SolicitudCompletaResponse;
import cl.rednorte.gateway.bff.service.BffService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/bff")
@RequiredArgsConstructor
public class BffController {

    private final BffService bffService;

    // ── Endpoints existentes ─────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public Mono<DashboardResponse> getDashboard() {
        return bffService.getDashboard();
    }

    @GetMapping("/lista-espera/completa")
    public Flux<SolicitudCompletaResponse> getListaCompletaConPacientes() {
        return bffService.getListaCompletaConPacientes();
    }

    // ── Nuevos endpoints (Fase 8A) ───────────────────────────────────────────

    /**
     * Citas de un día enriquecidas con nombre del paciente.
     * Ejemplo: GET /bff/sala-del-dia?fecha=2026-06-14
     */
    @GetMapping("/sala-del-dia")
    public Flux<CitaCompletaResponse> getSalaDelDia(@RequestParam String fecha) {
        return bffService.getSalaDelDia(fecha);
    }

    /**
     * Solicitudes en estado PENDIENTE con nombre del paciente.
     * Para el panel de lista de espera del admin/doctor.
     */
    @GetMapping("/lista-espera")
    public Flux<SolicitudCompletaResponse> getListaEsperaPendiente() {
        return bffService.getListaEsperaPendiente();
    }

    /**
     * Todas las ofertas con nombre del paciente.
     * Para el panel de ofertas del admin.
     */
    @GetMapping("/ofertas")
    public Flux<OfertaResponse> getOfertas() {
        return bffService.getOfertas();
    }
}
