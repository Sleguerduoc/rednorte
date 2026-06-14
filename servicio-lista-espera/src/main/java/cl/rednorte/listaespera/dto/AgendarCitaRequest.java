package cl.rednorte.listaespera.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AgendarCitaRequest {

    @NotNull
    private Long solicitudId;

    @NotNull
    private LocalDate fecha;

    @NotNull
    private LocalTime hora;
}
