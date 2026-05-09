package cl.rednorte.listaespera.controller;

import cl.rednorte.listaespera.model.SolicitudListaEspera;
import cl.rednorte.listaespera.service.SolicitudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/listas-espera")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SolicitudController {

    private final SolicitudService service;

    @PostMapping
    public SolicitudListaEspera crear(@Valid @RequestBody SolicitudListaEspera solicitud) {
        return service.crear(solicitud);
    }

    @GetMapping
    public List<SolicitudListaEspera> listar() {
        return service.listar();
    }

    @PostMapping("/cancelar-cita")
    public String cancelarCita(
        @RequestParam Long citaId,
        @RequestParam String especialidad,
        @RequestParam String fecha) {
        service.cancelarCita(citaId, especialidad, fecha);
        return "Evento CitaCancelada publicado correctamente";
    }
}