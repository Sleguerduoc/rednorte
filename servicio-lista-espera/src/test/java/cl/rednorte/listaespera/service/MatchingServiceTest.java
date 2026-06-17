package cl.rednorte.listaespera.service;

import cl.rednorte.listaespera.dto.CandidatoMatchingDto;
import cl.rednorte.listaespera.model.Cita;
import cl.rednorte.listaespera.model.EstadoCita;
import cl.rednorte.listaespera.model.EstadoSolicitud;
import cl.rednorte.listaespera.model.PrioridadSolicitud;
import cl.rednorte.listaespera.model.SolicitudListaEspera;
import cl.rednorte.listaespera.repository.CitaRepository;
import cl.rednorte.listaespera.repository.SolicitudRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private SolicitudRepository solicitudRepository;
    @Mock
    private CitaRepository citaRepository;

    @InjectMocks
    private MatchingService matchingService;

    @Test
    void obtenerCandidatos_combinaPendientesYCitasFuturas_ordenaPorPrioridadYAntiguedad() {
        LocalDate fechaCupo = LocalDate.of(2026, 6, 20);

        SolicitudListaEspera s1 = SolicitudListaEspera.builder().id(1L).pacienteId(10L)
                .especialidad("Cardiologia").estado(EstadoSolicitud.PENDIENTE)
                .prioridad(PrioridadSolicitud.NORMAL)
                .fechaRegistro(LocalDateTime.of(2026, 2, 1, 0, 0)).build();
        SolicitudListaEspera s2 = SolicitudListaEspera.builder().id(2L).pacienteId(11L)
                .especialidad("Cardiologia").estado(EstadoSolicitud.PENDIENTE)
                .prioridad(PrioridadSolicitud.CRITICA)
                .fechaRegistro(LocalDateTime.of(2026, 3, 1, 0, 0)).build();
        SolicitudListaEspera s3 = SolicitudListaEspera.builder().id(3L).pacienteId(12L)
                .especialidad("Cardiologia").estado(EstadoSolicitud.PENDIENTE)
                .prioridad(PrioridadSolicitud.ALTA)
                .fechaRegistro(LocalDateTime.of(2026, 4, 1, 0, 0)).build();

        SolicitudListaEspera s4 = SolicitudListaEspera.builder().id(4L).pacienteId(13L)
                .especialidad("Cardiologia").estado(EstadoSolicitud.AGENDADA)
                .prioridad(PrioridadSolicitud.ALTA)
                .fechaRegistro(LocalDateTime.of(2026, 1, 1, 0, 0)).build();
        Cita citaFutura = Cita.builder().id(50L).solicitudId(4L).pacienteId(13L)
                .especialidad("Cardiologia").fecha(fechaCupo.plusDays(5))
                .hora(LocalTime.of(11, 0)).estado(EstadoCita.PROGRAMADA).build();

        when(solicitudRepository.findByEspecialidadAndEstado("Cardiologia", EstadoSolicitud.PENDIENTE))
                .thenReturn(List.of(s1, s2, s3));
        when(citaRepository.findByEspecialidadAndEstadoAndFechaAfter(
                "Cardiologia", EstadoCita.PROGRAMADA, fechaCupo))
                .thenReturn(List.of(citaFutura));
        when(solicitudRepository.findAllById(Set.of(4L))).thenReturn(List.of(s4));

        List<CandidatoMatchingDto> resultado = matchingService.obtenerCandidatos(
                "Cardiologia", null, fechaCupo, null);

        assertEquals(4, resultado.size());
        assertEquals(11L, resultado.get(0).getPacienteId()); // CRITICA
        assertEquals(13L, resultado.get(1).getPacienteId()); // ALTA, mas antigua (cita futura)
        assertEquals(12L, resultado.get(2).getPacienteId()); // ALTA, mas reciente (lista espera)
        assertEquals(10L, resultado.get(3).getPacienteId()); // NORMAL
    }

    @Test
    void obtenerCandidatos_prioridadMinimaCritica_excluyeMenoresPrioridad() {
        SolicitudListaEspera normal = SolicitudListaEspera.builder().id(1L).pacienteId(10L)
                .especialidad("Cardiologia").estado(EstadoSolicitud.PENDIENTE)
                .prioridad(PrioridadSolicitud.NORMAL)
                .fechaRegistro(LocalDateTime.now()).build();
        SolicitudListaEspera alta = SolicitudListaEspera.builder().id(2L).pacienteId(11L)
                .especialidad("Cardiologia").estado(EstadoSolicitud.PENDIENTE)
                .prioridad(PrioridadSolicitud.ALTA)
                .fechaRegistro(LocalDateTime.now()).build();
        SolicitudListaEspera critica = SolicitudListaEspera.builder().id(3L).pacienteId(12L)
                .especialidad("Cardiologia").estado(EstadoSolicitud.PENDIENTE)
                .prioridad(PrioridadSolicitud.CRITICA)
                .fechaRegistro(LocalDateTime.now()).build();

        when(solicitudRepository.findByEspecialidadAndEstado("Cardiologia", EstadoSolicitud.PENDIENTE))
                .thenReturn(List.of(normal, alta, critica));

        List<CandidatoMatchingDto> resultado = matchingService.obtenerCandidatos(
                "Cardiologia", PrioridadSolicitud.CRITICA, null, null);

        assertEquals(1, resultado.size());
        assertEquals(12L, resultado.get(0).getPacienteId());
        assertEquals(PrioridadSolicitud.CRITICA, resultado.get(0).getPrioridad());
    }

    @Test
    void obtenerCandidatos_excluir_omitePacientesIndicados() {
        SolicitudListaEspera s1 = SolicitudListaEspera.builder().id(1L).pacienteId(10L)
                .especialidad("Cardiologia").estado(EstadoSolicitud.PENDIENTE)
                .prioridad(PrioridadSolicitud.NORMAL)
                .fechaRegistro(LocalDateTime.now()).build();
        SolicitudListaEspera s2 = SolicitudListaEspera.builder().id(2L).pacienteId(20L)
                .especialidad("Cardiologia").estado(EstadoSolicitud.PENDIENTE)
                .prioridad(PrioridadSolicitud.NORMAL)
                .fechaRegistro(LocalDateTime.now()).build();

        when(solicitudRepository.findByEspecialidadAndEstado("Cardiologia", EstadoSolicitud.PENDIENTE))
                .thenReturn(List.of(s1, s2));

        List<CandidatoMatchingDto> resultado = matchingService.obtenerCandidatos(
                "Cardiologia", null, null, List.of(10L));

        assertEquals(1, resultado.size());
        assertEquals(20L, resultado.get(0).getPacienteId());
    }
}
