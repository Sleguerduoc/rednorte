package cl.rednorte.gateway.bff.controller;

import cl.rednorte.gateway.bff.dto.CitaCompletaResponse;
import cl.rednorte.gateway.bff.dto.DashboardResponse;
import cl.rednorte.gateway.bff.dto.OfertaResponse;
import cl.rednorte.gateway.bff.dto.SolicitudCompletaResponse;
import cl.rednorte.gateway.bff.service.BffService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BffControllerTest {

    @Mock
    private BffService bffService;

    @InjectMocks
    private BffController controller;

    @Test
    void getDashboard_delegaEnServicio() {
        DashboardResponse dashboard = DashboardResponse.builder().totalPacientes(5).build();
        when(bffService.getDashboard()).thenReturn(Mono.just(dashboard));

        StepVerifier.create(controller.getDashboard())
                .expectNext(dashboard)
                .verifyComplete();
        verify(bffService).getDashboard();
    }

    @Test
    void getListaCompletaConPacientes_delegaEnServicio() {
        SolicitudCompletaResponse r = SolicitudCompletaResponse.builder().id(1L).build();
        when(bffService.getListaCompletaConPacientes()).thenReturn(Flux.just(r));

        StepVerifier.create(controller.getListaCompletaConPacientes())
                .expectNext(r)
                .verifyComplete();
        verify(bffService).getListaCompletaConPacientes();
    }

    @Test
    void getSalaDelDia_delegaEnServicioConLaFecha() {
        CitaCompletaResponse r = CitaCompletaResponse.builder().id(1L).build();
        when(bffService.getSalaDelDia("2026-06-16")).thenReturn(Flux.just(r));

        StepVerifier.create(controller.getSalaDelDia("2026-06-16"))
                .expectNext(r)
                .verifyComplete();
        verify(bffService).getSalaDelDia("2026-06-16");
    }

    @Test
    void getListaEsperaPendiente_delegaEnServicio() {
        SolicitudCompletaResponse r = SolicitudCompletaResponse.builder().id(2L).build();
        when(bffService.getListaEsperaPendiente()).thenReturn(Flux.just(r));

        StepVerifier.create(controller.getListaEsperaPendiente())
                .expectNext(r)
                .verifyComplete();
        verify(bffService).getListaEsperaPendiente();
    }

    @Test
    void getOfertas_delegaEnServicio() {
        OfertaResponse r = OfertaResponse.builder().id(3L).build();
        when(bffService.getOfertas()).thenReturn(Flux.just(r));

        StepVerifier.create(controller.getOfertas())
                .expectNext(r)
                .verifyComplete();
        verify(bffService).getOfertas();
    }
}
