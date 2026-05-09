package cl.rednorte.reasignacion.service;

import cl.rednorte.reasignacion.config.RabbitConfig;
import cl.rednorte.reasignacion.event.CitaCanceladaEvent;
import cl.rednorte.reasignacion.event.NotificacionSolicitadaEvent;
import cl.rednorte.reasignacion.model.Reasignacion;
import cl.rednorte.reasignacion.repository.ReasignacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReasignacionService {

    private final ReasignacionRepository repository;
    private final RabbitTemplate rabbitTemplate;

    public void procesarCancelacion(CitaCanceladaEvent evento) {
        Reasignacion reasignacion = Reasignacion.builder()
                .citaId(evento.getCitaId())
                .especialidad(evento.getEspecialidad())
                .fecha(evento.getFecha())
                .estado("REASIGNACION_GENERADA")
                .fechaProcesamiento(LocalDateTime.now())
                .build();

        repository.save(reasignacion);

        String mensaje = "Se ha liberado una cita para "
        + evento.getEspecialidad()
        + " en la fecha "
        + evento.getFecha();

        NotificacionSolicitadaEvent notificacionEmail = NotificacionSolicitadaEvent.builder()
                .pacienteId(1L)
                .canal("EMAIL")
                .mensaje(mensaje)
                .build();

        NotificacionSolicitadaEvent notificacionSms = NotificacionSolicitadaEvent.builder()
                .pacienteId(1L)
                .canal("SMS")
                .mensaje(mensaje)
                .build();

        rabbitTemplate.convertAndSend(RabbitConfig.COLA_NOTIFICACION_SOLICITADA, notificacionEmail);
        rabbitTemplate.convertAndSend(RabbitConfig.COLA_NOTIFICACION_SOLICITADA, notificacionSms);
    }
}