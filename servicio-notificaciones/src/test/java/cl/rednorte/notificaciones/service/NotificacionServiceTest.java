package cl.rednorte.notificaciones.service;

import cl.rednorte.notificaciones.event.NotificacionSolicitadaEvent;
import cl.rednorte.notificaciones.model.Notificacion;
import cl.rednorte.notificaciones.repository.NotificacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    @Mock
    private NotificacionRepository repository;

    @InjectMocks
    private NotificacionService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "urlBase", "http://localhost:5173");
    }

    @Test
    void procesar_conToken_agregaEnlaceDeConfirmacionYGuardaConCanalEmail() {
        NotificacionSolicitadaEvent evento = NotificacionSolicitadaEvent.builder()
                .pacienteId(1L)
                .mensaje("Su cita fue reasignada")
                .canal("EMAIL")
                .token("abc-123")
                .build();

        service.procesar(evento);

        ArgumentCaptor<Notificacion> captor = ArgumentCaptor.forClass(Notificacion.class);
        verify(repository).save(captor.capture());
        Notificacion guardada = captor.getValue();
        assertEquals(1L, guardada.getPacienteId());
        assertEquals("EMAIL", guardada.getCanal());
        assertTrue(guardada.getMensaje().contains("Su cita fue reasignada"));
        assertTrue(guardada.getMensaje().contains("http://localhost:5173/confirmar?token=abc-123"));
        assertEquals("ENVIADA", guardada.getEstado());
    }

    @Test
    void procesar_sinToken_noAgregaEnlaceYGuardaConCanalSms() {
        NotificacionSolicitadaEvent evento = NotificacionSolicitadaEvent.builder()
                .pacienteId(2L)
                .mensaje("Recordatorio de cita")
                .canal("SMS")
                .token(null)
                .build();

        service.procesar(evento);

        ArgumentCaptor<Notificacion> captor = ArgumentCaptor.forClass(Notificacion.class);
        verify(repository).save(captor.capture());
        Notificacion guardada = captor.getValue();
        assertEquals(2L, guardada.getPacienteId());
        assertEquals("SMS", guardada.getCanal());
        assertEquals("Recordatorio de cita", guardada.getMensaje());
        assertFalse(guardada.getMensaje().contains("confirmar?token"));
        assertEquals("ENVIADA", guardada.getEstado());
    }

    @Test
    void procesar_tokenEnBlanco_noAgregaEnlace() {
        NotificacionSolicitadaEvent evento = NotificacionSolicitadaEvent.builder()
                .pacienteId(3L)
                .mensaje("Aviso")
                .canal("EMAIL")
                .token("   ")
                .build();

        service.procesar(evento);

        ArgumentCaptor<Notificacion> captor = ArgumentCaptor.forClass(Notificacion.class);
        verify(repository).save(captor.capture());
        assertEquals("Aviso", captor.getValue().getMensaje());
    }
}
