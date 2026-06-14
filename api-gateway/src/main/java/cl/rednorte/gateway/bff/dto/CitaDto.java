package cl.rednorte.gateway.bff.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CitaDto {
    private Long   id;
    private Long   solicitudId;
    private Long   pacienteId;
    private String especialidad;

    @JsonDeserialize(using = LocalDateStringDeserializer.class)
    private String fecha;

    @JsonDeserialize(using = LocalTimeStringDeserializer.class)
    private String hora;

    private String estado;

    @JsonDeserialize(using = LocalDateTimeStringDeserializer.class)
    private String horaCheckIn;
}
