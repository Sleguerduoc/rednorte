package cl.rednorte.listaespera.controller;

import cl.rednorte.listaespera.dto.AgendarCitaRequest;
import cl.rednorte.listaespera.dto.AsignarCitaRequest;
import cl.rednorte.listaespera.model.Cita;
import cl.rednorte.listaespera.service.CitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/citas")
@RequiredArgsConstructor
public class CitaController {

    private final CitaService citaService;

    @PostMapping("/agendar")
    @ResponseStatus(HttpStatus.CREATED)
    public Cita agendar(@Valid @RequestBody AgendarCitaRequest request) {
        return citaService.agendar(request);
    }

    @GetMapping
    public List<Cita> listar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam String especialidad) {
        return citaService.listarPorFechaYEspecialidad(fecha, especialidad);
    }

    @PostMapping("/asignar")
    @ResponseStatus(HttpStatus.CREATED)
    public Cita asignar(@Valid @RequestBody AsignarCitaRequest request) {
        return citaService.asignar(request);
    }

    @PostMapping("/{id}/check-in")
    public Cita checkIn(@PathVariable Long id) {
        return citaService.checkIn(id);
    }

    @PostMapping("/{id}/deshacer-check-in")
    public Cita deshacerCheckIn(@PathVariable Long id) {
        return citaService.deshacerCheckIn(id);
    }

    @PostMapping("/{id}/no-show")
    public Cita noShow(@PathVariable Long id) {
        return citaService.marcarNoShow(id);
    }

    @GetMapping("/del-dia")
    public List<Cita> listarDelDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return citaService.listarPorFecha(fecha);
    }
}
