package cl.rednorte.notificaciones.factory;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class NotificacionFactoryTest {

    @Test
    void crearCanal_sms_devuelveSmsNotificacion() {
        assertInstanceOf(SmsNotificacion.class, NotificacionFactory.crearCanal("SMS"));
    }

    @Test
    void crearCanal_smsMinusculas_devuelveSmsNotificacion() {
        assertInstanceOf(SmsNotificacion.class, NotificacionFactory.crearCanal("sms"));
    }

    @Test
    void crearCanal_email_devuelveEmailNotificacion() {
        assertInstanceOf(EmailNotificacion.class, NotificacionFactory.crearCanal("EMAIL"));
    }

    @Test
    void crearCanal_canalDesconocido_devuelveEmailNotificacionPorDefecto() {
        assertInstanceOf(EmailNotificacion.class, NotificacionFactory.crearCanal("WHATSAPP"));
    }

    @Test
    void crearCanal_nulo_devuelveEmailNotificacionPorDefecto() {
        assertInstanceOf(EmailNotificacion.class, NotificacionFactory.crearCanal(null));
    }
}
