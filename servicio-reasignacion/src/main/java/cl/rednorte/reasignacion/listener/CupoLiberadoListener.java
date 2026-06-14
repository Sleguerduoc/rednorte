package cl.rednorte.reasignacion.listener;

import cl.rednorte.reasignacion.config.RabbitConfig;
import cl.rednorte.reasignacion.event.CupoLiberadoEvent;
import cl.rednorte.reasignacion.service.OfertaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CupoLiberadoListener {

    private final OfertaService ofertaService;

    @RabbitListener(queues = RabbitConfig.COLA_CUPO_LIBERADO)
    public void recibirEvento(CupoLiberadoEvent evento) {
        try {
            ofertaService.procesarCupoLiberado(evento);
        } catch (Exception e) {
            log.error("Error procesando CupoLiberadoEvent esp={} fecha={}: {}",
                    evento.getEspecialidad(), evento.getFechaCupo(), e.getMessage(), e);
        }
    }
}
