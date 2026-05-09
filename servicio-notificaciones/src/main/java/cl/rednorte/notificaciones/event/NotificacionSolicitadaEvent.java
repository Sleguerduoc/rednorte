package cl.rednorte.notificaciones.event;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificacionSolicitadaEvent {
    private Long pacienteId;
    private String mensaje;
    private String canal;
}