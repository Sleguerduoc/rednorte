package cl.rednorte.pacientes.service;

import cl.rednorte.pacientes.model.Paciente;
import cl.rednorte.pacientes.repository.PacienteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {

    @Mock
    private PacienteRepository repository;

    @InjectMocks
    private PacienteService service;

    @Test
    void crear_asignaEstadoActivoYGuarda() {
        Paciente paciente = Paciente.builder().rut("11111111-1").nombres("Juan").build();
        Paciente guardado = Paciente.builder().id(1L).rut("11111111-1").nombres("Juan").estado("ACTIVO").build();
        when(repository.save(any(Paciente.class))).thenReturn(guardado);

        Paciente resultado = service.crear(paciente);

        assertEquals("ACTIVO", paciente.getEstado());
        assertEquals(guardado, resultado);
        verify(repository).save(paciente);
    }

    @Test
    void listar_devuelveTodosLosPacientes() {
        Paciente paciente = Paciente.builder().id(1L).build();
        when(repository.findAll()).thenReturn(List.of(paciente));

        List<Paciente> resultado = service.listar();

        assertEquals(List.of(paciente), resultado);
        verify(repository).findAll();
    }

    @Test
    void buscarPorId_existente_devuelvePaciente() {
        Paciente paciente = Paciente.builder().id(1L).build();
        when(repository.findById(1L)).thenReturn(Optional.of(paciente));

        Paciente resultado = service.buscarPorId(1L);

        assertEquals(paciente, resultado);
    }

    @Test
    void buscarPorId_inexistente_lanza404() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.buscarPorId(99L));

        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void eliminar_existente_borraDelRepositorio() {
        when(repository.existsById(1L)).thenReturn(true);

        service.eliminar(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    void eliminar_inexistente_lanza404YNoBorra() {
        when(repository.existsById(99L)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.eliminar(99L));

        assertEquals(404, ex.getStatusCode().value());
        verify(repository, never()).deleteById(any());
    }
}
