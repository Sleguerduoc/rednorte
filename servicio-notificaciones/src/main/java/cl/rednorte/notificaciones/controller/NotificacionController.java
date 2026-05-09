package cl.rednorte.notificaciones.controller;

import cl.rednorte.notificaciones.model.Notificacion;
import cl.rednorte.notificaciones.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificacionController {

    private final NotificacionRepository repository;

    @GetMapping
    public List<Notificacion> listar() {
        return repository.findAll();
    }
}
