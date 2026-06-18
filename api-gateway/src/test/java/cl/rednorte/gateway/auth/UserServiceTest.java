package cl.rednorte.gateway.auth;

import cl.rednorte.gateway.auth.model.PacienteResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import static org.mockito.Answers.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private PasswordEncoder encoder;

    @Mock(answer = RETURNS_DEEP_STUBS)
    private WebClient webClient;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "clientePassword", "rednorte2026");
        lenient().when(encoder.encode("admin123")).thenReturn("HASH_ADMIN");
        lenient().when(encoder.encode("doc123")).thenReturn("HASH_DOC");
        userService.inicializar();
    }

    @Test
    void autenticar_adminConPasswordCorrecta_devuelveUsuarioAdmin() {
        when(encoder.matches("admin123", "HASH_ADMIN")).thenReturn(true);

        StepVerifier.create(userService.autenticar("admin", "admin123"))
                .assertNext(usuario -> {
                    org.junit.jupiter.api.Assertions.assertEquals("ADMIN", usuario.getRol());
                    org.junit.jupiter.api.Assertions.assertEquals("Administrador RedNorte", usuario.getNombre());
                })
                .verifyComplete();
    }

    @Test
    void autenticar_adminConPasswordIncorrecta_noDevuelveUsuario() {
        when(encoder.matches("incorrecta", "HASH_ADMIN")).thenReturn(false);

        StepVerifier.create(userService.autenticar("admin", "incorrecta"))
                .verifyComplete();
    }

    @Test
    void autenticar_doctorConPasswordCorrecta_devuelveUsuarioDoctor() {
        when(encoder.matches("doc123", "HASH_DOC")).thenReturn(true);

        StepVerifier.create(userService.autenticar("doctor1", "doc123"))
                .assertNext(usuario -> org.junit.jupiter.api.Assertions.assertEquals("DOCTOR", usuario.getRol()))
                .verifyComplete();
    }

    @Test
    void autenticar_clienteConPasswordPorDefectoIncorrecta_noConsultaPacientes() {
        StepVerifier.create(userService.autenticar("11111111-1", "otra-clave"))
                .verifyComplete();
    }

    @Test
    void autenticar_clienteConRutRegistrado_devuelveUsuarioCliente() {
        PacienteResponseDto paciente = new PacienteResponseDto();
        paciente.setRut("11111111-1");
        paciente.setNombres("Juan");
        paciente.setApellidoPaterno("Perez");

        when(webClient.get().uri("/pacientes").retrieve().bodyToFlux(PacienteResponseDto.class))
                .thenReturn(Flux.just(paciente));

        StepVerifier.create(userService.autenticar("11111111-1", "rednorte2026"))
                .assertNext(usuario -> {
                    org.junit.jupiter.api.Assertions.assertEquals("CLIENTE", usuario.getRol());
                    org.junit.jupiter.api.Assertions.assertEquals("11111111-1", usuario.getPacienteRut());
                    org.junit.jupiter.api.Assertions.assertEquals("Juan Perez", usuario.getNombre());
                })
                .verifyComplete();
    }

    @Test
    void autenticar_clienteConRutNoRegistrado_noDevuelveUsuario() {
        when(webClient.get().uri("/pacientes").retrieve().bodyToFlux(PacienteResponseDto.class))
                .thenReturn(Flux.empty());

        StepVerifier.create(userService.autenticar("99999999-9", "rednorte2026"))
                .verifyComplete();
    }
}
