package cl.rednorte.pacientes.service;

import cl.rednorte.pacientes.model.Paciente;
import cl.rednorte.pacientes.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository repository;

    public Paciente crear(Paciente paciente) {
        paciente.setEstado("ACTIVO");
        return repository.save(paciente);
    }

    public List<Paciente> listar() {
        return repository.findAll();
    }

    public Paciente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }
}