package cl.rednorte.listaespera.repository;

import cl.rednorte.listaespera.model.EstadoSolicitud;
import cl.rednorte.listaespera.model.SolicitudListaEspera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudRepository extends JpaRepository<SolicitudListaEspera, Long> {
    List<SolicitudListaEspera> findByEstadoOrderByIdAsc(EstadoSolicitud estado);
}
