package cl.rednorte.listaespera.service;

import cl.rednorte.listaespera.config.RabbitConfig;
import cl.rednorte.listaespera.dto.AgendarCitaRequest;
import cl.rednorte.listaespera.dto.AsignarCitaRequest;
import cl.rednorte.listaespera.event.CupoLiberadoEvent;
import cl.rednorte.listaespera.model.Cita;
import cl.rednorte.listaespera.model.EstadoCita;
import cl.rednorte.listaespera.model.EstadoSolicitud;
import cl.rednorte.listaespera.model.SolicitudListaEspera;
import cl.rednorte.listaespera.repository.CitaRepository;
import cl.rednorte.listaespera.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CitaService {

    private static final String CITA_NO_ENCONTRADA = "Cita no encontrada: ";

    private final CitaRepository citaRepository;
    private final SolicitudRepository solicitudRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public Cita agendar(AgendarCitaRequest request) {
        SolicitudListaEspera solicitud = solicitudRepository.findById(request.getSolicitudId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Solicitud no encontrada: " + request.getSolicitudId()));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden agendar solicitudes en estado PENDIENTE. Estado actual: " + solicitud.getEstado());
        }

        Cita cita = Cita.builder()
                .solicitudId(solicitud.getId())
                .pacienteId(solicitud.getPacienteId())
                .especialidad(solicitud.getEspecialidad())
                .fecha(request.getFecha())
                .hora(request.getHora())
                .estado(EstadoCita.PROGRAMADA)
                .build();

        solicitud.setEstado(EstadoSolicitud.AGENDADA);
        solicitudRepository.save(solicitud);

        return citaRepository.save(cita);
    }

    public List<Cita> listarPorFechaYEspecialidad(LocalDate fecha, String especialidad) {
        return citaRepository.findByFechaAndEspecialidadOrderByHoraAsc(fecha, especialidad);
    }

    public List<Cita> listarPorFecha(LocalDate fecha) {
        return citaRepository.findByFechaOrderByEspecialidadAscHoraAsc(fecha);
    }

    @Transactional
    public Cita checkIn(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, CITA_NO_ENCONTRADA + id));

        if (cita.getEstado() != EstadoCita.PROGRAMADA) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Check-in solo permitido en estado PROGRAMADA. Estado actual: " + cita.getEstado());
        }

        cita.setEstado(EstadoCita.EN_SALA);
        cita.setHoraCheckIn(LocalDateTime.now());
        return citaRepository.save(cita);
    }

    @Transactional
    public Cita deshacerCheckIn(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, CITA_NO_ENCONTRADA + id));

        if (cita.getEstado() != EstadoCita.EN_SALA) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Deshacer check-in solo permitido en estado EN_SALA. Estado actual: " + cita.getEstado());
        }

        cita.setEstado(EstadoCita.PROGRAMADA);
        cita.setHoraCheckIn(null);
        return citaRepository.save(cita);
    }

    @Transactional
    public Cita asignar(AsignarCitaRequest request) {
        Long solicitudIdFinal = request.getSolicitudId();

        if (request.getCitaIdAReasignar() != null) {
            Cita citaVieja = citaRepository.findById(request.getCitaIdAReasignar())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Cita a reasignar no encontrada: " + request.getCitaIdAReasignar()));

            if (citaVieja.getEstado() != EstadoCita.PROGRAMADA) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Solo se puede reasignar una cita PROGRAMADA. Estado actual: " + citaVieja.getEstado());
            }

            solicitudIdFinal = citaVieja.getSolicitudId();
            citaVieja.setEstado(EstadoCita.REASIGNADA);
            citaRepository.save(citaVieja);
        }

        Cita nuevaCita = Cita.builder()
                .solicitudId(solicitudIdFinal)
                .pacienteId(request.getPacienteId())
                .especialidad(request.getEspecialidad())
                .fecha(LocalDate.parse(request.getFecha()))
                .hora(LocalTime.parse(request.getHora()))
                .estado(EstadoCita.PROGRAMADA)
                .build();

        return citaRepository.save(nuevaCita);
    }

    /**
     * Marca la cita como NO_SHOW y ejecuta el algoritmo de adelanto en cascada.
     * Solo válido para citas de HOY en estado PROGRAMADA o EN_SALA.
     * Tras la cascada, publica CupoLiberadoEvent con la última hora liberada.
     */
    @Transactional
    public Cita marcarNoShow(Long citaId) {
        LocalDate hoy = LocalDate.now();

        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, CITA_NO_ENCONTRADA + citaId));

        if (!cita.getFecha().equals(hoy)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No-show solo válido para citas de hoy. Fecha de la cita: " + cita.getFecha());
        }

        if (cita.getEstado() != EstadoCita.PROGRAMADA && cita.getEstado() != EstadoCita.EN_SALA) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No-show solo válido en estado PROGRAMADA o EN_SALA. Estado actual: " + cita.getEstado());
        }

        cita.setEstado(EstadoCita.NO_SHOW);
        citaRepository.save(cita);

        // --- Algoritmo de adelanto en cascada ---
        // Solo los EN_SALA (presentes con check-in) posteriores al no-show se mueven.
        // Los PROGRAMADA sin check-in conservan su hora.
        List<Cita> presentes = citaRepository
                .findByFechaAndEspecialidadAndEstadoAndHoraAfterOrderByHoraAsc(
                        hoy, cita.getEspecialidad(), EstadoCita.EN_SALA, cita.getHora());

        if (presentes.isEmpty()) {
            log.warn("No-show en cita {} ({} {} {}): sin presentes EN_SALA para adelantar. No se publica evento.",
                    citaId, cita.getEspecialidad(), hoy, cita.getHora());
            return cita;
        }

        // El hueco empieza en la hora del no-show.
        // Cada presente toma el hueco y deja su hora como nuevo hueco.
        LocalTime horaLibre = cita.getHora();
        for (Cita presente : presentes) {
            LocalTime horaOriginal = presente.getHora();
            presente.setHora(horaLibre);
            citaRepository.save(presente);
            log.info("Cascada: cita {} adelantada de {} a {}", presente.getId(), horaOriginal, horaLibre);
            horaLibre = horaOriginal;
        }
        // horaLibre es ahora la hora del último presente, que quedó sin dueño.

        log.info("Cascada completada. Última hora liberada: {} {} {}",
                cita.getEspecialidad(), hoy, horaLibre);

        rabbitTemplate.convertAndSend(RabbitConfig.COLA_CUPO_LIBERADO,
                CupoLiberadoEvent.builder()
                        .especialidad(cita.getEspecialidad())
                        .fechaCupo(hoy.toString())
                        .horaCupo(horaLibre.toString())
                        .origen("NO_SHOW_ADELANTO")
                        .prioridadMinima("CRITICA")
                        .pacientesExcluidos(List.of())
                        .build());

        return cita;
    }
}
