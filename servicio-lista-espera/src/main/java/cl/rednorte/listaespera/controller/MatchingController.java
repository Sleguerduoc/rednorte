package cl.rednorte.listaespera.controller;

import cl.rednorte.listaespera.dto.CandidatoMatchingDto;
import cl.rednorte.listaespera.model.PrioridadSolicitud;
import cl.rednorte.listaespera.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    @GetMapping("/candidatos")
    public List<CandidatoMatchingDto> obtenerCandidatos(
            @RequestParam String especialidad,
            @RequestParam(required = false) PrioridadSolicitud prioridadMinima,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaCupo,
            @RequestParam(required = false) List<Long> excluir) {
        return matchingService.obtenerCandidatos(especialidad, prioridadMinima, fechaCupo, excluir);
    }
}
