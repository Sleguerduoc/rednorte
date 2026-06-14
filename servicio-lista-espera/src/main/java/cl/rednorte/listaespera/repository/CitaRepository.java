package cl.rednorte.listaespera.repository;

import cl.rednorte.listaespera.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByFechaAndEspecialidadOrderByHoraAsc(LocalDate fecha, String especialidad);
}
