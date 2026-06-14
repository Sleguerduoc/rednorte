# PLAN DE MEJORAS — RedNorte

> Documento compañero de `ESTADO_ACTUAL.md`
> Generado: 2026-06-13 · Alcance: **completo** (agenda real + ambos flujos)
> Contexto: proyecto académico, pero debe verse y funcionar bien.

---

## 0. Hallazgo de la Fase 0 (lo que cambia todo)

Tras revisar el modelo real: **el sistema no tiene agendamiento.** Existe una sola
entidad, `SolicitudListaEspera`, que mezcla "petición en la fila" con "cita". Nadie
tiene fecha ni hora asignada. Hoy el modelo es:

| Campo | Tipo | Notas |
|---|---|---|
| id | Long | PK |
| pacienteId | Long | ID interno de pacientes (no RUT) |
| especialidad | String | obligatorio |
| prioridad | String | texto libre, default `"NORMAL"` |
| estado | String | texto libre, default `"PENDIENTE"` |
| fechaRegistro | LocalDateTime | único campo para ordenar la fila (FIFO) |

Consecuencia directa:

- **Flujo 2** ("cancela una cita a futuro") no tiene contra qué medir "a futuro":
  no hay fecha de cita persistida. El `fecha` del evento de cancelación es un String
  libre que manda el caller y **no se guarda**.
- **Flujo 1** ("no llegó a su hora hoy" + adelantar la fila + liberar la última hora)
  necesita una agenda del día con cupos por hora y especialidad. No existe.

Por eso el plan ahora arranca **construyendo el agendamiento** y recién encima monta
los dos flujos.

---

## 1. Las dos features, bien separadas

| | **Flujo 1 — Adelanto intra-día** | **Flujo 2 — Cancelación a futuro** |
|---|---|---|
| Disparador | Admin marca NO_SHOW de una cita de HOY | Se cancela una cita de fecha futura |
| Acción | Adelantar a los presentes → libera la **última hora del día** | El cupo futuro queda libre |
| **Candidatos** | Misma **cola unificada**, filtrada a prioridad `CRÍTICA` (poco aviso) | Misma **cola unificada**, prioridad abierta |
| Confirmación | El paciente confirma por **link** | El paciente confirma por **link** |

**Cola unificada de candidatos (Opción 3).** Ambos flujos consultan **un solo motor de
matching** que considera juntos a dos tipos de candidato y los ordena por (1) prioridad
clínica y (2) antigüedad esperando:

- **Sin cupo** (`PENDIENTE` en lista de espera): no tienen fecha; cualquier cupo los mejora.
- **Con cupo a futuro más lejano** que el cupo liberado: se adelantan.

> **La cascada es el mecanismo, no un problema.** Si se adelanta a un paciente que tenía
> cita lejana, su cupo liberado vuelve a entrar a la **misma cola** y termina cayendo en
> alguien de la lista de espera. Así el sistema drena el backlog en pasos sucesivos.
>
> **Nota sobre el aviso disponible:** en el Flujo 1 (última hora de HOY) el aviso es de
> horas, así que muchos rechazarán y la oferta pasará al siguiente — es esperable y la
> caducidad lo maneja. En el Flujo 2 hay días de aviso, así que adelantar a un agendado
> lejano es plenamente viable.

---

## 2. Decisiones tomadas

1. **No-show:** lo marca el admin con un botón (manual).
2. **Check-in / "en la sala":** concepto nuevo; lo marca el admin con un botón.
3. **Confirmación de cupo:** el paciente confirma por un link en la notificación.
4. **Oferta secuencial con caducidad:** el cupo se ofrece a una persona a la vez;
   si no confirma antes de `expiraEn`, pasa al siguiente. Evita doble reserva.
5. **Caducidad sugerida:** cupo de hoy (última hora) → 30–45 min · cupo futuro → 24 h.
6. **La agenda vive en `servicio-lista-espera`** (la entidad `Cita` se agrega aquí,
   no se crea un servicio nuevo). Respeta "una BD por servicio" y evita inflar la
   infraestructura. *Evolución futura posible: un `servicio-agenda` dedicado.*

---

## 3. Modelo de datos objetivo

### 3.1 Normalizar lo existente — `SolicitudListaEspera`
El texto libre rompe el matching ("solo críticos" falla si alguien escribió "URGENTE").
Fijar valores canónicos y migrar los datos actuales:

- `prioridad` → enum: `CRITICA | ALTA | NORMAL`
- `estado` → enum de fila: `PENDIENTE | AGENDADA | CANCELADA | ATENDIDA`
- Conservar `fechaRegistro` para el orden FIFO.

### 3.2 Entidad nueva — `Cita` (en servicio-lista-espera)
Representa un cupo agendado. Es lo que hoy no existe.

| Campo | Tipo | Notas |
|---|---|---|
| id | Long | PK |
| solicitudId | Long | FK a la solicitud que la originó |
| pacienteId | Long | |
| especialidad | String/enum | heredada de la solicitud |
| fecha | LocalDate | día del cupo |
| hora | LocalTime | hora del cupo |
| estado | enum | `PROGRAMADA | EN_SALA | ATENDIDA | NO_SHOW | CANCELADA | REASIGNADA` |
| horaCheckIn | LocalDateTime | nullable; se llena al hacer check-in |

> "Última hora del día" = `MAX(hora)` entre las citas de ese día y especialidad.
> No hace falta un motor de plantillas de horarios: el admin asigna fecha+hora al
> agendar, y eso basta para los dos flujos.

### 3.3 Entidad nueva — `Oferta` (en servicio-reasignacion)

| Campo | Tipo | Notas |
|---|---|---|
| id | Long | PK |
| token | UUID | va en el link de confirmación |
| pacienteId | Long | a quién se le ofrece |
| solicitudId / citaId | Long | de dónde sale el candidato |
| especialidad | String/enum | del cupo |
| fechaCupo / horaCupo | LocalDate/LocalTime | el cupo ofrecido |
| estado | enum | `OFRECIDA | CONFIRMADA | RECHAZADA | EXPIRADA` |
| origen | enum | `NO_SHOW_ADELANTO | CANCELACION_FUTURA` |
| creadaEn / expiraEn | LocalDateTime | control de caducidad |

### 3.4 Evento unificado — `CupoLiberadoEvent`
Reemplaza el rol del actual `CitaCanceladaEvent` como disparador del matching.

```
{
  especialidad,
  fechaCupo,
  horaCupo,
  prioridadMinima,        // CRITICA en Flujo 1; abierta en Flujo 2
  origen,                 // NO_SHOW_ADELANTO | CANCELACION_FUTURA
  pacientesExcluidos[]    // para pasar al siguiente sin re-ofrecer
}
```

---

## 4. Bugs actuales a corregir (detectados en Fase 0)

Van dentro de la fase del Flujo 2, pero anótalos:

1. **El evento se publica aunque la cita no exista.** En `cancelarCita`, el `ifPresent`
   solo protege el `save`, no el `convertAndSend`. Mover la publicación dentro del
   bloque que confirma que la entidad existe (o lanzar 404 si no existe).
2. **`fecha` viene del caller, no de la BD.** Debe salir de la entidad persistida,
   no de un parámetro String arbitrario.

---

## 5. Fases de implementación

> Orden: primero el cimiento (modelo + agenda + presencia + matching + oferta),
> luego el flujo más simple (2) y al final el más nuevo (1), y se cierra con frontend.

### Fase 1 — Normalización del modelo base
- Enums de `prioridad` y `estado` en `SolicitudListaEspera`.
- Script/migración de los datos de texto libre actuales a los valores canónicos.
- *Desbloquea:* matching confiable.

### Fase 2 — Modelo de agenda (entidad `Cita`)
- Crear entidad + repositorio `Cita` en servicio-lista-espera.
- `POST /citas/agendar` → convierte una solicitud `PENDIENTE` en `Cita PROGRAMADA`
  con fecha+hora; marca la solicitud como `AGENDADA`.
- `GET /citas?fecha=&especialidad=` → agenda del día por especialidad.

### Fase 3 — Presencia / check-in
- `POST /citas/{id}/check-in` → `EN_SALA` + `horaCheckIn` (botón admin).
- (Opcional) deshacer check-in.

### Fase 4 — Motor de matching (cola unificada)
En servicio-lista-espera, **un solo endpoint** para ambos flujos:

- `GET /matching/candidatos?especialidad=&prioridadMinima=&fechaCupo=&excluir=`

Devuelve la cola combinada y ordenada:
- Incluye solicitudes `PENDIENTE` (sin cupo) de la especialidad.
- Incluye citas agendadas con `fecha` **posterior** a `fechaCupo` (adelantables).
- Orden: prioridad (`CRITICA` → `ALTA` → `NORMAL`), luego antigüedad por `fechaRegistro`
  de la solicitud original (mismo eje para ambos tipos, vía `solicitudId`).
- `prioridadMinima` = `CRITICA` cuando lo llama el Flujo 1; abierta en el Flujo 2.
- `excluir` = pacientes ya descartados (rechazaron/expiraron) para pasar al siguiente.

### Fase 5 — Evento + Oferta + confirmación por link
En servicio-reasignacion:
- Listener de `CupoLiberadoEvent`.
- Según `origen`, consulta la **cola unificada** (`/matching/candidatos`) con el filtro
  de prioridad que corresponde (CRÍTICA para Flujo 1, abierta para Flujo 2), toma al
  primero, crea `Oferta` (`OFRECIDA`, token, `expiraEn`) y publica
  `NotificacionSolicitadaEvent` con el link.
- `POST /ofertas/confirmar?token=` (público, sin JWT) → `CONFIRMADA`; ordena a
  lista-espera asignar el cupo (crear/mover la `Cita`).
- `POST /ofertas/rechazar?token=` → `RECHAZADA` + re-publica `CupoLiberadoEvent`
  agregando a la persona a `pacientesExcluidos`.
- `POST /ofertas/revisar-vencidas` (botón admin) → marca `EXPIRADA` las vencidas y
  re-publica para el siguiente.

En servicio-notificaciones:
- Incluir el link de confirmación en el cuerpo del mensaje (y, si da el tiempo,
  completar el envío real SMTP/SMS que hoy está simulado).

### Fase 6 — Flujo 2 (cancelación a futuro)
- Corregir los dos bugs de la sección 4.
- En la cancelación: si la `Cita` es de fecha futura, marcarla `CANCELADA` y publicar
  `CupoLiberadoEvent` con `origen=CANCELACION_FUTURA` y prioridad abierta.
- El resto ya quedó en la Fase 5.

### Fase 7 — Flujo 1 (no-show + adelanto intra-día)
- `POST /citas/{id}/no-show` (botón admin) → `NO_SHOW`.
- Algoritmo de adelanto (transaccional):
  1. Tomar las citas de HOY, misma especialidad, hora > hora del no-show,
     en estado `EN_SALA`, ordenadas por hora ascendente.
  2. Cascada: cada presente se mueve al cupo libre anterior; el hueco se desplaza
     hacia el final del día.
  3. El cupo libre final (la **última hora**) → publicar `CupoLiberadoEvent` con
     `origen=NO_SHOW_ADELANTO`, `prioridadMinima=CRITICA`.
- Cae en la maquinaria de la Fase 5, pero usando el pozo de **citas futuras críticas**.

### Fase 8 — Frontend + BFF
- Botones: agendar, check-in, marcar no-show, revisar ofertas vencidas.
- Vista "Sala del día" (lista de citas de hoy con su estado y botón de check-in).
- Panel "Ofertas pendientes" con el estado de cada oferta.
- **Página pública de confirmación** (`/confirmar?token=`) sin login.
- Endpoints BFF en el gateway para alimentar esas vistas.

### Fase 9 — Acabado (para que "se vea y funcione bien")
- Validaciones de entrada y manejo de errores consistente (`@ControllerAdvice`).
- Estados visuales claros en la UI (badges por estado/prioridad).
- Mensajes de notificación con texto presentable.

---

## 6. Flujo unificado (diagrama)

```
   FLUJO 1 (hoy)                                  FLUJO 2 (futuro)
   admin marca NO_SHOW                            se cancela cita futura
        │                                              │
        ▼                                              ▼
   adelanto intra-día (cascada)                   marca CANCELADA
   libera la última hora                               │
        │                                              │
        └───────────────────┬──────────────────────────┘
                            ▼
                   CupoLiberadoEvent  (RabbitMQ)
                            ▼
                ┌──────────────────────────┐
                │   servicio-reasignacion   │
                │  consulta la COLA UNIFICADA: │
                │  GET /matching/candidatos    │
                │   (PENDIENTE + agendados      │
                │    a futuro más lejano,       │
                │    orden: prioridad→antigüedad)│
                │  filtro: F1=CRÍTICA / F2=abierta│
                │  crea Oferta (token) →        │
                │  publica notificación         │
                └─────────────┬──────────────┘
                              ▼
                  servicio-notificaciones → SMS/Email con link
                              ▼
                paciente abre link → /ofertas/confirmar?token=
                              ▼
        CONFIRMADA → asignar cupo  |  RECHAZADA/EXPIRADA → siguiente de la fila
```

---

## 7. Riesgos y puntos de atención

| # | Riesgo | Mitigación |
|---|---|---|
| 1 | Doble reserva | Oferta secuencial + bloqueo optimista al confirmar. |
| 2 | Link público sin JWT | Token opaco, de un solo uso, con caducidad. **No** reutilizar el secreto JWT en hardcode (deuda #1 del ESTADO_ACTUAL). |
| 3 | Migración de texto libre a enum | Revisar qué valores reales hay hoy en BD antes de migrar; mapear "URGENTE"→`CRITICA`, etc. |
| 4 | Integridad del adelanto en cascada | Hacerlo en una sola transacción; no dejar dos citas en el mismo cupo. |
| 5 | Zona horaria de "hoy" / "última hora" | Fijar timezone de Chile explícito; no depender del default de la JVM. |
| 6 | Ofertas vencidas sin revisar | Botón manual "revisar vencidas"; job ligero como mejora posterior. |

---

## 8. Fuera de alcance (a propósito)

Estas son deudas reales del `ESTADO_ACTUAL.md`, pero **no** son necesarias para estas
dos features y no conviene mezclarlas para no perder foco: service discovery / Eureka,
CI/CD, contenerizar los servicios Spring Boot, gestor de secretos. Dejarlas anotadas
como trabajo aparte.

---

## 9. Archivos que se tocarán (estimado)

| Servicio | Zonas |
|---|---|
| servicio-lista-espera | `model/SolicitudListaEspera` (enums), nueva entidad+repo `Cita`, `SolicitudService.cancelarCita` (fix bugs + evento), nuevos controladores: agendar, check-in, no-show, matching unificado (`/matching/candidatos`), algoritmo de adelanto |
| servicio-reasignacion | nueva entidad+repo `Oferta`, listener `CupoLiberadoEvent`, `OfertaService`, `OfertaController` (confirmar/rechazar/revisar-vencidas), cliente HTTP a lista-espera |
| servicio-notificaciones | mensaje con link de confirmación; envío real opcional |
| api-gateway | BFF: sala del día, ofertas pendientes; ruta pública `/ofertas/confirmar` |
| frontend | vista Sala del día, botones (agendar/check-in/no-show/revisar), panel Ofertas, página pública de confirmación |
| común | `CupoLiberadoEvent`, enums de prioridad/estado/origen |

---

## 10. Punto de partida sugerido

Empezar por **Fase 1 → Fase 2** (normalización + entidad Cita). Sin agenda no hay
ninguno de los dos flujos, y la migración de enums es la base del matching. Una vez
que exista `Cita` con fecha+hora y los enums limpios, el resto avanza rápido porque
reutiliza la cadena RabbitMQ que ya tienes.
