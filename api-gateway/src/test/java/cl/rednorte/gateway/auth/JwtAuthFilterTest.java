package cl.rednorte.gateway.auth;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.RequestPath;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private ServerWebExchange exchange;
    @Mock
    private ServerHttpRequest request;
    @Mock
    private ServerHttpResponse response;
    @Mock
    private RequestPath requestPath;
    @Mock
    private WebFilterChain chain;

    @InjectMocks
    private JwtAuthFilter filter;

    private void stubRequest(String path, HttpMethod method, String authHeader) {
        when(exchange.getRequest()).thenReturn(request);
        when(request.getPath()).thenReturn(requestPath);
        when(requestPath.value()).thenReturn(path);
        lenient().when(request.getMethod()).thenReturn(method);
        HttpHeaders headers = new HttpHeaders();
        if (authHeader != null) {
            headers.set(HttpHeaders.AUTHORIZATION, authHeader);
        }
        lenient().when(request.getHeaders()).thenReturn(headers);
    }

    @Test
    void filter_rutaPublicaAuth_dejaPasarSinValidarToken() {
        stubRequest("/auth/login", HttpMethod.POST, null);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(chain).filter(exchange);
        verify(jwtUtil, never()).validarToken(any());
    }

    @Test
    void filter_metodoOptions_dejaPasarSinValidarToken() {
        stubRequest("/pacientes", HttpMethod.OPTIONS, null);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(chain).filter(exchange);
    }

    @Test
    void filter_confirmarOferta_dejaPasarSinToken() {
        stubRequest("/ofertas/confirmar", HttpMethod.POST, null);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(chain).filter(exchange);
        verify(jwtUtil, never()).validarToken(any());
    }

    @Test
    void filter_sinHeaderAutorizacion_devuelve401() {
        stubRequest("/bff/dashboard", HttpMethod.GET, null);
        when(exchange.getResponse()).thenReturn(response);
        when(response.setComplete()).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(response).setStatusCode(HttpStatus.UNAUTHORIZED);
        verify(chain, never()).filter(any());
    }

    @Test
    void filter_tokenValido_dejaPasarYPropagaContextoDeAutenticacion() {
        stubRequest("/bff/dashboard", HttpMethod.GET, "Bearer token-valido");
        Claims claims = org.mockito.Mockito.mock(Claims.class);
        when(claims.getSubject()).thenReturn("admin");
        when(claims.get("rol", String.class)).thenReturn("ADMIN");
        when(jwtUtil.validarToken("token-valido")).thenReturn(claims);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(chain).filter(exchange);
    }

    @Test
    void filter_tokenInvalido_devuelve401() {
        stubRequest("/bff/dashboard", HttpMethod.GET, "Bearer token-invalido");
        when(jwtUtil.validarToken("token-invalido")).thenThrow(new RuntimeException("token corrupto"));
        when(exchange.getResponse()).thenReturn(response);
        when(response.setComplete()).thenReturn(Mono.empty());

        filter.filter(exchange, chain).block();

        verify(response).setStatusCode(HttpStatus.UNAUTHORIZED);
        verify(chain, never()).filter(any());
    }
}
