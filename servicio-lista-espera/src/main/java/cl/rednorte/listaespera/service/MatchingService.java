package cl.rednorte.listaespera.service;

import cl.rednorte.listaespera.dto.CandidatoMatchingDto;
import cl.rednorte.listaespera.model.*;
import cl.rednorte.listaespera.repository.CitaRepository;
import cl.rednorte.listaespera.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final SolicitudRepository solicitudRepository;
    private final CitaRepository citaRepository;

    public List<CandidatoMatchingDto> obtenerCandidatos(
            String especialidad,
            PrioridadSolicitud prioridadMinima,
            LocalDate fechaCupo,
            List<Long> excluir) {

        Set<Long> excluidos = excluir == null ? Set.of() : new HashSet<>(excluir);

        // --- Tipo A: solicitudes PENDIENTE de la especialidad ---
        List<CandidatoMatchingDto> tipoA = solicitudRepository
                .findByEspecialidadAndEstado(especialidad, EstadoSolicitud.PENDIENTE)
                .stream()
                .filter(s -> !excluidos.contains(s.getPacienteId()))
                .map(s -> CandidatoMatchingDto.builder()
                        .pacienteId(s.getPacienteId())
                        .prioridad(s.getPrioridad() != null ? s.getPrioridad() : PrioridadSolicitud.NORMAL)
                        .especialidad(s.getEspecialidad())
                        .origen(OrigenCandidato.LISTA_ESPERA)
                        .fechaRegistroSolicitud(s.getFechaRegistro())
                        .solicitudId(s.getId())
                        .build())
                .collect(Collectors.toList());

        // --- Tipo B: citas PROGRAMADA con fecha posterior a fechaCupo ---
        List<CandidatoMatchingDto> tipoB = new ArrayList<>();
        if (fechaCupo != null) {
            List<Cita> citasFuturas = citaRepository
                    .findByEspecialidadAndEstadoAndFechaAfter(especialidad, EstadoCita.PROGRAMADA, fechaCupo);

            // Cargamos las solicitudes origen en una sola consulta
            Set<Long> solicitudIds = citasFuturas.stream()
                    .map(Cita::getSolicitudId)
                    .collect(Collectors.toSet());
            Map<Long, SolicitudListaEspera> solicitudesById = solicitudRepository.findAllById(solicitudIds)
                    .stream()
                    .collect(Collectors.toMap(SolicitudListaEspera::getId, s -> s));

            tipoB = citasFuturas.stream()
                    .filter(c -> !excluidos.contains(c.getPacienteId()))
                    .filter(c -> solicitudesById.containsKey(c.getSolicitudId()))
                    .map(c -> {
                        SolicitudListaEspera sol = solicitudesById.get(c.getSolicitudId());
                        return CandidatoMatchingDto.builder()
                                .pacienteId(c.getPacienteId())
                                .prioridad(sol.getPrioridad() != null ? sol.getPrioridad() : PrioridadSolicitud.NORMAL)
                                .especialidad(c.getEspecialidad())
                                .origen(OrigenCandidato.CITA_FUTURA)
                                .fechaRegistroSolicitud(sol.getFechaRegistro())
                                .citaId(c.getId())
                                .fechaCita(c.getFecha())
                                .horaCita(c.getHora())
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        // --- Combinar, filtrar por prioridad mínima y ordenar ---
        return Stream.concat(tipoA.stream(), tipoB.stream())
                .filter(c -> prioridadMinima == null
                        || c.getPrioridad().ordinal() <= prioridadMinima.ordinal())
                .sorted(Comparator
                        .comparingInt((CandidatoMatchingDto c) -> c.getPrioridad().ordinal())
                        .thenComparing(CandidatoMatchingDto::getFechaRegistroSolicitud,
                                Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }
}
