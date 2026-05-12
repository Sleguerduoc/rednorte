package cl.rednorte.gateway.auth.model;

import lombok.Data;

@Data
public class PacienteResponseDto {
    private Long   id;
    private String rut;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
}
