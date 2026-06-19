package cl.rednorte.listaespera.exception;

import cl.rednorte.listaespera.model.PrioridadSolicitud;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SuppressWarnings("unchecked")
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
    void handleInvalidEnum_conInvalidFormatExceptionParaEnum_devuelveDetalleDelCampo() {
        InvalidFormatException ife = mock(InvalidFormatException.class);
        when(ife.getTargetType()).thenReturn((Class) PrioridadSolicitud.class);
        when(ife.getValue()).thenReturn("INVALIDA");
        when(ife.getPath()).thenReturn(List.of(new JsonMappingException.Reference(null, "prioridad")));

        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
                "msg", ife, mock(HttpInputMessage.class));

        Map<String, String> respuesta = handler.handleInvalidEnum(ex);

        assertEquals("Valor inválido para el campo 'prioridad'", respuesta.get("error"));
        assertEquals("INVALIDA", respuesta.get("valorRecibido"));
        assertEquals("CRITICA, ALTA, NORMAL", respuesta.get("valoresPermitidos"));
    }

    @Test
    void handleInvalidEnum_conCausaQueNoEsInvalidFormatException_devuelveMensajeGenerico() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
                "msg", new RuntimeException("not an invalid format"), mock(HttpInputMessage.class));

        Map<String, String> respuesta = handler.handleInvalidEnum(ex);

        assertEquals("Cuerpo de la petición inválido o malformado", respuesta.get("error"));
    }
}
