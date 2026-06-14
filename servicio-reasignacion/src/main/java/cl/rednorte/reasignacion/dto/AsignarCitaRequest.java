package cl.rednorte.reasignacion.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AsignarCitaRequest {
    private Long pacienteId;
    private String especialidad;
    private String fecha;           // ISO: "2026-06-20"
    private String hora;            // ISO: "09:30"
    private Long solicitudId;
    private Long citaIdAReasignar;
}
