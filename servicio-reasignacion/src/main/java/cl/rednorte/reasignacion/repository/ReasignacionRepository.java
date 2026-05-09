package cl.rednorte.reasignacion.repository;

import cl.rednorte.reasignacion.model.Reasignacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReasignacionRepository extends JpaRepository<Reasignacion, Long> {
}