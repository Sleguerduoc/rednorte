package cl.rednorte.gateway.auth;

import cl.rednorte.gateway.auth.model.PacienteResponseDto;
import cl.rednorte.gateway.auth.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final PasswordEncoder encoder;
    private final WebClient webClient;

    @Value("${app.cliente.password:rednorte2026}")
    private String clientePassword;

    /** Usuarios fijos (ADMIN y DOCTOR) con password hasheado. */
    private Map<String, Usuario> usuariosEspeciales() {
        return Map.of(
            "admin", Usuario.builder()
                .username("admin")
                .password(encoder.encode("admin123"))
                .rol("ADMIN")
                .nombre("Administrador RedNorte")
                .build(),

            "doctor1", Usuario.builder()
                .username("doctor1")
                .password(encoder.encode("doc123"))
                .rol("DOCTOR")
                .nombre("Dr. Carlos Mendoza")
                .build()
        );
    }

    /**
     * Autentica un usuario.
     * - Si el username es "admin" o "doctor1", valida contra usuarios fijos.
     * - Cualquier otro username se trata como RUT de paciente: valida la
     *   contraseña por defecto y busca el paciente en servicio-pacientes.
     */
    public Mono<Usuario> autenticar(String username, String password) {

        // ── Usuarios especiales (ADMIN / DOCTOR) ──────────────────────
        Usuario especial = usuariosEspeciales().get(username);
        if (especial != null) {
            if (encoder.matches(password, especial.getPassword())) {
                return Mono.just(especial);
            }
            return Mono.empty();
        }

        // ── CLIENTE: username = RUT del paciente ───────────────────────
        if (!password.equals(clientePassword)) {
            return Mono.empty();
        }

        return webClient.get()
                .uri("/pacientes")
                .retrieve()
                .bodyToFlux(PacienteResponseDto.class)
                .filter(p -> username.equalsIgnoreCase(p.getRut()))
                .next()
                .map(p -> {
                    String nombre = p.getNombres() + " " + p.getApellidoPaterno();
                    return Usuario.builder()
                            .username(p.getRut())
                            .rol("CLIENTE")
                            .pacienteRut(p.getRut())
                            .nombre(nombre.trim())
                            .build();
                });
    }
}
