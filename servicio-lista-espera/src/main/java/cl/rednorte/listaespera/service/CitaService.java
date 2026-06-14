package cl.rednorte.listaespera.service;

import cl.rednorte.listaespera.dto.AgendarCitaRequest;
import cl.rednorte.listaespera.dto.AsignarCitaRequest;
import cl.rednorte.listaespera.model.Cita;
import cl.rednorte.listaespera.model.EstadoCita;
import cl.rednorte.listaespera.model.EstadoSolicitud;
import cl.rednorte.listaespera.model.SolicitudListaEspera;
import cl.rednorte.listaespera.repository.CitaRepository;
import cl.rednorte.listaespera.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final SolicitudRepository solicitudRepository;

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

    @Transactional
    public Cita checkIn(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cita no encontrada: " + id));

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
                .fecha(java.time.LocalDate.parse(request.getFecha()))
                .hora(java.time.LocalTime.parse(request.getHora()))
                .estado(EstadoCita.PROGRAMADA)
                .build();

        return citaRepository.save(nuevaCita);
    }

    @Transactional
    public Cita deshacerCheckIn(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cita no encontrada: " + id));

        if (cita.getEstado() != EstadoCita.EN_SALA) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Deshacer check-in solo permitido en estado EN_SALA. Estado actual: " + cita.getEstado());
        }

        cita.setEstado(EstadoCita.PROGRAMADA);
        cita.setHoraCheckIn(null);
        return citaRepository.save(cita);
    }
}
