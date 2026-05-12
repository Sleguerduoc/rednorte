package cl.rednorte.gateway.bff.service;

import cl.rednorte.gateway.bff.client.ListaEsperaClient;
import cl.rednorte.gateway.bff.client.NotificacionesClient;
import cl.rednorte.gateway.bff.client.PacientesClient;
import cl.rednorte.gateway.bff.client.ReasignacionClient;
import cl.rednorte.gateway.bff.dto.DashboardResponse;
import cl.rednorte.gateway.bff.dto.PacienteDto;
import cl.rednorte.gateway.bff.dto.SolicitudCompletaResponse;
import cl.rednorte.gateway.bff.dto.SolicitudDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BffService {

    private final PacientesClient     pacientesClient;
    private final ListaEsperaClient   listaEsperaClient;
    private final ReasignacionClient  reasignacionClient;
    private final NotificacionesClient notificacionesClient;

    /**
     * Agrega datos de los 4 microservicios en paralelo.
     * Si alguno falla, devuelve 0 para ese indicador (no rompe el dashboard).
     */
    public Mono<DashboardResponse> getDashboard() {

        Mono<List<PacienteDto>> pacientesMono =
                pacientesClient.listar()
                        .collectList()
                        .onErrorReturn(Collections.emptyList());

        Mono<List<SolicitudDto>> solicitudesMono =
                listaEsperaClient.listar()
                        .collectList()
                        .onErrorReturn(Collections.emptyList());

        Mono<Long> reasignacionesMono =
                reasignacionClient.listar()
                        .count()
                        .onErrorReturn(0L);

        Mono<Long> notificacionesMono =
                notificacionesClient.listar()
                        .count()
                        .onErrorReturn(0L);

        return Mono.zip(pacientesMono, solicitudesMono, reasignacionesMono, notificacionesMono)
                .map(tuple -> {
                    List<PacienteDto>  pacientes   = tuple.getT1();
                    List<SolicitudDto> solicitudes = tuple.getT2();
                    long reasignaciones            = tuple.getT3();
                    long notificaciones            = tuple.getT4();

                    long pendientes = solicitudes.stream()
                            .filter(s -> "PENDIENTE".equalsIgnoreCase(s.getEstado()))
                            .count();

                    long canceladas = solicitudes.stream()
                            .filter(s -> "CANCELADA".equalsIgnoreCase(s.getEstado()))
                            .count();

                    return DashboardResponse.builder()
                            .totalPacientes(pacientes.size())
                            .totalSolicitudes(solicitudes.size())
                            .solicitudesPendientes(pendientes)
                            .solicitudesCanceladas(canceladas)
                            .totalReasignaciones(reasignaciones)
                            .totalNotificaciones(notificaciones)
                            .build();
                });
    }

    /**
     * Obtiene solicitudes en paralelo con pacientes, enriquece cada solicitud
     * con el nombre completo del paciente y retorna el resultado adaptado al frontend.
     */
    public Flux<SolicitudCompletaResponse> getListaCompletaConPacientes() {

        Mono<List<PacienteDto>> pacientesMono =
                pacientesClient.listar()
                        .collectList()
                        .onErrorReturn(Collections.emptyList());

        Mono<List<SolicitudDto>> solicitudesMono =
                listaEsperaClient.listar()
                        .collectList()
                        .onErrorReturn(Collections.emptyList());

        return Mono.zip(pacientesMono, solicitudesMono)
                .flatMapMany(tuple -> {
                    Map<Long, PacienteDto> mapaPacientes = tuple.getT1().stream()
                            .collect(Collectors.toMap(PacienteDto::getId, p -> p));

                    return Flux.fromIterable(tuple.getT2())
                            .map(s -> enriquecer(s, mapaPacientes));
                });
    }

    // ── helpers ───────────────────────────────────────────────────────────

    private SolicitudCompletaResponse enriquecer(SolicitudDto s,
                                                  Map<Long, PacienteDto> mapa) {
        PacienteDto paciente = mapa.get(s.getPacienteId());

        String nombre = (paciente != null)
                ? buildNombreCompleto(paciente)
                : "Paciente " + s.getPacienteId();

        String rut = (paciente != null) ? paciente.getRut() : null;

        return SolicitudCompletaResponse.builder()
                .id(s.getId())
                .pacienteId(s.getPacienteId())
                .pacienteRut(rut)
                .pacienteNombre(nombre.trim())
                .especialidad(s.getEspecialidad())
                .estado(s.getEstado())
                .prioridad(s.getPrioridad())
                .fechaRegistro(s.getFechaRegistro())
                .build();
    }

    private String buildNombreCompleto(PacienteDto p) {
        StringBuilder sb = new StringBuilder();
        if (p.getNombres()         != null) sb.append(p.getNombres()).append(" ");
        if (p.getApellidoPaterno() != null) sb.append(p.getApellidoPaterno()).append(" ");
        if (p.getApellidoMaterno() != null) sb.append(p.getApellidoMaterno());
        return sb.toString().isBlank() ? "Sin nombre" : sb.toString();
    }
}
