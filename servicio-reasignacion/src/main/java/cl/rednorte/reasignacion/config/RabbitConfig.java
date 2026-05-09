package cl.rednorte.reasignacion.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;

@Configuration
public class RabbitConfig {

    public static final String COLA_CITA_CANCELADA = "cita.cancelada";
    public static final String COLA_NOTIFICACION_SOLICITADA = "notificacion.solicitada";

    @Bean
    public Queue citaCanceladaQueue() {
        return new Queue(COLA_CITA_CANCELADA, true);
    }

    @Bean
    public Queue notificacionSolicitadaQueue() {
        return new Queue(COLA_NOTIFICACION_SOLICITADA, true);
    }
    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
}
}