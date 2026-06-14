package cl.rednorte.gateway.bff.service;

import cl.rednorte.gateway.bff.client.ListaEsperaClient;
import cl.rednorte.gateway.bff.client.NotificacionesClient;
import cl.rednorte.gateway.bff.client.PacientesClient;
import cl.rednorte.gateway.bff.client.ReasignacionClient;
import cl.rednorte.gateway.bff.dto.CitaCompletaResponse;
import cl.rednorte.gateway.bff.dto.CitaDto;
import cl.rednorte.gateway.bff.dto.DashboardResponse;
import cl.rednorte.gateway.bff.dto.OfertaDto;
import cl.rednorte.gateway.bff.dto.OfertaResponse;
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

    private static final String PACIENTE_DESCONOCIDO = "Paciente ";

    private final PacientesClient      pacientesClient;
    private final ListaEsperaClient    listaEsperaClient;
    private final ReasignacionClient   reasignacionClient;
    private final NotificacionesClient notificacionesClient;

    // ── Endpoints existentes (sin cambios) ───────────────────────────────────

    public Mono<DashboardResponse> getDashboard() {
        Mono<List<PacienteDto>> pacientesMono =
                pacientesClient.listar().collectList().onErrorReturn(Collections.emptyList());
        Mono<List<SolicitudDto>> solicitudesMono =
                listaEsperaClient.listar().collectList().onErrorReturn(Collections.emptyList());
        Mono<Long> reasignacionesMono =
                reasignacionClient.listar().count().onErrorReturn(0L);
        Mono<Long> notificacionesMono =
                notificacionesClient.listar().count().onErrorReturn(0L);

        return Mono.zip(pacientesMono, solicitudesMono, reasignacionesMono, notificacionesMono)
                .map(tuple -> {
                    List<PacienteDto>  pacientes   = tuple.getT1();
                    List<SolicitudDto> solicitudes = tuple.getT2();
                    long reasignaciones            = tuple.getT3();
                    long notificaciones            = tuple.getT4();

                    long pendientes = solicitudes.stream()
                            .filter(s -> "PENDIENTE".equalsIgnoreCase(s.getEstado())).count();
                    long canceladas = solicitudes.stream()
                            .filter(s -> "CANCELADA".equalsIgnoreCase(s.getEstado())).count();

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

    public Flux<SolicitudCompletaResponse> getListaCompletaConPacientes() {
        Mono<List<PacienteDto>> pacientesMono =
                pacientesClient.listar().collectList().onErrorReturn(Collections.emptyList());
        Mono<List<SolicitudDto>> solicitudesMono =
                listaEsperaClient.listar().collectList().onErrorReturn(Collections.emptyList());

        return Mono.zip(pacientesMono, solicitudesMono)
                .flatMapMany(tuple -> {
                    Map<Long, PacienteDto> mapa = toMap(tuple.getT1());
                    return Flux.fromIterable(tuple.getT2()).map(s -> enriquecerSolicitud(s, mapa));
                });
    }

    // ── Nuevos endpoints (Fase 8A) ───────────────────────────────────────────

    /** Citas de un día con nombre de paciente, para la "Sala del día". */
    public Flux<CitaCompletaResponse> getSalaDelDia(String fecha) {
        Mono<List<PacienteDto>> pacientesMono =
                pacientesClient.listar().collectList().onErrorReturn(Collections.emptyList());
        Mono<List<CitaDto>> citasMono =
                listaEsperaClient.listarCitasDelDia(fecha).collectList().onErrorReturn(Collections.emptyList());

        return Mono.zip(pacientesMono, citasMono)
                .flatMapMany(tuple -> {
                    Map<Long, PacienteDto> mapa = toMap(tuple.getT1());
                    return Flux.fromIterable(tuple.getT2()).map(c -> enriquecerCita(c, mapa));
                });
    }

    /** Solicitudes en estado PENDIENTE enriquecidas con nombre de paciente. */
    public Flux<SolicitudCompletaResponse> getListaEsperaPendiente() {
        return getListaCompletaConPacientes()
                .filter(s -> "PENDIENTE".equalsIgnoreCase(s.getEstado()));
    }

    /** Todas las ofertas con nombre de paciente, para el panel de admin. */
    public Flux<OfertaResponse> getOfertas() {
        Mono<List<PacienteDto>> pacientesMono =
                pacientesClient.listar().collectList().onErrorReturn(Collections.emptyList());
        Mono<List<OfertaDto>> ofertasMono =
                reasignacionClient.listarOfertas().collectList().onErrorReturn(Collections.emptyList());

        return Mono.zip(pacientesMono, ofertasMono)
                .flatMapMany(tuple -> {
                    Map<Long, PacienteDto> mapa = toMap(tuple.getT1());
                    return Flux.fromIterable(tuple.getT2()).map(o -> enriquecerOferta(o, mapa));
                });
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Map<Long, PacienteDto> toMap(List<PacienteDto> lista) {
        return lista.stream().collect(Collectors.toMap(PacienteDto::getId, p -> p));
    }

    private SolicitudCompletaResponse enriquecerSolicitud(SolicitudDto s, Map<Long, PacienteDto> mapa) {
        PacienteDto paciente = mapa.get(s.getPacienteId());
        String nombre = paciente != null ? buildNombre(paciente) : PACIENTE_DESCONOCIDO +s.getPacienteId();
        String rut    = paciente != null ? paciente.getRut() : null;
        return SolicitudCompletaResponse.builder()
                .id(s.getId())
                .pacienteId(s.getPacienteId())
                .pacienteRut(rut)
                .pacienteNombre(nombre)
                .especialidad(s.getEspecialidad())
                .estado(s.getEstado())
                .prioridad(s.getPrioridad())
                .fechaRegistro(s.getFechaRegistro())
                .build();
    }

    private CitaCompletaResponse enriquecerCita(CitaDto c, Map<Long, PacienteDto> mapa) {
        PacienteDto paciente = mapa.get(c.getPacienteId());
        String nombre = paciente != null ? buildNombre(paciente) : PACIENTE_DESCONOCIDO +c.getPacienteId();
        return CitaCompletaResponse.builder()
                .id(c.getId())
                .pacienteId(c.getPacienteId())
                .pacienteNombre(nombre)
                .especialidad(c.getEspecialidad())
                .fecha(c.getFecha())
                .hora(c.getHora())
                .estado(c.getEstado())
                .horaCheckIn(c.getHoraCheckIn())
                .build();
    }

    private OfertaResponse enriquecerOferta(OfertaDto o, Map<Long, PacienteDto> mapa) {
        PacienteDto paciente = mapa.get(o.getPacienteId());
        String nombre = paciente != null ? buildNombre(paciente) : PACIENTE_DESCONOCIDO +o.getPacienteId();
        return OfertaResponse.builder()
                .id(o.getId())
                .token(o.getToken())
                .pacienteId(o.getPacienteId())
                .pacienteNombre(nombre)
                .especialidad(o.getEspecialidad())
                .fechaCupo(o.getFechaCupo())
                .horaCupo(o.getHoraCupo())
                .estado(o.getEstado())
                .origen(o.getOrigen())
                .creadaEn(o.getCreadaEn())
                .expiraEn(o.getExpiraEn())
                .prioridadMinima(o.getPrioridadMinima())
                .build();
    }

    private String buildNombre(PacienteDto p) {
        StringBuilder sb = new StringBuilder();
        if (p.getNombres()         != null) sb.append(p.getNombres()).append(" ");
        if (p.getApellidoPaterno() != null) sb.append(p.getApellidoPaterno()).append(" ");
        if (p.getApellidoMaterno() != null) sb.append(p.getApellidoMaterno());
        String result = sb.toString().trim();
        return result.isBlank() ? "Sin nombre" : result;
    }
}
