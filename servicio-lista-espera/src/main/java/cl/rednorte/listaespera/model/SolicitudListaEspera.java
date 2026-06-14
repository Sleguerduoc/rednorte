package cl.rednorte.listaespera.model; 

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_lista_espera")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudListaEspera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Long pacienteId;

    @NotBlank
    private String especialidad;

    @Enumerated(EnumType.STRING)
    private PrioridadSolicitud prioridad;

    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado;

    private LocalDateTime fechaRegistro;
}