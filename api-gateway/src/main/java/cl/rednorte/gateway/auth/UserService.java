package cl.rednorte.gateway.auth;

import cl.rednorte.gateway.auth.model.PacienteResponseDto;
import cl.rednorte.gateway.auth.model.Usuario;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final PasswordEncoder encoder;
    private final WebClient       webClient;

    @Value("${app.cliente.password:rednorte2026}")
    private String clientePassword;

    /* Mapa pre-calculado una sola vez en el arranque — BCrypt no bloquea el event loop */
    private Map<String, Usuario> usuariosEspeciales;

    @PostConstruct
    public void inicializar() {
        usuariosEspeciales = Map.of(
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
     * Autenticación reactiva y no bloqueante.
     * - Admin / Doctor : valida contra el mapa pre-calculado; BCrypt corre en
     *   boundedElastic para no bloquear el hilo de Netty.
     * - CLIENTE        : cualquier paciente registrado usa su RUT + contraseña por defecto.
     */
    public Mono<Usuario> autenticar(String username, String password) {

        Usuario especial = usuariosEspeciales.get(username);

        if (especial != null) {
            // Offload BCrypt.matches() al scheduler de I/O bloqueante
            return Mono.fromCallable(() -> encoder.matches(password, especial.getPassword()))
                    .subscribeOn(Schedulers.boundedElastic())
                    .flatMap(coincide -> coincide ? Mono.just(especial) : Mono.empty());
        }

        // CLIENTE: valida contraseña por defecto y busca el RUT en servicio-pacientes
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
                    String nombre = (p.getNombres() + " " + p.getApellidoPaterno()).trim();
                    return Usuario.builder()
                            .username(p.getRut())
                            .rol("CLIENTE")
                            .pacienteRut(p.getRut())
                            .nombre(nombre)
                            .build();
                });
    }
}
