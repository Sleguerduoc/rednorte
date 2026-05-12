package cl.rednorte.listaespera.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "RedNorte — Servicio Lista de Espera",
        version     = "2.0",
        description = "Gestión de solicitudes de lista de espera y cancelación de citas."
    )
)
public class OpenApiConfig {}
