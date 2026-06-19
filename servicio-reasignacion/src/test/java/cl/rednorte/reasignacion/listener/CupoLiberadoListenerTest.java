package cl.rednorte.reasignacion.listener;

import cl.rednorte.reasignacion.event.CupoLiberadoEvent;
import cl.rednorte.reasignacion.service.OfertaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CupoLiberadoListenerTest {

    @Mock
    private OfertaService ofertaService;

    @InjectMocks
    private CupoLiberadoListener cupoLiberadoListener;

    private CupoLiberadoEvent crearEvento() {
        return CupoLiberadoEvent.builder()
                .especialidad("Cardiologia")
                .fechaCupo("2026-06-20")
                .horaCupo("09:30")
                .prioridadMinima("ALTA")
                .origen("CANCELACION_FUTURA")
                .pacientesExcluidos(List.of(1L, 2L))
                .build();
    }

    @Test
    void recibirEvento_delegaEnOfertaService() {
        CupoLiberadoEvent evento = crearEvento();

        cupoLiberadoListener.recibirEvento(evento);

        verify(ofertaService).procesarCupoLiberado(evento);
    }

    @Test
    void recibirEvento_siOfertaServiceLanzaExcepcion_noPropaga() {
        CupoLiberadoEvent evento = crearEvento();
        doThrow(new RuntimeException("fallo simulado")).when(ofertaService).procesarCupoLiberado(any());

        assertDoesNotThrow(() -> cupoLiberadoListener.recibirEvento(evento));

        verify(ofertaService).procesarCupoLiberado(evento);
    }
}
