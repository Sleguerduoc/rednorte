package cl.rednorte.reasignacion.listener;

import cl.rednorte.reasignacion.config.RabbitConfig;
import cl.rednorte.reasignacion.event.CitaCanceladaEvent;
import cl.rednorte.reasignacion.service.ReasignacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CitaCanceladaListener {

    private final ReasignacionService service;

    @RabbitListener(queues = RabbitConfig.COLA_CITA_CANCELADA)
    public void recibirEvento(CitaCanceladaEvent evento) {
        service.procesarCancelacion(evento);
    }
}