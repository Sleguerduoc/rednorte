package cl.rednorte.listaespera.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String COLA_CITA_CANCELADA = "cita.cancelada";

    @Bean
    public Queue citaCanceladaQueue() {
        return new Queue(COLA_CITA_CANCELADA, true);
    }
}