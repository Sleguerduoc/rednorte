package cl.rednorte.listaespera.event;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CupoLiberadoEvent {

    private String especialidad;
    private String fechaCupo;        // ISO: "2026-06-20"
    private String horaCupo;         // ISO: "09:30"
    private String prioridadMinima;  // null = sin filtro; "CRITICA" / "ALTA" / "NORMAL"
    private String origen;           // "NO_SHOW_ADELANTO" | "CANCELACION_FUTURA"
    private List<Long> pacientesExcluidos;
}
