package cl.rednorte.pacientes.controller;

import cl.rednorte.pacientes.model.Paciente;
import cl.rednorte.pacientes.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pacientes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PacienteController {

    private final PacienteService service;

    @PostMapping
    public Paciente crear(@Valid @RequestBody Paciente paciente) {
        return service.crear(paciente);
    }

    @GetMapping
    public List<Paciente> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Paciente buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }
}