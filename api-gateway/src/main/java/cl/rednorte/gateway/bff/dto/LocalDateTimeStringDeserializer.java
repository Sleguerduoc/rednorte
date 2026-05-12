package cl.rednorte.gateway.bff.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;

/**
 * Deserializa fechas del microservicio servicio-lista-espera hacia String ISO-8601.
 *
 * Spring Boot serializa LocalDateTime como array JSON [año, mes, día, h, m, s, nano]
 * por defecto. Este deserializador maneja ambos formatos (array y string).
 */
public class LocalDateTimeStringDeserializer extends StdDeserializer<String> {

    public LocalDateTimeStringDeserializer() {
        super(String.class);
    }

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {

        // Formato array: [2026, 5, 12, 10, 30, 0] o [2026, 5, 12, 10, 30, 0, 0]
        if (p.currentToken() == JsonToken.START_ARRAY) {
            int[] parts = ctxt.readValue(p, int[].class);
            if (parts.length >= 6) {
                return String.format("%04d-%02d-%02dT%02d:%02d:%02d",
                        parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
            }
            return null;
        }

        // Formato string ISO-8601: "2026-05-12T10:30:00" (si ya está configurado así)
        if (p.currentToken() == JsonToken.VALUE_STRING) {
            return p.getText();
        }

        return null;
    }
}
