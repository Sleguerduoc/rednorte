package cl.rednorte.reasignacion.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "RedNorte — Servicio Reasignación",
        version     = "2.0",
        description = "Registra cancelaciones y dispara avisos de reagendamiento al paciente."
    )
)
public class OpenApiConfig {}
