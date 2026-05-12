package cl.rednorte.gateway.auth.model;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
