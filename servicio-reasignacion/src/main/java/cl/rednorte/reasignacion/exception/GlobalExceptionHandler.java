package cl.rednorte.reasignacion.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Dos peticiones simultáneas al mismo token: la segunda recibe 409. */
    @ExceptionHandler(OptimisticLockingFailureException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> handleOptimisticLock(OptimisticLockingFailureException ex) {
        log.warn("Conflicto de concurrencia al procesar oferta: {}", ex.getMessage());
        return Map.of("error", "La oferta ya fue procesada por otra petición simultánea.");
    }
}
