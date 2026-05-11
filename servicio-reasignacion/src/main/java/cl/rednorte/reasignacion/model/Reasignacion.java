package cl.rednorte.reasignacion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reasignaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reasignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long citaId;
    private Long pacienteId;
    private String especialidad;
    private String fecha;
    private String estado;
    private LocalDateTime fechaProcesamiento;
}
