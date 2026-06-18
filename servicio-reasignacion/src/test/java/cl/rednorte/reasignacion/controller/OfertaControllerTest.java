package cl.rednorte.reasignacion.controller;

import cl.rednorte.reasignacion.model.Oferta;
import cl.rednorte.reasignacion.service.OfertaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfertaControllerTest {

    @Mock
    private OfertaService ofertaService;

    @InjectMocks
    private OfertaController ofertaController;

    @Test
    void confirmar_delegaEnServicioYDevuelveOk() {
        UUID token = UUID.randomUUID();

        ResponseEntity<Map<String, String>> respuesta = ofertaController.confirmar(token);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals("Cita confirmada correctamente.", respuesta.getBody().get("mensaje"));
        verify(ofertaService).confirmar(token);
    }

    @Test
    void confirmar_tokenInvalido_propagaNotFoundYNoDevuelveOk() {
        UUID token = UUID.randomUUID();
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Token inválido"))
                .when(ofertaService).confirmar(token);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> ofertaController.confirmar(token));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void rechazar_delegaEnServicioYDevuelveOk() {
        UUID token = UUID.randomUUID();

        ResponseEntity<Map<String, String>> respuesta = ofertaController.rechazar(token);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals("Oferta rechazada. Se buscará el siguiente candidato.", respuesta.getBody().get("mensaje"));
        verify(ofertaService).rechazar(token);
    }

    @Test
    void rechazar_ofertaYaNoOfrecida_propagaConflicto() {
        UUID token = UUID.randomUUID();
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Esta oferta ya fue RECHAZADA"))
                .when(ofertaService).rechazar(token);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> ofertaController.rechazar(token));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void revisarVencidas_delegaEnServicioYDevuelveConteo() {
        when(ofertaService.revisarVencidas()).thenReturn(3);

        ResponseEntity<Map<String, Integer>> respuesta = ofertaController.revisarVencidas();

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(3, respuesta.getBody().get("procesadas"));
        verify(ofertaService).revisarVencidas();
    }

    @Test
    void listar_delegaEnServicioYDevuelveLista() {
        Oferta oferta = Oferta.builder().id(1L).build();
        when(ofertaService.listarTodas()).thenReturn(List.of(oferta));

        List<Oferta> resultado = ofertaController.listar();

        assertEquals(List.of(oferta), resultado);
        verify(ofertaService).listarTodas();
    }
}
