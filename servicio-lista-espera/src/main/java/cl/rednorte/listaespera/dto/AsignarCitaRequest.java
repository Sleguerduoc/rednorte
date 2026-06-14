package cl.rednorte.listaespera.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AsignarCitaRequest {

    @NotNull
    private Long pacienteId;

    @NotBlank
    private String especialidad;

    @NotBlank
    private String fecha;           // ISO: "2026-06-20"

    @NotBlank
    private String hora;            // ISO: "09:30"

    private Long solicitudId;       // presente cuando el candidato venía de LISTA_ESPERA
    private Long citaIdAReasignar;  // presente cuando el candidato venía de CITA_FUTURA
}
