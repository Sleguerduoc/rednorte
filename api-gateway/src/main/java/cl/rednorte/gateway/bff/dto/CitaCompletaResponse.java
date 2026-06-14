package cl.rednorte.gateway.bff.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CitaCompletaResponse {
    private Long   id;
    private Long   pacienteId;
    private String pacienteNombre;
    private String especialidad;
    private String fecha;
    private String hora;
    private String estado;
    private String horaCheckIn;
}
