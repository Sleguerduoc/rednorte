package cl.rednorte.gateway.bff.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PacienteDto {
    private Long   id;
    private String rut;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String estado;
}
