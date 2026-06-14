package cl.rednorte.notificaciones.service;

import cl.rednorte.notificaciones.event.NotificacionSolicitadaEvent;
import cl.rednorte.notificaciones.factory.CanalNotificacion;
import cl.rednorte.notificaciones.factory.NotificacionFactory;
import cl.rednorte.notificaciones.model.Notificacion;
import cl.rednorte.notificaciones.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository repository;

    @Value("${app.confirmar.url.base}")
    private String urlBase;

    public void procesar(NotificacionSolicitadaEvent evento) {
        String mensajeFinal = evento.getMensaje();
        if (evento.getToken() != null && !evento.getToken().isBlank()) {
            mensajeFinal += " Confirme aquí: " + urlBase + "/confirmar?token=" + evento.getToken();
        }

        CanalNotificacion canal = NotificacionFactory.crearCanal(evento.getCanal());
        canal.enviar(mensajeFinal);

        Notificacion notificacion = Notificacion.builder()
                .pacienteId(evento.getPacienteId())
                .canal(evento.getCanal())
                .mensaje(mensajeFinal)
                .estado("ENVIADA")
                .fechaEnvio(LocalDateTime.now())
                .build();

        repository.save(notificacion);
    }
}
