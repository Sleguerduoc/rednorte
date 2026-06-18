package cl.rednorte.listaespera.controller;

import cl.rednorte.listaespera.dto.AgendarCitaRequest;
import cl.rednorte.listaespera.dto.AsignarCitaRequest;
import cl.rednorte.listaespera.model.Cita;
import cl.rednorte.listaespera.model.EstadoCita;
import cl.rednorte.listaespera.service.CitaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * El controller no envuelve sus respuestas en ResponseEntity (devuelve el
 * recurso directamente, con @ResponseStatus para el código por defecto), así
 * que estos tests verifican delegación + valor devuelto, y para los casos de
 * error verifican que la ResponseStatusException lanzada por el servicio
 * propaga con el status code correcto.
 */
@ExtendWith(MockitoExtension.class)
class CitaControllerTest {

    @Mock
    private CitaService citaService;

    @InjectMocks
    private CitaController citaController;

    @Test
    void agendar_delegaEnServicioYDevuelveCita() {
        AgendarCitaRequest request = new AgendarCitaRequest();
        Cita citaEsperada = Cita.builder().id(1L).estado(EstadoCita.PROGRAMADA).build();
        when(citaService.agendar(request)).thenReturn(citaEsperada);

        Cita resultado = citaController.agendar(request);

        assertEquals(citaEsperada, resultado);
        verify(citaService).agendar(request);
    }

    @Test
    void agendar_cupoDuplicado_propagaConflicto409() {
        AgendarCitaRequest request = new AgendarCitaRequest();
        when(citaService.agendar(request)).thenThrow(
                new ResponseStatusException(HttpStatus.CONFLICT, "Cupo ocupado"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> citaController.agendar(request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void listar_delegaEnServicioYDevuelveLista() {
        LocalDate fecha = LocalDate.now();
        Cita cita = Cita.builder().id(1L).build();
        when(citaService.listarPorFechaYEspecialidad(fecha, "Cardiologia")).thenReturn(List.of(cita));

        List<Cita> resultado = citaController.listar(fecha, "Cardiologia");

        assertEquals(List.of(cita), resultado);
        verify(citaService).listarPorFechaYEspecialidad(fecha, "Cardiologia");
    }

    @Test
    void asignar_delegaEnServicioYDevuelveCita() {
        AsignarCitaRequest request = new AsignarCitaRequest();
        Cita citaEsperada = Cita.builder().id(2L).estado(EstadoCita.PROGRAMADA).build();
        when(citaService.asignar(request)).thenReturn(citaEsperada);

        Cita resultado = citaController.asignar(request);

        assertEquals(citaEsperada, resultado);
        verify(citaService).asignar(request);
    }

    @Test
    void checkIn_delegaEnServicioYDevuelveCita() {
        Cita citaEsperada = Cita.builder().id(1L).estado(EstadoCita.EN_SALA).build();
        when(citaService.checkIn(1L)).thenReturn(citaEsperada);

        Cita resultado = citaController.checkIn(1L);

        assertEquals(citaEsperada, resultado);
        verify(citaService).checkIn(1L);
    }

    @Test
    void deshacerCheckIn_delegaEnServicioYDevuelveCita() {
        Cita citaEsperada = Cita.builder().id(1L).estado(EstadoCita.PROGRAMADA).build();
        when(citaService.deshacerCheckIn(1L)).thenReturn(citaEsperada);

        Cita resultado = citaController.deshacerCheckIn(1L);

        assertEquals(citaEsperada, resultado);
        verify(citaService).deshacerCheckIn(1L);
    }

    @Test
    void noShow_delegaEnServicioYDevuelveCita() {
        Cita citaEsperada = Cita.builder().id(1L).estado(EstadoCita.NO_SHOW).build();
        when(citaService.marcarNoShow(1L)).thenReturn(citaEsperada);

        Cita resultado = citaController.noShow(1L);

        assertEquals(citaEsperada, resultado);
        verify(citaService).marcarNoShow(1L);
    }

    @Test
    void listarDelDia_delegaEnServicioYDevuelveLista() {
        LocalDate fecha = LocalDate.now();
        Cita cita = Cita.builder().id(1L).build();
        when(citaService.listarPorFecha(fecha)).thenReturn(List.of(cita));

        List<Cita> resultado = citaController.listarDelDia(fecha);

        assertEquals(List.of(cita), resultado);
        verify(citaService).listarPorFecha(fecha);
    }
}
