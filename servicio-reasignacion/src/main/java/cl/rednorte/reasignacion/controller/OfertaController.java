package cl.rednorte.reasignacion.controller;

import cl.rednorte.reasignacion.service.OfertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/ofertas")
@RequiredArgsConstructor
public class OfertaController {

    private final OfertaService ofertaService;

    /** Público — sin JWT. El token garantiza la identidad del receptor. */
    @PostMapping("/confirmar")
    public ResponseEntity<Map<String, String>> confirmar(@RequestParam UUID token) {
        ofertaService.confirmar(token);
        return ResponseEntity.ok(Map.of("mensaje", "Cita confirmada correctamente."));
    }

    /** Público — sin JWT. */
    @PostMapping("/rechazar")
    public ResponseEntity<Map<String, String>> rechazar(@RequestParam UUID token) {
        ofertaService.rechazar(token);
        return ResponseEntity.ok(Map.of("mensaje", "Oferta rechazada. Se buscará el siguiente candidato."));
    }

    /** Admin — requiere JWT. */
    @PostMapping("/revisar-vencidas")
    public ResponseEntity<Map<String, Integer>> revisarVencidas() {
        int procesadas = ofertaService.revisarVencidas();
        return ResponseEntity.ok(Map.of("procesadas", procesadas));
    }
}
