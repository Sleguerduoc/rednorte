package cl.rednorte.gateway.auth.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String rol;
    private String username;
    private String nombre;
    private String pacienteRut;
}
