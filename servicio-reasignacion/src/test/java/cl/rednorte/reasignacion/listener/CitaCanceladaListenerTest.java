package cl.rednorte.reasignacion.listener;

import cl.rednorte.reasignacion.event.CitaCanceladaEvent;
import cl.rednorte.reasignacion.service.ReasignacionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CitaCanceladaListenerTest {

    @Mock
    private ReasignacionService service;

    @InjectMocks
    private CitaCanceladaListener citaCanceladaListener;

    @Test
    void recibirEvento_delegaEnServicioConElMismoEvento() {
        CitaCanceladaEvent evento = CitaCanceladaEvent.builder()
                .citaId(100L)
                .pacienteId(1L)
                .especialidad("Cardiologia")
                .fecha("2026-06-20")
                .build();

        citaCanceladaListener.recibirEvento(evento);

        ArgumentCaptor<CitaCanceladaEvent> eventoCaptor = ArgumentCaptor.forClass(CitaCanceladaEvent.class);
        verify(service).procesarCancelacion(eventoCaptor.capture());

        CitaCanceladaEvent capturado = eventoCaptor.getValue();
        assertEquals(100L, capturado.getCitaId());
        assertEquals(1L, capturado.getPacienteId());
        assertEquals("Cardiologia", capturado.getEspecialidad());
        assertEquals("2026-06-20", capturado.getFecha());
    }
}
