package cl.rednorte.listaespera.repository;

import cl.rednorte.listaespera.model.Cita;
import cl.rednorte.listaespera.model.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByFechaAndEspecialidadOrderByHoraAsc(LocalDate fecha, String especialidad);

    List<Cita> findByEspecialidadAndEstadoAndFechaAfter(String especialidad, EstadoCita estado, LocalDate fecha);

    // Para la cascada: EN_SALA de hoy, misma especialidad, hora > hora del no-show, ordenadas ASC
    List<Cita> findByFechaAndEspecialidadAndEstadoAndHoraAfterOrderByHoraAsc(
            LocalDate fecha, String especialidad, EstadoCita estado, java.time.LocalTime hora);

    // Para el BFF sala-del-día: todas las citas de una fecha, ordenadas por especialidad y hora
    List<Cita> findByFechaOrderByEspecialidadAscHoraAsc(LocalDate fecha);
}
