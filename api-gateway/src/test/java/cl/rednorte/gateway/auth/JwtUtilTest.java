package cl.rednorte.gateway.auth;

import cl.rednorte.gateway.auth.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil();

    @BeforeEach
    void setUp() {
        String secret = Base64.getEncoder().encodeToString(Keys.hmacShaKeyFor(
                "0123456789abcdef0123456789abcdef".getBytes()).getEncoded());
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
        ReflectionTestUtils.setField(jwtUtil, "expiration", 3600000L);
    }

    @Test
    void generarToken_yValidarToken_recuperaClaimsOriginales() {
        Usuario usuario = Usuario.builder()
                .username("doctor1").rol("DOCTOR").nombre("Dr. Carlos Mendoza").build();

        String token = jwtUtil.generarToken(usuario);
        Claims claims = jwtUtil.validarToken(token);

        assertEquals("doctor1", claims.getSubject());
        assertEquals("DOCTOR", claims.get("rol", String.class));
        assertEquals("Dr. Carlos Mendoza", claims.get("nombre", String.class));
    }

    @Test
    void validarToken_tokenInvalido_lanzaExcepcion() {
        assertThrows(Exception.class, () -> jwtUtil.validarToken("token.invalido.basura"));
    }

    @Test
    void generarToken_incluyePacienteRutCuandoExiste() {
        Usuario usuario = Usuario.builder()
                .username("11111111-1").rol("CLIENTE").pacienteRut("11111111-1").nombre("Juan Perez").build();

        String token = jwtUtil.generarToken(usuario);
        Claims claims = jwtUtil.validarToken(token);

        assertEquals("11111111-1", claims.get("pacienteRut", String.class));
        assertTrue(claims.getExpiration().after(claims.getIssuedAt()));
    }
}
