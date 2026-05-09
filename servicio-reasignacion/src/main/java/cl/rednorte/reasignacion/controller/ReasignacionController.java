package cl.rednorte.reasignacion.controller;

import cl.rednorte.reasignacion.model.Reasignacion;
import cl.rednorte.reasignacion.repository.ReasignacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reasignaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReasignacionController {

    private final ReasignacionRepository repository;

    @GetMapping
    public List<Reasignacion> listar() {
        return repository.findAll();
    }
}