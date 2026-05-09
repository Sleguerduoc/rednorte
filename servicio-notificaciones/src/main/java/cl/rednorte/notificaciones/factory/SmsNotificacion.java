package cl.rednorte.notificaciones.factory;

public class SmsNotificacion implements CanalNotificacion {

    @Override
    public void enviar(String mensaje) {
        System.out.println("Enviando SMS: " + mensaje);
    }
}