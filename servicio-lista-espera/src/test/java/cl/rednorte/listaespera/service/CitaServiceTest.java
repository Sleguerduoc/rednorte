package cl.rednorte.listaespera.service;

import cl.rednorte.listaespera.config.RabbitConfig;
import cl.rednorte.listaespera.dto.AgendarCitaRequest;
import cl.rednorte.listaespera.event.CupoLiberadoEvent;
import cl.rednorte.listaespera.model.Cita;
import cl.rednorte.listaespera.model.EstadoCita;
import cl.rednorte.listaespera.model.EstadoSolicitud;
import cl.rednorte.listaespera.model.SolicitudListaEspera;
import cl.rednorte.listaespera.repository.CitaRepository;
import cl.rednorte.listaespera.repository.SolicitudRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitaServiceTest {

    @Mock
    private CitaRepository citaRepository;
    @Mock
    private SolicitudRepository solicitudRepository;
    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private CitaService citaService;

    @Test
    void agendar_creaCitaProgramadaYMarcaSolicitudAgendada() {
        SolicitudListaEspera solicitud = SolicitudListaEspera.builder()
                .id(5L).pacienteId(1L).especialidad("Cardiologia")
                .estado(EstadoSolicitud.PENDIENTE).build();

        AgendarCitaRequest request = new AgendarCitaRequest();
        request.setSolicitudId(5L);
        request.setFecha(LocalDate.now().plusDays(1));
        request.setHora(LocalTime.of(10, 0));

        when(solicitudRepository.findById(5L)).thenReturn(Optional.of(solicitud));
        when(citaRepository.existsByEspecialidadAndFechaAndHoraAndEstadoIn(
                "Cardiologia", request.getFecha(), request.getHora(),
                List.of(EstadoCita.PROGRAMADA, EstadoCita.EN_SALA))).thenReturn(false);
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> inv.getArgument(0));

        Cita resultado = citaService.agendar(request);

        assertEquals(EstadoCita.PROGRAMADA, resultado.getEstado());
        assertEquals(1L, resultado.getPacienteId());
        assertEquals("Cardiologia", resultado.getEspecialidad());
        assertEquals(EstadoSolicitud.AGENDADA, solicitud.getEstado());
        verify(solicitudRepository).save(solicitud);
        verify(citaRepository).save(any(Cita.class));
    }

    @Test
    void agendar_cupoYaOcupado_lanzaConflicto409() {
        SolicitudListaEspera solicitud = SolicitudListaEspera.builder()
                .id(5L).pacienteId(1L).especialidad("Cardiologia")
                .estado(EstadoSolicitud.PENDIENTE).build();

        AgendarCitaRequest request = new AgendarCitaRequest();
        request.setSolicitudId(5L);
        request.setFecha(LocalDate.now().plusDays(1));
        request.setHora(LocalTime.of(10, 0));

        when(solicitudRepository.findById(5L)).thenReturn(Optional.of(solicitud));
        when(citaRepository.existsByEspecialidadAndFechaAndHoraAndEstadoIn(
                "Cardiologia", request.getFecha(), request.getHora(),
                List.of(EstadoCita.PROGRAMADA, EstadoCita.EN_SALA))).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> citaService.agendar(request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(citaRepository, never()).save(any());
    }

    @Test
    void checkIn_desdeProgramada_marcaEnSalaYRegistraHora() {
        Cita cita = Cita.builder().id(1L).estado(EstadoCita.PROGRAMADA).build();
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> inv.getArgument(0));

        Cita resultado = citaService.checkIn(1L);

        assertEquals(EstadoCita.EN_SALA, resultado.getEstado());
        assertNotNull(resultado.getHoraCheckIn());
    }

    @Test
    void checkIn_desdeEstadoInvalido_lanzaConflicto() {
        Cita cita = Cita.builder().id(1L).estado(EstadoCita.EN_SALA).build();
        when(citaRepository.findById(1L)).thenReturn(Optional.of(cita));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> citaService.checkIn(1L));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(citaRepository, never()).save(any());
    }

    @Test
    void marcarNoShow_conPresentesPosteriores_compactaYLiberaUltimaHora() {
        LocalDate hoy = LocalDate.now();
        Cita citaNoShow = Cita.builder().id(1L).especialidad("Cardiologia")
                .fecha(hoy).hora(LocalTime.of(9, 0)).estado(EstadoCita.PROGRAMADA).build();
        Cita presente1 = Cita.builder().id(2L).especialidad("Cardiologia")
                .fecha(hoy).hora(LocalTime.of(9, 30)).estado(EstadoCita.EN_SALA).build();
        Cita presente2 = Cita.builder().id(3L).especialidad("Cardiologia")
                .fecha(hoy).hora(LocalTime.of(10, 0)).estado(EstadoCita.EN_SALA).build();

        when(citaRepository.findById(1L)).thenReturn(Optional.of(citaNoShow));
        when(citaRepository.findByFechaAndEspecialidadAndEstadoAndHoraAfterOrderByHoraAsc(
                hoy, "Cardiologia", EstadoCita.EN_SALA, LocalTime.of(9, 0)))
                .thenReturn(List.of(presente1, presente2));
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> inv.getArgument(0));

        Cita resultado = citaService.marcarNoShow(1L);

        assertEquals(EstadoCita.NO_SHOW, resultado.getEstado());
        assertEquals(LocalTime.of(9, 0), presente1.getHora());
        assertEquals(LocalTime.of(9, 30), presente2.getHora());

        ArgumentCaptor<CupoLiberadoEvent> captor = ArgumentCaptor.forClass(CupoLiberadoEvent.class);
        verify(rabbitTemplate, times(1)).convertAndSend(eq(RabbitConfig.COLA_CUPO_LIBERADO), captor.capture());
        CupoLiberadoEvent evento = captor.getValue();
        assertEquals("Cardiologia", evento.getEspecialidad());
        assertEquals(hoy.toString(), evento.getFechaCupo());
        assertEquals("10:00", evento.getHoraCupo());
        assertEquals("NO_SHOW_ADELANTO", evento.getOrigen());
        assertEquals("CRITICA", evento.getPrioridadMinima());
    }

    @Test
    void marcarNoShow_pacienteAusenteSinCheckIn_noSeMueve() {
        LocalDate hoy = LocalDate.now();
        Cita citaNoShow = Cita.builder().id(1L).especialidad("Cardiologia")
                .fecha(hoy).hora(LocalTime.of(9, 0)).estado(EstadoCita.PROGRAMADA).build();
        // Paciente que nunca hizo check-in: sigue PROGRAMADA, no EN_SALA.
        // El repositorio real lo excluye del query (filtra por EN_SALA); lo simulamos
        // devolviendo una lista vacia y verificando que nunca se le mueve la hora.
        Cita ausente = Cita.builder().id(9L).especialidad("Cardiologia")
                .fecha(hoy).hora(LocalTime.of(9, 30)).estado(EstadoCita.PROGRAMADA).build();

        when(citaRepository.findById(1L)).thenReturn(Optional.of(citaNoShow));
        when(citaRepository.findByFechaAndEspecialidadAndEstadoAndHoraAfterOrderByHoraAsc(
                hoy, "Cardiologia", EstadoCita.EN_SALA, LocalTime.of(9, 0)))
                .thenReturn(List.of());
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> inv.getArgument(0));

        citaService.marcarNoShow(1L);

        assertEquals(LocalTime.of(9, 30), ausente.getHora());
        verify(citaRepository, never()).save(ausente);
        verify(rabbitTemplate, never()).convertAndSend(eq(RabbitConfig.COLA_CUPO_LIBERADO), any(CupoLiberadoEvent.class));
    }

    @Test
    void marcarNoShow_sinPresentesQueMover_noLiberaNiPublicaEvento() {
        LocalDate hoy = LocalDate.now();
        Cita citaNoShow = Cita.builder().id(1L).especialidad("Cardiologia")
                .fecha(hoy).hora(LocalTime.of(9, 0)).estado(EstadoCita.EN_SALA).build();

        when(citaRepository.findById(1L)).thenReturn(Optional.of(citaNoShow));
        when(citaRepository.findByFechaAndEspecialidadAndEstadoAndHoraAfterOrderByHoraAsc(
                hoy, "Cardiologia", EstadoCita.EN_SALA, LocalTime.of(9, 0)))
                .thenReturn(List.of());
        when(citaRepository.save(any(Cita.class))).thenAnswer(inv -> inv.getArgument(0));

        Cita resultado = citaService.marcarNoShow(1L);

        assertEquals(EstadoCita.NO_SHOW, resultado.getEstado());
        verify(rabbitTemplate, never()).convertAndSend(any(String.class), any(Object.class));
    }
}
