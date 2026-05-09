package cl.rednorte.notificaciones.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String COLA_NOTIFICACION_SOLICITADA = "notificacion.solicitada";

    @Bean
    public Queue notificacionSolicitadaQueue() {
        return new Queue(COLA_NOTIFICACION_SOLICITADA, true);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}