package cl.rednorte.notificaciones.service;

import cl.rednorte.notificaciones.event.NotificacionSolicitadaEvent;
import cl.rednorte.notificaciones.factory.CanalNotificacion;
import cl.rednorte.notificaciones.factory.NotificacionFactory;
import cl.rednorte.notificaciones.model.Notificacion;
import cl.rednorte.notificaciones.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository repository;

    public void procesar(NotificacionSolicitadaEvent evento) {
        CanalNotificacion canal = NotificacionFactory.crearCanal(evento.getCanal());
        canal.enviar(evento.getMensaje());

        Notificacion notificacion = Notificacion.builder()
                .pacienteId(evento.getPacienteId())
                .canal(evento.getCanal())
                .mensaje(evento.getMensaje())
                .estado("ENVIADA")
                .fechaEnvio(LocalDateTime.now())
                .build();

        repository.save(notificacion);
    }
}