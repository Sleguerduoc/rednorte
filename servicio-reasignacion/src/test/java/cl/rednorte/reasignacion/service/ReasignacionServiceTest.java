package cl.rednorte.reasignacion.service;

import cl.rednorte.reasignacion.config.RabbitConfig;
import cl.rednorte.reasignacion.event.CitaCanceladaEvent;
import cl.rednorte.reasignacion.event.NotificacionSolicitadaEvent;
import cl.rednorte.reasignacion.model.Reasignacion;
import cl.rednorte.reasignacion.repository.ReasignacionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ReasignacionServiceTest {

    @Mock
    private ReasignacionRepository repository;
    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private ReasignacionService reasignacionService;

    @Test
    void procesarCancelacion_generaRegistroYPublicaNotificacionesEmailYSms() {
        CitaCanceladaEvent evento = CitaCanceladaEvent.builder()
                .citaId(100L)
                .pacienteId(1L)
                .especialidad("Cardiologia")
                .fecha("2026-06-20")
                .build();

        reasignacionService.procesarCancelacion(evento);

        ArgumentCaptor<Reasignacion> registroCaptor = ArgumentCaptor.forClass(Reasignacion.class);
        verify(repository).save(registroCaptor.capture());
        Reasignacion registro = registroCaptor.getValue();
        assertEquals(100L, registro.getCitaId());
        assertEquals(1L, registro.getPacienteId());
        assertEquals("Cardiologia", registro.getEspecialidad());
        assertEquals("2026-06-20", registro.getFecha());
        assertEquals("AVISO_ENVIADO", registro.getEstado());

        ArgumentCaptor<NotificacionSolicitadaEvent> notifCaptor =
                ArgumentCaptor.forClass(NotificacionSolicitadaEvent.class);
        verify(rabbitTemplate, times(2))
                .convertAndSend(eq(RabbitConfig.COLA_NOTIFICACION_SOLICITADA), notifCaptor.capture());

        List<NotificacionSolicitadaEvent> notificaciones = notifCaptor.getAllValues();
        assertEquals(2, notificaciones.size());
        assertEquals("EMAIL", notificaciones.get(0).getCanal());
        assertEquals(1L, notificaciones.get(0).getPacienteId());
        assertEquals("SMS", notificaciones.get(1).getCanal());
        assertEquals(1L, notificaciones.get(1).getPacienteId());
    }
}
