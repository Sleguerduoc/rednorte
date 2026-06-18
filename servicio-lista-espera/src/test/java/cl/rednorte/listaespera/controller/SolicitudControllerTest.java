package cl.rednorte.listaespera.controller;

import cl.rednorte.listaespera.model.EstadoSolicitud;
import cl.rednorte.listaespera.model.SolicitudListaEspera;
import cl.rednorte.listaespera.service.SolicitudService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SolicitudControllerTest {

    @Mock
    private SolicitudService service;

    @InjectMocks
    private SolicitudController solicitudController;

    @Test
    void crear_delegaEnServicioYDevuelveSolicitud() {
        SolicitudListaEspera solicitud = SolicitudListaEspera.builder().pacienteId(1L).build();
        SolicitudListaEspera guardada = SolicitudListaEspera.builder()
                .id(1L).pacienteId(1L).estado(EstadoSolicitud.PENDIENTE).build();
        when(service.crear(solicitud)).thenReturn(guardada);

        SolicitudListaEspera resultado = solicitudController.crear(solicitud);

        assertEquals(guardada, resultado);
        verify(service).crear(solicitud);
    }

    @Test
    void listar_delegaEnServicioYDevuelveLista() {
        SolicitudListaEspera solicitud = SolicitudListaEspera.builder().id(1L).build();
        when(service.listar()).thenReturn(List.of(solicitud));

        List<SolicitudListaEspera> resultado = solicitudController.listar();

        assertEquals(List.of(solicitud), resultado);
        verify(service).listar();
    }

    @Test
    void cancelarCita_delegaEnServicioYDevuelveMensaje() {
        String resultado = solicitudController.cancelarCita(100L, 1L, "Cardiologia", "2026-06-20");

        assertEquals("Cita cancelada correctamente", resultado);
        verify(service).cancelarCita(100L, 1L, "Cardiologia", "2026-06-20");
    }

    @Test
    void cancelarCita_citaInexistente_propagaNotFound() {
        org.mockito.Mockito.doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Cita no encontrada"))
                .when(service).cancelarCita(999L, 1L, "Cardiologia", "2026-06-20");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> solicitudController.cancelarCita(999L, 1L, "Cardiologia", "2026-06-20"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}
