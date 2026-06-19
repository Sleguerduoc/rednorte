package cl.rednorte.reasignacion.exception;

import org.junit.jupiter.api.Test;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleResponseStatus_devuelveStatusYMensajeDeLaExcepcion() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.NOT_FOUND, "no encontrado");

        ResponseEntity<Map<String, String>> respuesta = handler.handleResponseStatus(ex);

        assertEquals(HttpStatus.NOT_FOUND, respuesta.getStatusCode());
        assertEquals("no encontrado", respuesta.getBody().get("message"));
    }

    @Test
    void handleResponseStatus_sinReason_usaMensajeDeLaExcepcion() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.BAD_REQUEST);

        ResponseEntity<Map<String, String>> respuesta = handler.handleResponseStatus(ex);

        assertEquals(HttpStatus.BAD_REQUEST, respuesta.getStatusCode());
        assertEquals(ex.getMessage(), respuesta.getBody().get("message"));
    }

    @Test
    void handleOptimisticLock_devuelveMensajeFijoEnEspanol() {
        OptimisticLockingFailureException ex = new OptimisticLockingFailureException("conflicto de version");

        Map<String, String> respuesta = handler.handleOptimisticLock(ex);

        assertEquals("La oferta ya fue procesada por otra petición simultánea.", respuesta.get("error"));
    }

    @Test
    void handleGeneric_devuelveNombreDeClaseYDetalle() {
        IllegalStateException ex = new IllegalStateException("boom");

        Map<String, String> respuesta = handler.handleGeneric(ex);

        assertEquals("IllegalStateException", respuesta.get("error"));
        assertEquals("boom", respuesta.get("detalle"));
    }
}
