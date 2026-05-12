package cl.rednorte.gateway.bff.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReasignacionDto {
    private Long   id;
    private String estado;
}
