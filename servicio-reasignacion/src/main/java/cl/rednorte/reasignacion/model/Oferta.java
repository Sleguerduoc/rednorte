package cl.rednorte.reasignacion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "ofertas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Oferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID token;

    @Column(nullable = false)
    private Long pacienteId;

    private Long solicitudId;  // no nulo cuando el candidato viene de LISTA_ESPERA
    private Long citaId;       // no nulo cuando el candidato viene de CITA_FUTURA

    @Column(nullable = false)
    private String especialidad;

    @Column(nullable = false)
    private LocalDate fechaCupo;

    @Column(nullable = false)
    private LocalTime horaCupo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOferta estado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrigenCupo origen;

    @Column(nullable = false)
    private LocalDateTime creadaEn;

    @Column(nullable = false)
    private LocalDateTime expiraEn;

    private String prioridadMinima;  // null = sin filtro; se republica al rechazar/expirar

    @Version
    private Long version;
}
