package cl.rednorte.pacientes.controller;

import cl.rednorte.pacientes.model.Paciente;
import cl.rednorte.pacientes.service.PacienteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PacienteControllerTest {

    @Mock
    private PacienteService service;

    @InjectMocks
    private PacienteController controller;

    @Test
    void crear_delegaEnServicioYDevuelvePaciente() {
        Paciente paciente = Paciente.builder().rut("11111111-1").build();
        Paciente guardado = Paciente.builder().id(1L).rut("11111111-1").estado("ACTIVO").build();
        when(service.crear(paciente)).thenReturn(guardado);

        Paciente resultado = controller.crear(paciente);

        assertEquals(guardado, resultado);
        verify(service).crear(paciente);
    }

    @Test
    void listar_delegaEnServicioYDevuelveLista() {
        Paciente paciente = Paciente.builder().id(1L).build();
        when(service.listar()).thenReturn(List.of(paciente));

        List<Paciente> resultado = controller.listar();

        assertEquals(List.of(paciente), resultado);
        verify(service).listar();
    }

    @Test
    void buscarPorId_delegaEnServicioYDevuelvePaciente() {
        Paciente paciente = Paciente.builder().id(1L).build();
        when(service.buscarPorId(1L)).thenReturn(paciente);

        Paciente resultado = controller.buscarPorId(1L);

        assertEquals(paciente, resultado);
        verify(service).buscarPorId(1L);
    }

    @Test
    void eliminar_delegaEnServicioYDevuelveNoContent() {
        ResponseEntity<Void> respuesta = controller.eliminar(1L);

        assertEquals(HttpStatus.NO_CONTENT, respuesta.getStatusCode());
        verify(service).eliminar(1L);
    }
}
