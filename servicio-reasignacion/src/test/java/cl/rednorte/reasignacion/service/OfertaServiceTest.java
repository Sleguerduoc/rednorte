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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfertaServiceTest {

    @Mock
    private OfertaRepository ofertaRepository;
    @Mock
    private RabbitTemplate rabbitTemplate;
    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private OfertaService ofertaService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(ofertaService, "listaEsperaUrl", "http://lista-espera:8081/api");
    }

    private void mockCandidatos(List<CandidatoMatchingDto> candidatos) {
        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                isNull(),
                ArgumentMatchers.<org.springframework.core.ParameterizedTypeReference<List<CandidatoMatchingDto>>>any()))
                .thenReturn(ResponseEntity.ok(candidatos));
    }

    private CandidatoMatchingDto candidatoListaEspera(Long pacienteId, Long solicitudId) {
        CandidatoMatchingDto c = new CandidatoMatchingDto();
        c.setPacienteId(pacienteId);
        c.setOrigen("LISTA_ESPERA");
        c.setSolicitudId(solicitudId);
        return c;
    }

    @Test
    void procesarCupoLiberado_noShowAdelanto_creaOfertaParaPrimerCandidatoYPublicaNotificacion() {
        CandidatoMatchingDto primero = candidatoListaEspera(10L, 5L);
        CandidatoMatchingDto segundo = candidatoListaEspera(20L, 6L);
        mockCandidatos(List.of(primero, segundo));

        CupoLiberadoEvent evento = CupoLiberadoEvent.builder()
                .especialidad("Cardiologia")
                .fechaCupo("2026-06-20")
                .horaCupo("09:00")
                .prioridadMinima("CRITICA")
                .origen(OrigenCupo.NO_SHOW_ADELANTO.name())
                .pacientesExcluidos(List.of())
                .build();

        ofertaService.procesarCupoLiberado(evento);

        ArgumentCaptor<Oferta> ofertaCaptor = ArgumentCaptor.forClass(Oferta.class);
        verify(ofertaRepository).save(ofertaCaptor.capture());
        Oferta oferta = ofertaCaptor.getValue();

        assertEquals(10L, oferta.getPacienteId());
        assertEquals(5L, oferta.getSolicitudId());
        assertEquals(EstadoOferta.OFRECIDA, oferta.getEstado());
        assertEquals(OrigenCupo.NO_SHOW_ADELANTO, oferta.getOrigen());
        assertEquals(LocalDate.of(2026, 6, 20), oferta.getFechaCupo());
        assertEquals(LocalTime.of(9, 0), oferta.getHoraCupo());

        long minutosHastaExpirar = ChronoUnit.MINUTES.between(oferta.getCreadaEn(), oferta.getExpiraEn());
        assertEquals(45, minutosHastaExpirar);

        verify(rabbitTemplate, times(2))
                .convertAndSend(eq(RabbitConfig.COLA_NOTIFICACION_SOLICITADA), any(NotificacionSolicitadaEvent.class));
    }

    @Test
    void procesarCupoLiberado_cancelacionFutura_expiraEn24Horas() {
        mockCandidatos(List.of(candidatoListaEspera(10L, 5L)));

        CupoLiberadoEvent evento = CupoLiberadoEvent.builder()
                .especialidad("Cardiologia")
                .fechaCupo("2026-06-20")
                .horaCupo("09:00")
                .origen(OrigenCupo.CANCELACION_FUTURA.name())
                .pacientesExcluidos(List.of())
                .build();

        ofertaService.procesarCupoLiberado(evento);

        ArgumentCaptor<Oferta> ofertaCaptor = ArgumentCaptor.forClass(Oferta.class);
        verify(ofertaRepository).save(ofertaCaptor.capture());
        Oferta oferta = ofertaCaptor.getValue();

        long horasHastaExpirar = ChronoUnit.HOURS.between(oferta.getCreadaEn(), oferta.getExpiraEn());
        assertEquals(24, horasHastaExpirar);
    }

    @Test
    void procesarCupoLiberado_sinCandidatos_noCreaOferta() {
        mockCandidatos(List.of());

        CupoLiberadoEvent evento = CupoLiberadoEvent.builder()
                .especialidad("Cardiologia")
                .fechaCupo("2026-06-20")
                .horaCupo("09:00")
                .origen(OrigenCupo.NO_SHOW_ADELANTO.name())
                .build();

        ofertaService.procesarCupoLiberado(evento);

        verify(ofertaRepository, never()).save(any());
        verify(rabbitTemplate, never())
                .convertAndSend(eq(RabbitConfig.COLA_NOTIFICACION_SOLICITADA), any(NotificacionSolicitadaEvent.class));
    }

    private Oferta ofertaOfrecida(UUID token, LocalDateTime expiraEn) {
        return Oferta.builder()
                .id(1L)
                .token(token)
                .pacienteId(10L)
                .solicitudId(5L)
                .especialidad("Cardiologia")
                .fechaCupo(LocalDate.of(2026, 6, 20))
                .horaCupo(LocalTime.of(9, 0))
                .estado(EstadoOferta.OFRECIDA)
                .origen(OrigenCupo.NO_SHOW_ADELANTO)
                .prioridadMinima("CRITICA")
                .creadaEn(LocalDateTime.now())
                .expiraEn(expiraEn)
                .build();
    }

    @Test
    void confirmar_tokenValidoYOfrecida_marcaConfirmadaYAsignaCupo() {
        UUID token = UUID.randomUUID();
        Oferta oferta = ofertaOfrecida(token, LocalDateTime.now().plusMinutes(10));

        when(ofertaRepository.findByToken(token)).thenReturn(Optional.of(oferta));
        when(ofertaRepository.saveAndFlush(any(Oferta.class))).thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(AsignarCitaRequest.class), eq(String.class)))
                .thenReturn("OK");

        ofertaService.confirmar(token);

        assertEquals(EstadoOferta.CONFIRMADA, oferta.getEstado());
        verify(restTemplate, times(1))
                .postForObject(anyString(), any(AsignarCitaRequest.class), eq(String.class));
    }

    @Test
    void confirmar_tokenInexistente_lanzaNotFoundYNoAsigna() {
        UUID token = UUID.randomUUID();
        when(ofertaRepository.findByToken(token)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> ofertaService.confirmar(token));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(restTemplate, never()).postForObject(anyString(), any(), eq(String.class));
    }

    @Test
    void confirmar_ofertaYaNoOfrecida_lanzaConflictoYNoAsigna() {
        UUID token = UUID.randomUUID();
        Oferta oferta = ofertaOfrecida(token, LocalDateTime.now().plusMinutes(10));
        oferta.setEstado(EstadoOferta.RECHAZADA);

        when(ofertaRepository.findByToken(token)).thenReturn(Optional.of(oferta));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> ofertaService.confirmar(token));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(restTemplate, never()).postForObject(anyString(), any(), eq(String.class));
    }

    @Test
    void confirmar_ofertaExpirada_lanzaGoneYNoAsigna() {
        UUID token = UUID.randomUUID();
        Oferta oferta = ofertaOfrecida(token, LocalDateTime.now().minusMinutes(5));

        when(ofertaRepository.findByToken(token)).thenReturn(Optional.of(oferta));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> ofertaService.confirmar(token));

        assertEquals(HttpStatus.GONE, ex.getStatusCode());
        verify(restTemplate, never()).postForObject(anyString(), any(), eq(String.class));
    }

    @Test
    void confirmar_tokenQuemado_segundaConfirmacionFalla() {
        UUID token = UUID.randomUUID();
        Oferta oferta = ofertaOfrecida(token, LocalDateTime.now().plusMinutes(10));

        when(ofertaRepository.findByToken(token)).thenReturn(Optional.of(oferta));
        when(ofertaRepository.saveAndFlush(any(Oferta.class))).thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(AsignarCitaRequest.class), eq(String.class)))
                .thenReturn("OK");

        ofertaService.confirmar(token);
        assertEquals(EstadoOferta.CONFIRMADA, oferta.getEstado());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> ofertaService.confirmar(token));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());

        verify(restTemplate, times(1))
                .postForObject(anyString(), any(AsignarCitaRequest.class), eq(String.class));
    }

    @Test
    void rechazar_ofertaOfrecida_marcaRechazadaYRepublicaConExcluidos() {
        UUID token = UUID.randomUUID();
        Oferta oferta = ofertaOfrecida(token, LocalDateTime.now().plusMinutes(10));

        when(ofertaRepository.findByToken(token)).thenReturn(Optional.of(oferta));

        ofertaService.rechazar(token);

        assertEquals(EstadoOferta.RECHAZADA, oferta.getEstado());
        verify(ofertaRepository).save(oferta);

        ArgumentCaptor<CupoLiberadoEvent> captor = ArgumentCaptor.forClass(CupoLiberadoEvent.class);
        verify(rabbitTemplate, times(1))
                .convertAndSend(eq(RabbitConfig.COLA_CUPO_LIBERADO), captor.capture());
        CupoLiberadoEvent evento = captor.getValue();

        assertEquals("Cardiologia", evento.getEspecialidad());
        assertEquals("2026-06-20", evento.getFechaCupo());
        assertEquals("09:00", evento.getHoraCupo());
        assertEquals(OrigenCupo.NO_SHOW_ADELANTO.name(), evento.getOrigen());
        assertTrue(evento.getPacientesExcluidos().contains(10L));
    }

    @Test
    void revisarVencidas_marcaExpiradasYRepublicaPorCadaUna_devuelveConteo() {
        Oferta vencida1 = ofertaOfrecida(UUID.randomUUID(), LocalDateTime.now().minusMinutes(1));
        Oferta vencida2 = ofertaOfrecida(UUID.randomUUID(), LocalDateTime.now().minusHours(1));
        vencida2.setPacienteId(20L);

        when(ofertaRepository.findByEstadoAndExpiraEnBefore(eq(EstadoOferta.OFRECIDA), any(LocalDateTime.class)))
                .thenReturn(List.of(vencida1, vencida2));

        int count = ofertaService.revisarVencidas();

        assertEquals(2, count);
        assertEquals(EstadoOferta.EXPIRADA, vencida1.getEstado());
        assertEquals(EstadoOferta.EXPIRADA, vencida2.getEstado());
        verify(ofertaRepository).save(vencida1);
        verify(ofertaRepository).save(vencida2);
        verify(rabbitTemplate, times(2))
                .convertAndSend(eq(RabbitConfig.COLA_CUPO_LIBERADO), any(CupoLiberadoEvent.class));
    }

    @Test
    void revisarVencidas_sinVencidas_devuelveCeroYNoRepublica() {
        when(ofertaRepository.findByEstadoAndExpiraEnBefore(eq(EstadoOferta.OFRECIDA), any(LocalDateTime.class)))
                .thenReturn(List.of());

        int count = ofertaService.revisarVencidas();

        assertEquals(0, count);
        verify(ofertaRepository, never()).save(any());
        verify(rabbitTemplate, never())
                .convertAndSend(eq(RabbitConfig.COLA_CUPO_LIBERADO), any(CupoLiberadoEvent.class));
    }
}
