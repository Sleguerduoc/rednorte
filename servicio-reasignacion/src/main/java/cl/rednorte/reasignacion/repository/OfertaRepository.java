package cl.rednorte.reasignacion.repository;

import cl.rednorte.reasignacion.model.Oferta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OfertaRepository extends JpaRepository<Oferta, Long> {
    Optional<Oferta> findByToken(UUID token);
}
