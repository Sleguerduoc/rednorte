package cl.rednorte.listaespera.service;

import cl.rednorte.listaespera.config.RabbitConfig;
import cl.rednorte.listaespera.event.CitaCanceladaEvent;
import cl.rednorte.listaespera.event.CupoLiberadoEvent;
import cl.rednorte.listaespera.model.Cita;
import cl.rednorte.listaespera.model.EstadoCita;
import cl.rednorte.listaespera.model.EstadoSolicitud;
import cl.rednorte.listaespera.model.PrioridadSolicitud;
import cl.rednorte.listaespera.model.SolicitudListaEspera;
import cl.rednorte.listaespera.repository.CitaRepository;
import cl.rednorte.listaespera.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudRepository repository;
    private final CitaRepository citaRepository;
    private final RabbitTemplate rabbitTemplate;

    public SolicitudListaEspera crear(SolicitudListaEspera solicitud) {
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        solicitud.setFechaRegistro(LocalDateTime.now());

        if (solicitud.getPrioridad() == null) {
            solicitud.setPrioridad(PrioridadSolicitud.NORMAL);
        }

        return repository.save(solicitud);
    }

    public List<SolicitudListaEspera> listar() {
        return repository.findAll();
    }

    /**
     * Cancela la cita identificada por citaId.
     * Firma pública sin cambios para no romper al frontend.
     * Los parámetros pacienteId, especialidad y fecha del caller son ignorados:
     * los datos reales se toman de la entidad Cita persistida.
     */
    @Transactional
    public void cancelarCita(Long citaId, Long pacienteId, String especialidad, String fecha) {
        // Bug 1 fix: buscar primero; si no existe, lanzar 404 y no publicar nada
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cita no encontrada: " + citaId));

        // Marcar la cita como CANCELADA
        cita.setEstado(EstadoCita.CANCELADA);
        citaRepository.save(cita);

        // Volver la solicitud a PENDIENTE para que el paciente vuelva a la cola
        repository.findById(cita.getSolicitudId()).ifPresent(solicitud -> {
            solicitud.setEstado(EstadoSolicitud.PENDIENTE);
            repository.save(solicitud);
        });

        // Bug 2 fix: fecha y especialidad salen de la entidad, no del caller
        // Evento legado — mantiene compatibilidad con CitaCanceladaListener existente
        rabbitTemplate.convertAndSend(RabbitConfig.COLA_CITA_CANCELADA,
                CitaCanceladaEvent.builder()
                        .citaId(cita.getId())
                        .pacienteId(cita.getPacienteId())
                        .especialidad(cita.getEspecialidad())
                        .fecha(cita.getFecha().toString())
                        .build());

        // Flujo 2: liberar cupo solo si la cita era a futuro
        if (cita.getFecha().isAfter(LocalDate.now())) {
            rabbitTemplate.convertAndSend(RabbitConfig.COLA_CUPO_LIBERADO,
                    CupoLiberadoEvent.builder()
                            .especialidad(cita.getEspecialidad())
                            .fechaCupo(cita.getFecha().toString())
                            .horaCupo(cita.getHora().toString())
                            .origen("CANCELACION_FUTURA")
                            .pacientesExcluidos(List.of())
                            .build());
        }
    }
}
