package cl.rednorte.gateway.auth.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Usuario {
    private String username;
    private String password;
    private String rol;
    private String pacienteRut;
    private String nombre;
}
