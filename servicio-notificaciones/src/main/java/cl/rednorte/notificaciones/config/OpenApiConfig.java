package cl.rednorte.notificaciones.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "RedNorte — Servicio Notificaciones",
        version     = "2.0",
        description = "Envío y registro de notificaciones EMAIL y SMS a pacientes."
    )
)
public class OpenApiConfig {}
