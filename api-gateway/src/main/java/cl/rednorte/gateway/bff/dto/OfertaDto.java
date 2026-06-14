package cl.rednorte.gateway.bff.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OfertaDto {
    private Long   id;
    private String token;
    private Long   pacienteId;
    private Long   solicitudId;
    private Long   citaId;
    private String especialidad;

    @JsonDeserialize(using = LocalDateStringDeserializer.class)
    private String fechaCupo;

    @JsonDeserialize(using = LocalTimeStringDeserializer.class)
    private String horaCupo;

    private String estado;
    private String origen;

    @JsonDeserialize(using = LocalDateTimeStringDeserializer.class)
    private String creadaEn;

    @JsonDeserialize(using = LocalDateTimeStringDeserializer.class)
    private String expiraEn;

    private String prioridadMinima;
}
