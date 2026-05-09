package cl.rednorte.listaespera.event;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitaCanceladaEvent {
    private Long citaId;
    private String especialidad;
    private String fecha;
}