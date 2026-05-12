package cl.rednorte.gateway.bff.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SolicitudDto {
    private Long   id;
    private Long   pacienteId;
    private String especialidad;
    private String prioridad;
    private String estado;

    /** Deserializa tanto el formato array [año,mes,día,h,m,s] como ISO string. */
    @JsonDeserialize(using = LocalDateTimeStringDeserializer.class)
    private String fechaRegistro;
}
