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
    private String token;  // nullable; si presente, se adjunta el link de confirmación
}
