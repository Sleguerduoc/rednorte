package cl.rednorte.reasignacion.event;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitaCanceladaEvent {
    private Long citaId;
    private Long pacienteId;
    private String especialidad;
    private String fecha;
}
