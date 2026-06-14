package cl.rednorte.gateway.bff.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OfertaResponse {
    private Long   id;
    private String token;
    private Long   pacienteId;
    private String pacienteNombre;
    private String especialidad;
    private String fechaCupo;
    private String horaCupo;
    private String estado;
    private String origen;
    private String creadaEn;
    private String expiraEn;
    private String prioridadMinima;
}
