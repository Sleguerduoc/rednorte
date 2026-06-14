package cl.rednorte.gateway.bff.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;

/** Deserializa LocalTime de microservicio (array [9,30] o string ISO) a String HH:mm. */
public class LocalTimeStringDeserializer extends StdDeserializer<String> {

    public LocalTimeStringDeserializer() { super(String.class); }

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == JsonToken.START_ARRAY) {
            int[] parts = ctxt.readValue(p, int[].class);
            if (parts.length >= 2) {
                return String.format("%02d:%02d", parts[0], parts[1]);
            }
            return null;
        }
        if (p.currentToken() == JsonToken.VALUE_STRING) {
            return p.getText();
        }
        return null;
    }
}
