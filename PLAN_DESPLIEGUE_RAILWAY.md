# PLAN DE DESPLIEGUE — RedNorte en Railway

> Documento compañero de `ESTADO_ACTUAL.md` y `PLAN_MEJORAS.md`
> Contexto: trial de 30 días ($5 de crédito), 4 bases separadas, operación
> "apagado por defecto" (encender solo para probar/presentar).

---

## 0. Estrategia y principios

El proyecto son ~11 servicios (5 Spring Boot + 4 PostgreSQL + RabbitMQ) más el
frontend. Para no quemar el trial:

1. **Todo lo que se pueda, en local primero.** Las fases D1 y D2 (externalizar
   configuración y contenerizar) se hacen y se prueban en tu máquina, SIN gastar
   crédito. El hito que destraba Railway es: `docker compose up` levanta el
   sistema COMPLETO en local, todos los servicios hablándose por variables.
2. **Railway se despliega de corrido**, en una sesión, cuando ya está probado.
3. **Apagado por defecto.** Se enciende (redeploy) para trabajar/presentar y se
   apaga (remove deployment) al terminar. El dominio y las variables se conservan.
4. **4 bases separadas** (decisión tomada): fiel a la arquitectura. El costo extra
   de almacenamiento frente a consolidar es de centavos; el gasto real es el
   cómputo, que se controla apagando.

### Realidad de costos (estimada, no garantizada)
- Railway no permite cotizar con exactitud: factura por consumo real.
- Almacenamiento (gotea aunque apagues): ~$0.15/GB-mes → 4 bases ≈ ~$0.45/mes.
- Cómputo (solo mientras corre): todo encendido ≈ $0.02–0.03/hora.
- Con uso intermitente (~20–30 h en el mes) + apagado: los $5 del trial alcanzan
  holgados. Con todo 24/7: el trial se agota en ~5–8 días.
- **Vigila el dashboard de uso** las primeras veces para validar tu consumo real.

---

## 1. Obstáculos a resolver ANTES de Railway

Estos son los motivos por los que el proyecto no se puede "subir y listo":

1. **URLs hardcoded a localhost** (deuda técnica #3 del ESTADO_ACTUAL). Gateway y
   clientes apuntan a `http://localhost:808X`. En Railway cada servicio tiene su
   hostname interno. Hay que externalizar TODAS a variables de entorno.
2. **Servicios Spring Boot sin contenerizar.** El docker-compose solo levanta
   bases y RabbitMQ. Falta un Dockerfile por servicio.
3. **Secretos en application.properties** (deudas #1 y #2: secreto JWT y
   credenciales de BD en claro). Deben pasar a variables de entorno. Es el momento
   de pagar esas deudas.
4. **CORS y URL del frontend.** CORS está en el gateway apuntando a orígenes
   locales; el frontend apunta a `localhost:8080`. Ambos se externalizan.
5. **RabbitMQ** se conecta por variables, igual que las bases.

---

## 2. Fases de implementación

> Mismo método de siempre: una fase por sesión, verificar, commit. Trabaja TODO
> esto en una rama nueva `feature/deploy-railway` para no tocar la rama de la
> defensa.

### Fase D1 — Externalizar configuración (EN LOCAL)
Sacar de los `application.properties` de los 5 servicios (y del frontend) todo lo
que asume localhost o sea secreto, hacia variables de entorno con *fallback* al
valor local actual para no romper el desarrollo:
- URLs entre servicios (gateway → servicios, clientes HTTP).
- Credenciales y URL de cada base de datos.
- Secreto JWT.
- Conexión a RabbitMQ.
- En el frontend, la URL base del gateway.
- CORS: orígenes permitidos como variable.
Criterio de éxito: el proyecto sigue corriendo en local igual que antes, pero
ahora leyendo de variables. NADA hardcodeado que apunte a localhost o secretos.

### Fase D2 — Contenerizar (EN LOCAL)
- Un `Dockerfile` por servicio Spring Boot (build multi-stage con Maven + JRE).
- Un `Dockerfile` para el frontend (build + servidor estático).
- Ampliar el `docker-compose.yml` para levantar TODO (servicios incluidos), no
  solo bases y RabbitMQ.
Criterio de éxito (HITO CLAVE): `docker compose up` levanta el sistema completo en
local y los dos flujos funcionan de punta a punta. Si esto no pasa, NO seguir a
Railway.

### Fase D3 — Railway: datos (4 PostgreSQL + RabbitMQ)
- Crear el proyecto en Railway.
- Provisionar 4 servicios PostgreSQL (uno por servicio de negocio) y RabbitMQ.
- Anotar las variables de conexión internas que Railway genera.
- Usar **Private Networking** para la comunicación interna (evita costo de egress).

### Fase D4 — Railway: backend (5 servicios)
- Desplegar los 5 servicios Spring Boot (desde el repo o las imágenes).
- Conectar cada uno a su base y a RabbitMQ por las variables de la D3.
- Configurar las URLs entre servicios con los hostnames internos de Railway.
- Exponer públicamente SOLO el api-gateway (los demás, solo red interna).

### Fase D5 — Railway: frontend + CORS
- Desplegar el frontend, apuntando su URL base al dominio público del gateway.
- Ajustar la variable de orígenes CORS del gateway para permitir la URL del front.

### Fase D6 — Datos + verificación end-to-end
- Cargar el seed en las bases de Railway (adaptar el script: aquí las bases están
  en la nube; correr los inserts vía el cliente de Railway o conexión remota).
- Verificar el canario (Sala del día con datos) y correr los dos flujos contra la
  URL pública.

---

## 3. Operación: encender y apagar (trial-friendly)

**Para apagar (dejar de gastar cómputo):**
- En cada servicio, menú de 3 puntos del deployment → "Remove". Esto detiene el
  cómputo. El servicio, sus variables y su configuración se conservan.
- El almacenamiento de las bases sigue goteando (centavos); es inevitable.

**Para encender:**
- Redeploy desde el mismo menú de 3 puntos. Dentro del periodo de retención,
  restaura imagen, ajustes y variables sin reconfigurar.
- El dominio público se conserva entre apagados.

**Para la defensa:**
- Enciende 15–20 min antes (varios servicios tardan en quedar "verdes").
- Ten SIEMPRE la demo local como plan B: no depende de Railway ni de internet.
  Railway ha tenido incidentes de capacidad; no apuestes la nota a su uptime.

---

## 4. Riesgos y notas

| # | Riesgo | Mitigación |
|---|---|---|
| 1 | Quemar el trial por dejar todo 24/7 | Apagado por defecto; encender solo para usar. Vigilar dashboard. |
| 2 | Orden de arranque (un servicio levanta antes que su BD) | Healthchecks / reintentos de conexión; Spring Boot suele reintentar. |
| 3 | Egress entre servicios | Usar Private Networking interno, no las URLs públicas. |
| 4 | Romper lo que ya funciona | Rama `feature/deploy-railway`; la rama de la defensa intacta. |
| 5 | Diferencias JVM/memoria en contenedor | Limitar heap de la JVM por variable si algún servicio se pasa de RAM. |
| 6 | El seed asume bases locales | Adaptar la carga de datos a conexión remota en D6. |

---

## 5. Punto de partida

Arrancar por **Fase D1 en local**. No tocar Railway hasta que la D2 cierre con el
hito de `docker compose up` levantando todo el sistema. El 80% de los problemas de
un deploy así son de configuración que asumía localhost; resolverlos en local
—donde depurar es rápido y gratis— vuelve el deploy casi mecánico.
