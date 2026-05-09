package cl.rednorte.pacientes.repository;

import cl.rednorte.pacientes.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
}