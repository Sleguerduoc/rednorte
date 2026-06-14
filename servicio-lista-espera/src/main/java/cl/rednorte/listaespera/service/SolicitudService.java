package cl.rednorte.listaespera.service;

import cl.rednorte.listaespera.config.RabbitConfig;
import cl.rednorte.listaespera.event.CitaCanceladaEvent;
import cl.rednorte.listaespera.model.EstadoSolicitud;
import cl.rednorte.listaespera.model.PrioridadSolicitud;
import cl.rednorte.listaespera.model.SolicitudListaEspera;
import cl.rednorte.listaespera.repository.SolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudRepository repository;
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

    public void cancelarCita(Long citaId, Long pacienteId, String especialidad, String fecha) {
        repository.findById(citaId).ifPresent(solicitud -> {
            solicitud.setEstado(EstadoSolicitud.CANCELADA);
            repository.save(solicitud);
        });

        CitaCanceladaEvent evento = CitaCanceladaEvent.builder()
                .citaId(citaId)
                .pacienteId(pacienteId)
                .especialidad(especialidad)
                .fecha(fecha)
                .build();

        rabbitTemplate.convertAndSend(RabbitConfig.COLA_CITA_CANCELADA, evento);
    }
}
