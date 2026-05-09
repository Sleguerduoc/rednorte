package cl.rednorte.notificaciones.listener;

import cl.rednorte.notificaciones.config.RabbitConfig;
import cl.rednorte.notificaciones.event.NotificacionSolicitadaEvent;
import cl.rednorte.notificaciones.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificacionListener {

    private final NotificacionService service;

    @RabbitListener(queues = RabbitConfig.COLA_NOTIFICACION_SOLICITADA)
    public void recibir(NotificacionSolicitadaEvent evento) {
        service.procesar(evento);
    }
}