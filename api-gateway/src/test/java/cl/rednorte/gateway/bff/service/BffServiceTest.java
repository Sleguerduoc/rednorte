package cl.rednorte.gateway.bff.service;

import cl.rednorte.gateway.bff.client.ListaEsperaClient;
import cl.rednorte.gateway.bff.client.NotificacionesClient;
import cl.rednorte.gateway.bff.client.PacientesClient;
import cl.rednorte.gateway.bff.client.ReasignacionClient;
import cl.rednorte.gateway.bff.dto.CitaCompletaResponse;
import cl.rednorte.gateway.bff.dto.CitaDto;
import cl.rednorte.gateway.bff.dto.NotificacionDto;
import cl.rednorte.gateway.bff.dto.OfertaDto;
import cl.rednorte.gateway.bff.dto.OfertaResponse;
import cl.rednorte.gateway.bff.dto.PacienteDto;
import cl.rednorte.gateway.bff.dto.ReasignacionDto;
import cl.rednorte.gateway.bff.dto.SolicitudDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BffServiceTest {

    @Mock
    private PacientesClient pacientesClient;
    @Mock
    private ListaEsperaClient listaEsperaClient;
    @Mock
    private ReasignacionClient reasignacionClient;
    @Mock
    private NotificacionesClient notificacionesClient;

    @InjectMocks
    private BffService bffService;

    private PacienteDto paciente(long id, String nombres, String apPaterno, String apMaterno, String rut) {
        PacienteDto p = new PacienteDto();
        p.setId(id);
        p.setNombres(nombres);
        p.setApellidoPaterno(apPaterno);
        p.setApellidoMaterno(apMaterno);
        p.setRut(rut);
        return p;
    }

    @Test
    void getDashboard_agregaConteosDeLosCuatroServicios() {
        PacienteDto p1 = paciente(1L, "Juan", "Perez", "Soto", "11111111-1");
        SolicitudDto pendiente = new SolicitudDto();
        pendiente.setId(1L); pendiente.setPacienteId(1L); pendiente.setEstado("PENDIENTE");
        SolicitudDto cancelada = new SolicitudDto();
        cancelada.setId(2L); cancelada.setPacienteId(1L); cancelada.setEstado("CANCELADA");

        when(pacientesClient.listar()).thenReturn(Flux.just(p1));
        when(listaEsperaClient.listar()).thenReturn(Flux.just(pendiente, cancelada));
        when(reasignacionClient.listar()).thenReturn(Flux.just(new ReasignacionDto(), new ReasignacionDto()));
        when(notificacionesClient.listar()).thenReturn(Flux.just(new NotificacionDto()));

        StepVerifier.create(bffService.getDashboard())
                .assertNext(dashboard -> {
                    org.junit.jupiter.api.Assertions.assertEquals(1, dashboard.getTotalPacientes());
                    org.junit.jupiter.api.Assertions.assertEquals(2, dashboard.getTotalSolicitudes());
                    org.junit.jupiter.api.Assertions.assertEquals(1, dashboard.getSolicitudesPendientes());
                    org.junit.jupiter.api.Assertions.assertEquals(1, dashboard.getSolicitudesCanceladas());
                    org.junit.jupiter.api.Assertions.assertEquals(2, dashboard.getTotalReasignaciones());
                    org.junit.jupiter.api.Assertions.assertEquals(1, dashboard.getTotalNotificaciones());
                })
                .verifyComplete();
    }

    @Test
    void getDashboard_clienteFallaSeUsaListaVaciaSinRomperElZip() {
        when(pacientesClient.listar()).thenReturn(Flux.error(new RuntimeException("caído")));
        when(listaEsperaClient.listar()).thenReturn(Flux.empty());
        when(reasignacionClient.listar()).thenReturn(Flux.empty());
        when(notificacionesClient.listar()).thenReturn(Flux.empty());

        StepVerifier.create(bffService.getDashboard())
                .assertNext(dashboard -> org.junit.jupiter.api.Assertions.assertEquals(0, dashboard.getTotalPacientes()))
                .verifyComplete();
    }

    @Test
    void getListaCompletaConPacientes_enriqueceConNombreYRut() {
        PacienteDto p1 = paciente(1L, "Juan", "Perez", "Soto", "11111111-1");
        SolicitudDto solicitud = new SolicitudDto();
        solicitud.setId(10L); solicitud.setPacienteId(1L); solicitud.setEstado("PENDIENTE");
        solicitud.setEspecialidad("Cardiologia");

        when(pacientesClient.listar()).thenReturn(Flux.just(p1));
        when(listaEsperaClient.listar()).thenReturn(Flux.just(solicitud));

        StepVerifier.create(bffService.getListaCompletaConPacientes())
                .assertNext(r -> {
                    org.junit.jupiter.api.Assertions.assertEquals("Juan Perez Soto", r.getPacienteNombre());
                    org.junit.jupiter.api.Assertions.assertEquals("11111111-1", r.getPacienteRut());
                })
                .verifyComplete();
    }

    @Test
    void getListaCompletaConPacientes_pacienteDesconocido_usaNombrePorDefecto() {
        SolicitudDto solicitud = new SolicitudDto();
        solicitud.setId(10L); solicitud.setPacienteId(99L); solicitud.setEstado("PENDIENTE");

        when(pacientesClient.listar()).thenReturn(Flux.empty());
        when(listaEsperaClient.listar()).thenReturn(Flux.just(solicitud));

        StepVerifier.create(bffService.getListaCompletaConPacientes())
                .assertNext(r -> {
                    org.junit.jupiter.api.Assertions.assertEquals("Paciente 99", r.getPacienteNombre());
                    org.junit.jupiter.api.Assertions.assertEquals(null, r.getPacienteRut());
                })
                .verifyComplete();
    }

    @Test
    void getListaEsperaPendiente_filtraSoloPendientes() {
        PacienteDto p1 = paciente(1L, "Juan", "Perez", "Soto", "11111111-1");
        SolicitudDto pendiente = new SolicitudDto();
        pendiente.setId(1L); pendiente.setPacienteId(1L); pendiente.setEstado("PENDIENTE");
        SolicitudDto cancelada = new SolicitudDto();
        cancelada.setId(2L); cancelada.setPacienteId(1L); cancelada.setEstado("CANCELADA");

        when(pacientesClient.listar()).thenReturn(Flux.just(p1));
        when(listaEsperaClient.listar()).thenReturn(Flux.just(pendiente, cancelada));

        StepVerifier.create(bffService.getListaEsperaPendiente())
                .expectNextMatches(r -> r.getId().equals(1L))
                .verifyComplete();
    }

    @Test
    void getSalaDelDia_enriqueceCitasConNombrePaciente() {
        PacienteDto p1 = paciente(1L, "Juan", "Perez", null, "11111111-1");
        CitaDto cita = new CitaDto();
        cita.setId(5L); cita.setPacienteId(1L); cita.setEspecialidad("Cardiologia");
        cita.setFecha("2026-06-16"); cita.setHora("10:00");

        when(pacientesClient.listar()).thenReturn(Flux.just(p1));
        when(listaEsperaClient.listarCitasDelDia("2026-06-16")).thenReturn(Flux.just(cita));

        StepVerifier.create(bffService.getSalaDelDia("2026-06-16"))
                .assertNext((CitaCompletaResponse r) ->
                        org.junit.jupiter.api.Assertions.assertEquals("Juan Perez", r.getPacienteNombre()))
                .verifyComplete();
    }

    @Test
    void getOfertas_enriqueceOfertasConNombrePaciente() {
        PacienteDto p1 = paciente(1L, "Juan", "Perez", "Soto", "11111111-1");
        OfertaDto oferta = new OfertaDto();
        oferta.setId(7L); oferta.setPacienteId(1L); oferta.setEstado("OFRECIDA");

        when(pacientesClient.listar()).thenReturn(Flux.just(p1));
        when(reasignacionClient.listarOfertas()).thenReturn(Flux.just(oferta));

        StepVerifier.create(bffService.getOfertas())
                .assertNext((OfertaResponse r) ->
                        org.junit.jupiter.api.Assertions.assertEquals("Juan Perez Soto", r.getPacienteNombre()))
                .verifyComplete();
    }

    @Test
    void getListaCompletaConPacientes_sinNombreNiApellidos_usaSinNombre() {
        PacienteDto p1 = new PacienteDto();
        p1.setId(1L);
        SolicitudDto solicitud = new SolicitudDto();
        solicitud.setId(10L); solicitud.setPacienteId(1L); solicitud.setEstado("PENDIENTE");

        when(pacientesClient.listar()).thenReturn(Flux.just(p1));
        when(listaEsperaClient.listar()).thenReturn(Flux.just(solicitud));

        StepVerifier.create(bffService.getListaCompletaConPacientes())
                .assertNext(r -> org.junit.jupiter.api.Assertions.assertEquals("Sin nombre", r.getPacienteNombre()))
                .verifyComplete();
    }
}
