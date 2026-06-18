package cl.rednorte.gateway.auth;

import cl.rednorte.gateway.auth.model.LoginRequest;
import cl.rednorte.gateway.auth.model.LoginResponse;
import cl.rednorte.gateway.auth.model.Usuario;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController controller;

    @Test
    void login_credencialesValidas_devuelveTokenYDatosDeUsuario() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("admin123");
        Usuario usuario = Usuario.builder()
                .username("admin").rol("ADMIN").nombre("Administrador RedNorte").build();
        when(userService.autenticar("admin", "admin123")).thenReturn(Mono.just(usuario));
        when(jwtUtil.generarToken(usuario)).thenReturn("jwt-token");

        ResponseEntity<LoginResponse> respuesta = controller.login(request).block();

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals("jwt-token", respuesta.getBody().getToken());
        assertEquals("ADMIN", respuesta.getBody().getRol());
        assertEquals("admin", respuesta.getBody().getUsername());
    }

    @Test
    void login_credencialesInvalidas_devuelve401SinCuerpo() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("incorrecta");
        when(userService.autenticar("admin", "incorrecta")).thenReturn(Mono.empty());

        ResponseEntity<LoginResponse> respuesta = controller.login(request).block();

        assertEquals(HttpStatus.UNAUTHORIZED, respuesta.getStatusCode());
        assertNull(respuesta.getBody());
    }
}
