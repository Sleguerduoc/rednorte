package cl.rednorte.reasignacion.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CandidatoMatchingDto {

    private Long pacienteId;
    private String origen;       // "LISTA_ESPERA" | "CITA_FUTURA"
    private Long solicitudId;    // presente cuando origen == LISTA_ESPERA
    private Long citaId;         // presente cuando origen == CITA_FUTURA
}
