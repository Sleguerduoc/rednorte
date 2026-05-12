package cl.rednorte.gateway.auth;

import cl.rednorte.gateway.auth.model.LoginRequest;
import cl.rednorte.gateway.auth.model.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public Mono<ResponseEntity<LoginResponse>> login(@RequestBody LoginRequest request) {
        return userService.autenticar(request.getUsername(), request.getPassword())
                .map(usuario -> {
                    String token = jwtUtil.generarToken(usuario);
                    return ResponseEntity.ok(new LoginResponse(
                            token,
                            usuario.getRol(),
                            usuario.getUsername(),
                            usuario.getNombre(),
                            usuario.getPacienteRut()
                    ));
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
