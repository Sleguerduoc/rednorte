package cl.rednorte.reasignacion.controller;

import cl.rednorte.reasignacion.model.Reasignacion;
import cl.rednorte.reasignacion.repository.ReasignacionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReasignacionControllerTest {

    @Mock
    private ReasignacionRepository repository;

    @InjectMocks
    private ReasignacionController reasignacionController;

    @Test
    void listar_delegaEnRepositorioYDevuelveLista() {
        Reasignacion reasignacion = Reasignacion.builder().id(1L).citaId(100L).build();
        when(repository.findAll()).thenReturn(List.of(reasignacion));

        List<Reasignacion> resultado = reasignacionController.listar();

        assertEquals(List.of(reasignacion), resultado);
        verify(repository).findAll();
    }
}
