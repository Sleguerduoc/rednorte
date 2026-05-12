package cl.rednorte.gateway.bff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudCompletaResponse {
    private Long   id;
    private Long   pacienteId;
    private String pacienteRut;
    private String pacienteNombre;
    private String especialidad;
    private String estado;
    private String prioridad;
    private String fechaRegistro;
}
