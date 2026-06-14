package cl.rednorte.listaespera.repository;

import cl.rednorte.listaespera.model.Cita;
import cl.rednorte.listaespera.model.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByFechaAndEspecialidadOrderByHoraAsc(LocalDate fecha, String especialidad);

    List<Cita> findByEspecialidadAndEstadoAndFechaAfter(String especialidad, EstadoCita estado, LocalDate fecha);
}
