package cl.rednorte.gateway.bff.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;

/** Deserializa LocalDate de microservicio (array [2026,6,14] o string ISO) a String ISO-8601. */
public class LocalDateStringDeserializer extends StdDeserializer<String> {

    public LocalDateStringDeserializer() { super(String.class); }

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == JsonToken.START_ARRAY) {
            int[] parts = ctxt.readValue(p, int[].class);
            if (parts.length >= 3) {
                return String.format("%04d-%02d-%02d", parts[0], parts[1], parts[2]);
            }
            return null;
        }
        if (p.currentToken() == JsonToken.VALUE_STRING) {
            return p.getText();
        }
        return null;
    }
}
