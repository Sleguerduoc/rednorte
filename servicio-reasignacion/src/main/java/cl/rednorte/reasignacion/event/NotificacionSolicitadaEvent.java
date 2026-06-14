package cl.rednorte.reasignacion.event;

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
    private String token;  // nullable; si presente, notificaciones adjunta el link de confirmación
}
