package cl.rednorte.notificaciones.controller;

import cl.rednorte.notificaciones.model.Notificacion;
import cl.rednorte.notificaciones.repository.NotificacionRepository;
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
class NotificacionControllerTest {

    @Mock
    private NotificacionRepository repository;

    @InjectMocks
    private NotificacionController controller;

    @Test
    void listar_delegaEnRepositorioYDevuelveLista() {
        Notificacion notificacion = Notificacion.builder().id(1L).canal("EMAIL").build();
        when(repository.findAll()).thenReturn(List.of(notificacion));

        List<Notificacion> resultado = controller.listar();

        assertEquals(List.of(notificacion), resultado);
        verify(repository).findAll();
    }
}
