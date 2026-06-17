package cl.rednorte.listaespera.service;

import cl.rednorte.listaespera.config.RabbitConfig;
import cl.rednorte.listaespera.event.CitaCanceladaEvent;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SolicitudServiceTest {

    @Mock
    private SolicitudRepository repository;
    @Mock
    private CitaRepository citaRepository;
    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private SolicitudService solicitudService;

    @Test
    void cancelarCita_citaFutura_marcaCanceladaYPublicaCupoLiberado() {
        Cita cita = Cita.builder().id(100L).solicitudId(10L).pacienteId(1L)
                .especialidad("Cardiologia").fecha(LocalDate.now().plusDays(2))
                .hora(LocalTime.of(9, 0)).estado(EstadoCita.PROGRAMADA).build();
        SolicitudListaEspera solicitud = SolicitudListaEspera.builder()
                .id(10L).pacienteId(1L).especialidad("Cardiologia")
                .estado(EstadoSolicitud.AGENDADA).build();

        when(citaRepository.findById(100L)).thenReturn(Optional.of(cita));
        when(repository.findById(10L)).thenReturn(Optional.of(solicitud));

        solicitudService.cancelarCita(100L, 1L, "Cardiologia", "2026-06-20");

        assertEquals(EstadoCita.CANCELADA, cita.getEstado());
        assertEquals(EstadoSolicitud.PENDIENTE, solicitud.getEstado());
        verify(citaRepository).save(cita);
        verify(repository).save(solicitud);

        verify(rabbitTemplate, times(1))
                .convertAndSend(eq(RabbitConfig.COLA_CITA_CANCELADA), any(CitaCanceladaEvent.class));

        ArgumentCaptor<CupoLiberadoEvent> captor = ArgumentCaptor.forClass(CupoLiberadoEvent.class);
        verify(rabbitTemplate, times(1))
                .convertAndSend(eq(RabbitConfig.COLA_CUPO_LIBERADO), captor.capture());
        CupoLiberadoEvent evento = captor.getValue();
        assertEquals("Cardiologia", evento.getEspecialidad());
        assertEquals(cita.getFecha().toString(), evento.getFechaCupo());
        assertEquals(cita.getHora().toString(), evento.getHoraCupo());
        assertEquals("CANCELACION_FUTURA", evento.getOrigen());
    }

    @Test
    void cancelarCita_citaInexistente_lanzaNotFoundYNoPublicaEvento() {
        when(citaRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> solicitudService.cancelarCita(999L, 1L, "Cardiologia", "2026-06-20"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(rabbitTemplate, never()).convertAndSend(anyString(), any(Object.class));
        verify(citaRepository, never()).save(any());
    }

    @Test
    void cancelarCita_citaDeHoy_noPublicaCupoLiberado() {
        Cita cita = Cita.builder().id(101L).solicitudId(11L).pacienteId(2L)
                .especialidad("Cardiologia").fecha(LocalDate.now())
                .hora(LocalTime.of(9, 0)).estado(EstadoCita.PROGRAMADA).build();
        SolicitudListaEspera solicitud = SolicitudListaEspera.builder()
                .id(11L).pacienteId(2L).especialidad("Cardiologia")
                .estado(EstadoSolicitud.AGENDADA).build();

        when(citaRepository.findById(101L)).thenReturn(Optional.of(cita));
        when(repository.findById(11L)).thenReturn(Optional.of(solicitud));

        solicitudService.cancelarCita(101L, 2L, "Cardiologia", LocalDate.now().toString());

        assertEquals(EstadoCita.CANCELADA, cita.getEstado());
        verify(rabbitTemplate, times(1))
                .convertAndSend(eq(RabbitConfig.COLA_CITA_CANCELADA), any(CitaCanceladaEvent.class));
        verify(rabbitTemplate, never())
                .convertAndSend(eq(RabbitConfig.COLA_CUPO_LIBERADO), any(CupoLiberadoEvent.class));
    }

    @Test
    void cancelarCita_citaPasada_noPublicaCupoLiberado() {
        Cita cita = Cita.builder().id(102L).solicitudId(12L).pacienteId(3L)
                .especialidad("Cardiologia").fecha(LocalDate.now().minusDays(1))
                .hora(LocalTime.of(9, 0)).estado(EstadoCita.PROGRAMADA).build();
        SolicitudListaEspera solicitud = SolicitudListaEspera.builder()
                .id(12L).pacienteId(3L).especialidad("Cardiologia")
                .estado(EstadoSolicitud.AGENDADA).build();

        when(citaRepository.findById(102L)).thenReturn(Optional.of(cita));
        when(repository.findById(12L)).thenReturn(Optional.of(solicitud));

        solicitudService.cancelarCita(102L, 3L, "Cardiologia", LocalDate.now().minusDays(1).toString());

        verify(rabbitTemplate, never())
                .convertAndSend(eq(RabbitConfig.COLA_CUPO_LIBERADO), any(CupoLiberadoEvent.class));
    }
}
