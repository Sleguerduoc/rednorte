package cl.rednorte.notificaciones.factory;

public class NotificacionFactory {

    public static CanalNotificacion crearCanal(String canal) {
        if ("SMS".equalsIgnoreCase(canal)) {
            return new SmsNotificacion();
        }

        return new EmailNotificacion();
    }
}