package cl.rednorte.gateway.bff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalPacientes;
    private long totalSolicitudes;
    private long solicitudesPendientes;
    private long solicitudesCanceladas;
    private long totalReasignaciones;
    private long totalNotificaciones;
}
