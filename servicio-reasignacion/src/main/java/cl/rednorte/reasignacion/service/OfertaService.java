package cl.rednorte.reasignacion.service;

import cl.rednorte.reasignacion.config.RabbitConfig;
import cl.rednorte.reasignacion.dto.CandidatoMatchingDto;
import cl.rednorte.reasignacion.event.CupoLiberadoEvent;
import cl.rednorte.reasignacion.event.NotificacionSolicitadaEvent;
import cl.rednorte.reasignacion.model.EstadoOferta;
import cl.rednorte.reasignacion.model.Oferta;
import cl.rednorte.reasignacion.model.OrigenCupo;
import cl.rednorte.reasignacion.repository.OfertaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfertaService {

    private final OfertaRepository ofertaRepository;
    private final RabbitTemplate rabbitTemplate;
    private final RestTemplate restTemplate;

    @Value("${services.lista-espera.url}")
    private String listaEsperaUrl;

    public void procesarCupoLiberado(CupoLiberadoEvent evento) {
        List<CandidatoMatchingDto> candidatos = obtenerCandidatos(evento);

        if (candidatos == null || candidatos.isEmpty()) {
            log.info("Sin candidatos para cupo {} {} {} esp={}",
                    evento.getOrigen(), evento.getFechaCupo(), evento.getHoraCupo(), evento.getEspecialidad());
            return;
        }

        CandidatoMatchingDto candidato = candidatos.get(0);

        OrigenCupo origen = OrigenCupo.valueOf(evento.getOrigen());
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime expiraEn = origen == OrigenCupo.NO_SHOW_ADELANTO
                ? ahora.plusMinutes(45)
                : ahora.plusHours(24);

        Long solicitudId = "LISTA_ESPERA".equals(candidato.getOrigen()) ? candidato.getSolicitudId() : null;
        Long citaId      = "CITA_FUTURA".equals(candidato.getOrigen())  ? candidato.getCitaId()      : null;

        UUID token = UUID.randomUUID();

        Oferta oferta = Oferta.builder()
                .token(token)
                .pacienteId(candidato.getPacienteId())
                .solicitudId(solicitudId)
                .citaId(citaId)
                .especialidad(evento.getEspecialidad())
                .fechaCupo(LocalDate.parse(evento.getFechaCupo()))
                .horaCupo(LocalTime.parse(evento.getHoraCupo()))
                .estado(EstadoOferta.OFRECIDA)
                .origen(origen)
                .creadaEn(ahora)
                .expiraEn(expiraEn)
                .build();

        ofertaRepository.save(oferta);
        log.info("Oferta {} creada para paciente {} (expira {})", token, candidato.getPacienteId(), expiraEn);

        String mensaje = String.format(
                "RedNorte: Se ha liberado un cupo de %s para el %s a las %s. " +
                "Para confirmar su asistencia use el token: %s",
                evento.getEspecialidad(), evento.getFechaCupo(), evento.getHoraCupo(), token);

        rabbitTemplate.convertAndSend(RabbitConfig.COLA_NOTIFICACION_SOLICITADA,
                NotificacionSolicitadaEvent.builder()
                        .pacienteId(candidato.getPacienteId())
                        .canal("EMAIL")
                        .mensaje(mensaje)
                        .build());

        rabbitTemplate.convertAndSend(RabbitConfig.COLA_NOTIFICACION_SOLICITADA,
                NotificacionSolicitadaEvent.builder()
                        .pacienteId(candidato.getPacienteId())
                        .canal("SMS")
                        .mensaje(mensaje)
                        .build());
    }

    private List<CandidatoMatchingDto> obtenerCandidatos(CupoLiberadoEvent evento) {
        UriComponentsBuilder uri = UriComponentsBuilder
                .fromUriString(listaEsperaUrl + "/matching/candidatos")
                .queryParam("especialidad", evento.getEspecialidad())
                .queryParam("fechaCupo", evento.getFechaCupo());

        if (evento.getPrioridadMinima() != null && !evento.getPrioridadMinima().isBlank()) {
            uri.queryParam("prioridadMinima", evento.getPrioridadMinima());
        }

        if (evento.getPacientesExcluidos() != null) {
            evento.getPacientesExcluidos().forEach(id -> uri.queryParam("excluir", id));
        }

        return restTemplate.exchange(
                uri.toUriString(),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<CandidatoMatchingDto>>() {}
        ).getBody();
    }
}
