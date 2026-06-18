package cl.rednorte.notificaciones.listener;

import cl.rednorte.notificaciones.event.NotificacionSolicitadaEvent;
import cl.rednorte.notificaciones.service.NotificacionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificacionListenerTest {

    @Mock
    private NotificacionService service;

    @InjectMocks
    private NotificacionListener listener;

    @Test
    void recibir_delegaEnElServicio() {
        NotificacionSolicitadaEvent evento = NotificacionSolicitadaEvent.builder()
                .pacienteId(1L).mensaje("Recordatorio").canal("EMAIL").build();

        listener.recibir(evento);

        verify(service).procesar(evento);
    }
}
