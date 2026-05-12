package cl.rednorte.pacientes.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "RedNorte — Servicio Pacientes",
        version     = "2.0",
        description = "Gestión de pacientes: registro, búsqueda y eliminación."
    )
)
public class OpenApiConfig {}
