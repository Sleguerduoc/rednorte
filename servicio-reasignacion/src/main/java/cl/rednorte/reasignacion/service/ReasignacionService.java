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

        Reasignacion registro = Reasignacion.builder()
                .citaId(evento.getCitaId())
                .pacienteId(evento.getPacienteId())
                .especialidad(evento.getEspecialidad())
                .fecha(evento.getFecha())
                .estado("AVISO_ENVIADO")
                .fechaProcesamiento(LocalDateTime.now())
                .build();

        repository.save(registro);

        String mensajeEmail = String.format(
                "Estimado/a paciente, su cita N°%d de %s programada para el %s ha sido cancelada. " +
                "Para reagendar, comuníquese con su centro de salud RedNorte.",
                evento.getCitaId(),
                evento.getEspecialidad(),
                evento.getFecha()
        );

        String mensajeSms = String.format(
                "RedNorte: Cita N°%d de %s del %s cancelada. Contáctenos para reagendar.",
                evento.getCitaId(),
                evento.getEspecialidad(),
                evento.getFecha()
        );

        rabbitTemplate.convertAndSend(RabbitConfig.COLA_NOTIFICACION_SOLICITADA,
                NotificacionSolicitadaEvent.builder()
                        .pacienteId(evento.getPacienteId())
                        .canal("EMAIL")
                        .mensaje(mensajeEmail)
                        .build());

        rabbitTemplate.convertAndSend(RabbitConfig.COLA_NOTIFICACION_SOLICITADA,
                NotificacionSolicitadaEvent.builder()
                        .pacienteId(evento.getPacienteId())
                        .canal("SMS")
                        .mensaje(mensajeSms)
                        .build());
    }
}
