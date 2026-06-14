package cl.rednorte.reasignacion.service;

import cl.rednorte.reasignacion.config.RabbitConfig;
import cl.rednorte.reasignacion.dto.AsignarCitaRequest;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.LocalDate;
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

    // ── Procesamiento inicial del cupo liberado (desde 5A) ───────────────────

    @Transactional
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
                .prioridadMinima(evento.getPrioridadMinima())
                .creadaEn(ahora)
                .expiraEn(expiraEn)
                .build();

        ofertaRepository.save(oferta);
        log.info("Oferta {} creada para paciente {} (expira {})", token, candidato.getPacienteId(), expiraEn);

        String mensaje = String.format(
                "RedNorte: Se ha liberado un cupo de %s para el %s a las %s.",
                evento.getEspecialidad(), evento.getFechaCupo(), evento.getHoraCupo());

        publicarNotificacion(candidato.getPacienteId(), mensaje, token.toString());
    }

    // ── Confirmar oferta (público, un solo uso) ──────────────────────────────

    @Transactional
    public void confirmar(UUID token) {
        Oferta oferta = ofertaRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token inválido"));

        if (oferta.getEstado() != EstadoOferta.OFRECIDA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Esta oferta ya fue " + oferta.getEstado());
        }

        if (LocalDateTime.now().isAfter(oferta.getExpiraEn())) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "Esta oferta venció el " + oferta.getExpiraEn());
        }

        oferta.setEstado(EstadoOferta.CONFIRMADA);
        ofertaRepository.saveAndFlush(oferta); // flush para que el @Version falle aquí si hay concurrencia

        AsignarCitaRequest asignarReq = AsignarCitaRequest.builder()
                .pacienteId(oferta.getPacienteId())
                .especialidad(oferta.getEspecialidad())
                .fecha(oferta.getFechaCupo().toString())
                .hora(oferta.getHoraCupo().toString())
                .solicitudId(oferta.getSolicitudId())
                .citaIdAReasignar(oferta.getCitaId())
                .build();

        try {
            restTemplate.postForObject(listaEsperaUrl + "/citas/asignar", asignarReq, String.class);
        } catch (Exception e) {
            log.error("Error asignando cupo para oferta {}: {}", token, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo asignar el cupo. Inténtelo de nuevo.");
        }

        log.info("Oferta {} confirmada y cupo asignado a paciente {}", token, oferta.getPacienteId());
    }

    // ── Rechazar oferta (público, un solo uso) ───────────────────────────────

    @Transactional
    public void rechazar(UUID token) {
        Oferta oferta = ofertaRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token inválido"));

        if (oferta.getEstado() != EstadoOferta.OFRECIDA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Esta oferta ya fue " + oferta.getEstado());
        }

        oferta.setEstado(EstadoOferta.RECHAZADA);
        ofertaRepository.save(oferta);

        republicarCupo(oferta, List.of(oferta.getPacienteId()));
        log.info("Oferta {} rechazada. Cupo re-publicado para el siguiente candidato.", token);
    }

    // ── Revisar vencidas (admin) ─────────────────────────────────────────────

    @Transactional
    public int revisarVencidas() {
        List<Oferta> vencidas = ofertaRepository
                .findByEstadoAndExpiraEnBefore(EstadoOferta.OFRECIDA, LocalDateTime.now());

        for (Oferta oferta : vencidas) {
            oferta.setEstado(EstadoOferta.EXPIRADA);
            ofertaRepository.save(oferta);
            republicarCupo(oferta, List.of(oferta.getPacienteId()));
        }

        log.info("Revisión de vencidas: {} ofertas expiradas y re-publicadas.", vencidas.size());
        return vencidas.size();
    }

    // ── Consultas ────────────────────────────────────────────────────────────

    public List<Oferta> listarTodas() {
        return ofertaRepository.findAll();
    }

    // ── Helpers privados ─────────────────────────────────────────────────────

    private void republicarCupo(Oferta oferta, List<Long> excluidos) {
        CupoLiberadoEvent evento = CupoLiberadoEvent.builder()
                .especialidad(oferta.getEspecialidad())
                .fechaCupo(oferta.getFechaCupo().toString())
                .horaCupo(oferta.getHoraCupo().toString())
                .prioridadMinima(oferta.getPrioridadMinima())
                .origen(oferta.getOrigen().name())
                .pacientesExcluidos(excluidos)
                .build();

        rabbitTemplate.convertAndSend(RabbitConfig.COLA_CUPO_LIBERADO, evento);
    }

    private void publicarNotificacion(Long pacienteId, String mensaje, String token) {
        for (String canal : List.of("EMAIL", "SMS")) {
            rabbitTemplate.convertAndSend(RabbitConfig.COLA_NOTIFICACION_SOLICITADA,
                    NotificacionSolicitadaEvent.builder()
                            .pacienteId(pacienteId)
                            .canal(canal)
                            .mensaje(mensaje)
                            .token(token)
                            .build());
        }
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
