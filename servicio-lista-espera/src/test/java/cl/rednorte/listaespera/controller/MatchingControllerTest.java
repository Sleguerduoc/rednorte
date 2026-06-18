package cl.rednorte.listaespera.controller;

import cl.rednorte.listaespera.dto.CandidatoMatchingDto;
import cl.rednorte.listaespera.model.PrioridadSolicitud;
import cl.rednorte.listaespera.service.MatchingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchingControllerTest {

    @Mock
    private MatchingService matchingService;

    @InjectMocks
    private MatchingController matchingController;

    @Test
    void obtenerCandidatos_delegaEnServicioConTodosLosParametros() {
        LocalDate fechaCupo = LocalDate.now();
        List<Long> excluir = List.of(1L, 2L);
        CandidatoMatchingDto candidato = CandidatoMatchingDto.builder().pacienteId(10L).build();

        when(matchingService.obtenerCandidatos("Cardiologia", PrioridadSolicitud.ALTA, fechaCupo, excluir))
                .thenReturn(List.of(candidato));

        List<CandidatoMatchingDto> resultado = matchingController.obtenerCandidatos(
                "Cardiologia", PrioridadSolicitud.ALTA, fechaCupo, excluir);

        assertEquals(List.of(candidato), resultado);
        verify(matchingService).obtenerCandidatos("Cardiologia", PrioridadSolicitud.ALTA, fechaCupo, excluir);
    }

    @Test
    void obtenerCandidatos_conParametrosOpcionalesNulos_delegaIgual() {
        CandidatoMatchingDto candidato = CandidatoMatchingDto.builder().pacienteId(20L).build();
        when(matchingService.obtenerCandidatos("Cardiologia", null, null, null))
                .thenReturn(List.of(candidato));

        List<CandidatoMatchingDto> resultado = matchingController.obtenerCandidatos(
                "Cardiologia", null, null, null);

        assertEquals(List.of(candidato), resultado);
        verify(matchingService).obtenerCandidatos("Cardiologia", null, null, null);
    }
}
