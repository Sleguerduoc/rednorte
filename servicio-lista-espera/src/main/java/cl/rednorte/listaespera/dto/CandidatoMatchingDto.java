package cl.rednorte.listaespera.dto;

import cl.rednorte.listaespera.model.OrigenCandidato;
import cl.rednorte.listaespera.model.PrioridadSolicitud;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CandidatoMatchingDto {

    private Long pacienteId;
    private PrioridadSolicitud prioridad;
    private String especialidad;
    private OrigenCandidato origen;
    private LocalDateTime fechaRegistroSolicitud;

    // Solo presente cuando origen == LISTA_ESPERA
    private Long solicitudId;

    // Solo presente cuando origen == CITA_FUTURA
    private Long citaId;
    private LocalDate fechaCita;
    private LocalTime horaCita;
}
