# Auditoría RedNorte — Evaluación Parcial N°3 (Desarrollo Fullstack III, Duoc UC)

> Generado: 2026-06-18. Verificación basada en archivos reales del repositorio (`HEAD` = `6711fbf`, rama `main`) y ejecución real de `mvn test jacoco:report` en los 5 módulos backend. No se asume nada que no se haya leído o ejecutado.

---

## INDICADOR 1 (5%) — Arquitectura BFF + microservicios

**Estado: CUMPLE**

Microservicios detectados (cada uno con `pom.xml` propio, `parent` Spring Boot 4.0.6, puerto propio en `application.properties`):

| Servicio | Puerto | Evidencia |
|---|---|---|
| `api-gateway` | 8080 | [api-gateway/pom.xml](api-gateway/pom.xml), [application.properties:1](api-gateway/src/main/resources/application.properties#L1) |
| `servicio-pacientes` | 8081 | [application.properties:2](servicio-pacientes/src/main/resources/application.properties#L2) |
| `servicio-lista-espera` | 8082 | [application.properties:1](servicio-lista-espera/src/main/resources/application.properties#L1) |
| `servicio-reasignacion` | 8083 | [application.properties:1](servicio-reasignacion/src/main/resources/application.properties#L1) |
| `servicio-notificaciones` | 8084 | [application.properties:1](servicio-notificaciones/src/main/resources/application.properties#L1) |

El BFF **no es un simple proxy**: [BffService.java](api-gateway/src/main/java/cl/rednorte/gateway/bff/service/BffService.java) usa `Mono.zip()` para llamar en paralelo a 4 clientes (`PacientesClient`, `ListaEsperaClient`, `ReasignacionClient`, `NotificacionesClient`), agrega resultados, calcula totales/contadores (`getDashboard()`, líneas 38-69) y enriquece DTOs cruzando pacientes con solicitudes/citas/ofertas (`enriquecerSolicitud`, `enriquecerCita`, `enriquecerOferta`, líneas 126-174). Expuesto vía [BffController.java](api-gateway/src/main/java/cl/rednorte/gateway/bff/controller/BffController.java) en `/bff/dashboard`, `/bff/lista-espera/completa`, `/bff/sala-del-dia`, `/bff/lista-espera`, `/bff/ofertas`.

**Acción pendiente:** ninguna.

---

## INDICADOR 2 (10%) — Frontend moderno + backend con distintas tecnologías

**Estado: CUMPLE**

- Frontend: React 19.2.5 + Vite 8.0.10 confirmado en [frontend/package.json](frontend/package.json#L15-L28). Scripts: `dev`, `build`, `lint`, `preview` (línea 6-11). **No hay script `test`** (ver Indicador 4/8).
- Backend: Java 21 + Spring Boot 4.0.6 (todos los `pom.xml`), Spring Cloud Gateway WebFlux ([api-gateway/pom.xml:49](api-gateway/pom.xml#L49)), Spring Data JPA + PostgreSQL (`servicio-pacientes/pom.xml:35,58`), Spring AMQP/RabbitMQ (`servicio-lista-espera/pom.xml:35`), JJWT 0.12.6 ([api-gateway/pom.xml:57-72](api-gateway/pom.xml#L57-L72)), SpringDoc OpenAPI 2.8.8 en los 5 servicios.

**Acción pendiente:** ninguna.

---

## INDICADOR 3 (5%) — Integración REST + persistencia JPA/SP + RabbitMQ

**Estado: CUMPLE**

**Endpoints REST por servicio** (`@RestController`/`@RequestMapping`):

| Servicio | Base path | Endpoints |
|---|---|---|
| pacientes | `/pacientes` | POST, GET, GET /{id}, DELETE /{id} — [PacienteController.java](servicio-pacientes/src/main/java/cl/rednorte/pacientes/controller/PacienteController.java) |
| lista-espera | `/citas` | POST /agendar, GET, POST /asignar, POST /{id}/check-in, POST /{id}/deshacer-check-in, POST /{id}/no-show, GET /del-dia — [CitaController.java](servicio-lista-espera/src/main/java/cl/rednorte/listaespera/controller/CitaController.java) |
| lista-espera | `/listas-espera` | POST, GET, POST /cancelar-cita — [SolicitudController.java](servicio-lista-espera/src/main/java/cl/rednorte/listaespera/controller/SolicitudController.java) |
| lista-espera | `/matching` | GET /candidatos — [MatchingController.java](servicio-lista-espera/src/main/java/cl/rednorte/listaespera/controller/MatchingController.java) |
| reasignacion | `/ofertas` | POST /confirmar, POST /rechazar, POST /revisar-vencidas, GET — [OfertaController.java](servicio-reasignacion/src/main/java/cl/rednorte/reasignacion/controller/OfertaController.java) |
| reasignacion | `/reasignaciones` | GET — [ReasignacionController.java](servicio-reasignacion/src/main/java/cl/rednorte/reasignacion/controller/ReasignacionController.java) |
| notificaciones | `/notificaciones` | GET — [NotificacionController.java](servicio-notificaciones/src/main/java/cl/rednorte/notificaciones/controller/NotificacionController.java) |
| gateway | `/auth` | POST /login — [AuthController.java](api-gateway/src/main/java/cl/rednorte/gateway/auth/AuthController.java) |

**Persistencia JPA** — 6 entidades `@Entity` + 6 repositorios `JpaRepository`:
`Paciente`, `Cita`, `SolicitudListaEspera`, `Oferta`, `Reasignacion`, `Notificacion` con sus respectivos `*Repository` (uno por servicio, salvo lista-espera y reasignacion que tienen 2 cada uno).

**RabbitMQ** — confirmado productor/consumidor real, no solo declaración de colas:
- `cita.cancelada`: declarada en `servicio-lista-espera` ([RabbitConfig.java:11](servicio-lista-espera/src/main/java/cl/rednorte/listaespera/config/RabbitConfig.java#L11)) y `servicio-reasignacion` ([RabbitConfig.java:11](servicio-reasignacion/src/main/java/cl/rednorte/reasignacion/config/RabbitConfig.java#L11)); consumida por `CitaCanceladaListener.java`.
- `notificacion.solicitada`: declarada en `servicio-reasignacion` (línea 12) y `servicio-notificaciones` (línea 11); consumida por `NotificacionListener.java`.
- Cola adicional no mencionada en el contexto del encargo: `cupo.liberado` (consumida por `CupoLiberadoListener.java` en reasignación) — vale la pena mencionarla en la documentación de arquitectura si se entrega un diagrama.

**Acción pendiente:** ninguna funcional. Documentar la tercera cola (`cupo.liberado`) en el diagrama de arquitectura cuando se elabore (ver BLOQUEADORES).

---

## INDICADOR 4 + 8 (10% + 20%) — PRUEBAS UNITARIAS

### Backend — JUnit 5 + Mockito + JaCoCo

**Estado: CUMPLE (parcial en 2 puntos críticos, ver abajo)**

Los 5 `pom.xml` tienen el plugin `jacoco-maven-plugin` 0.8.15 configurado idénticamente, con `prepare-agent` + `report` en fase `test`, excluyendo `config/**`, `model/**`, `dto/**`, `event/**`, `*Application.class` (ej. [servicio-pacientes/pom.xml:135-161](servicio-pacientes/pom.xml#L135-L161)).

**Comando exacto para generar el reporte por servicio:**
```
cd <servicio> && mvn test jacoco:report
```
HTML resultante en `<servicio>/target/site/jacoco/index.html`. CSV crudo en `<servicio>/target/site/jacoco/jacoco.csv`.

Se ejecutó `mvn test jacoco:report` en los 5 módulos en esta auditoría (2026-06-18). **Todos los tests pasan sin errores.** Cobertura de líneas real (leída de `LINE_COVERED`/`LINE_MISSED` del CSV, no de los nombres de columna por posición):

| Servicio | Cobertura de líneas | Detalle por clase |
|---|---|---|
| api-gateway | **87.1%** (203/233) | `BffService`, `JwtUtil`, `UserService`, `AuthController`, `JwtAuthFilter`, `BffController` = 100%. **`PacientesClient`, `NotificacionesClient` = 38%; `ReasignacionClient`, `ListaEsperaClient` = 23%** (clientes WebClient, rutas de error/fallback sin cubrir). |
| servicio-pacientes | **100%** (15/15) | `PacienteService`, `PacienteController` = 100%. Cobertura útil pero alcance muy pequeño (solo 15 líneas instrumentadas tras exclusiones). |
| servicio-lista-espera | **83.0%** (186/224) | `MatchingService`, `CitaController`, `MatchingController`, `SolicitudController` = 100%; `CitaService` = 87%; `SolicitudService` = 81%. **`GlobalExceptionHandler` = 0%** (0/17 líneas). |
| servicio-reasignacion | **86.5%** (148/171) | `ReasignacionService`, `ReasignacionController`, `OfertaController` = 100%; `OfertaService` = 95%. **`CitaCanceladaListener` = 0% (0/2), `CupoLiberadoListener` = 0% (0/6), `GlobalExceptionHandler` = 0% (0/9)**. |
| servicio-notificaciones | **96.3%** (26/27) | Todo en 100% salvo `NotificacionFactory` = 75% (3/4). |
| **GLOBAL ponderado** | **86.3%** (578/670) | Calculado replicando la lógica de [cobertura-global.ps1](cobertura-global.ps1) (suma de `LINE_COVERED`/`LINE_MISSED` de los 5 CSV). Coherente con el 87.2% reportado en el commit `c5aa780`. |

**Componentes con cobertura < 60% o sin tests (marcados explícitamente como pide la rúbrica):**
- `CitaCanceladaListener` y `CupoLiberadoListener` (servicio-reasignacion): **0%**, sin clase de test dedicada (no existe `*ListenerTest.java` en ese módulo — confirmado por listado de `src/test`). Es lógica de consumo RabbitMQ, parte central del flujo asíncrono del proyecto.
- `GlobalExceptionHandler` en `servicio-lista-espera` y `servicio-reasignacion`: **0%** en ambos.
- Clientes HTTP del BFF (`PacientesClient`, `ListaEsperaClient`, `ReasignacionClient`, `NotificacionesClient`): 23-38%, por debajo del umbral.

**Patrones de diseño confirmados en código real:**
| Patrón | Evidencia |
|---|---|
| Repository | `PacienteRepository`, `CitaRepository`, `SolicitudRepository`, `OfertaRepository`, `ReasignacionRepository`, `NotificacionRepository` — todos `extends JpaRepository` |
| Dependency Injection (constructor) | `@RequiredArgsConstructor` + campos `final` en casi todos los `@Service`/`@RestController`, ej. [PacienteService.java:12-16](servicio-pacientes/src/main/java/cl/rednorte/pacientes/service/PacienteService.java#L12-L16) |
| DTO | Carpeta `bff/dto/` en api-gateway (10 DTOs), `dto/` en lista-espera y reasignación |
| Factory (Simple Factory) | [NotificacionFactory.java:5-11](servicio-notificaciones/src/main/java/cl/rednorte/notificaciones/factory/NotificacionFactory.java#L5-L11): `crearCanal(String canal)` retorna `SmsNotificacion` o `EmailNotificacion` según parámetro |
| API Gateway / BFF | Ver Indicador 1 |
| Publish-Subscribe (RabbitMQ) | Ver Indicador 3 |
| Database per Service | 4 instancias PostgreSQL independientes en [docker-compose.yml](docker-compose.yml) (`postgres-pacientes`, `postgres-lista`, `postgres-reasignacion`, `postgres-notificaciones`) |

### Frontend — Vitest/Jest

**Estado: FALTANTE**

- `frontend/package.json` no tiene `vitest`, `jest`, `@testing-library/*` en dependencias ([frontend/package.json](frontend/package.json)) ni script `test`/`test:coverage`.
- Búsqueda de `*.test.*` / `*.spec.*` en `frontend/src` (48 archivos `.js/.jsx/.ts/.tsx` totales): **0 coincidencias**.
- Cobertura frontend: **0%** (no hay infraestructura de testing, no solo falta correrlo).

**Acción concreta:**
1. `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` en `frontend/`.
2. Agregar a `package.json`: `"test": "vitest run"`, `"test:coverage": "vitest run --coverage"` y configurar `vite.config.js` con bloque `test: { environment: 'jsdom', coverage: { reporter: ['text','html'] } }`.
3. Escribir al menos pruebas de componentes críticos (login, tabla de lista de espera, formulario de paciente) antes de la entrega — actualmente esto es lo más grave para la nota de testing.

---

## ENTREGABLES DEL ENCARGO

| Entregable | Estado | Evidencia / Detalle |
|---|---|---|
| README.md en frontend | **PARCIAL** | [frontend/README.md](frontend/README.md) existe pero es el boilerplate genérico de Vite ("This template provides a minimal setup..."), sin instrucciones reales de instalación/ejecución/pruebas del proyecto RedNorte. |
| README.md por microservicio | **FALTANTE** | Ningún `pom.xml`-folder (`api-gateway`, `servicio-*`) tiene `README.md` propio. |
| package.json con scripts | CUMPLE | Ver Indicador 2. |
| application.properties + pom.xml por microservicio | CUMPLE | Confirmado en los 5 servicios. |
| Documentación de API (Swagger/OpenAPI) | CUMPLE | `springdoc-openapi-starter-*` en los 5 `pom.xml` + clase `config/OpenApiConfig.java` en cada uno (ej. [servicio-pacientes/.../OpenApiConfig.java](servicio-pacientes/src/main/java/cl/rednorte/pacientes/config/OpenApiConfig.java)). Swagger UI disponible en `http://localhost:<puerto>/swagger-ui.html` por servicio al levantar cada uno. |
| Colección Postman | **FALTANTE** | No se encontró ningún archivo `*.postman_collection.json` en el repo. |
| Reporte de cobertura generado (HTML/PDF) | **PARCIAL** | El HTML se genera al ejecutar `mvn test jacoco:report` (queda en `target/site/jacoco/index.html`, gitignored, no versionado) y existe [cobertura-global.ps1](cobertura-global.ps1) que consolida el % global desde los CSV. No hay un PDF/HTML versionado y entregable en el repo a la fecha de esta auditoría. |
| `repositorios.txt` o PDF con enlaces | **FALTANTE** | No existe en el repo. El remoto detectado es `https://github.com/Sleguerduoc/rednorte` (mono-repo, no hay repos separados por microservicio que enlazar). |
| Diagrama de arquitectura (PNG/JPG/PDF) | **FALTANTE** | Solo se encontraron `frontend/src/assets/hero.png` y `rednorte-logo.png` (assets de UI, no diagramas). El diagrama ASCII de arquitectura existe únicamente en texto dentro de [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md#L60-L90), no como imagen entregable. |
| PDF de descripción de persistencia | **FALTANTE** | No existe ningún `.pdf` en el repositorio. |
| PDF de informe de pruebas | **FALTANTE** | No existe ningún `.pdf` en el repositorio. |

---

## GIT — Historial y estrategia de ramas

```
git log --oneline --all --graph --decorate
```
(resumen; ver salida completa en terminal)

- Ramas: `main` (HEAD, = `origin/main`), `develop` (= `origin/develop`), `qa` (= `origin/qa`), `feature/agenda-y-ofertas`, `feature/deploy-railway` (= `origin/feature/deploy-railway`).
- Patrón observado: commits de feature (`Fase 1`, `Fase 2`, ... `Fase 9`, `D1`, `D2`) se integran a `develop` vía Pull Request (`Merge pull request #N from Sleguerduoc/develop`), `develop` se promueve a `qa` (`Merge pull request #N from Sleguerduoc/qa`), y finalmente `qa`/`develop` se mergean a `main`. Hay al menos 15 PRs registrados en el historial (`#1` a `#15`).
- Esto **no es GitHub Flow puro** (que usa solo `main` + ramas de feature efímeras con PR directo a `main`). Es más cercano a un **Git Flow simplificado con dos ramas de integración** (`develop` → `qa` → `main`), lo cual es razonable y debería describirse así en la documentación de entrega en lugar de llamarlo "GitHub Flow con rama de integración" — son estrategias distintas y un evaluador que conozca ambas notará la imprecisión terminológica.

**Acción concreta:** corregir la descripción de la estrategia de ramas en la documentación de entrega para reflejar el flujo real (`feature → develop → qa → main`, 3 niveles de integración), no "GitHub Flow".

---

## 1) TABLA RESUMEN

| Indicador | Peso | Estado | Evidencia clave | Acción pendiente |
|---|---|---|---|---|
| 1. BFF + microservicios | 5% | CUMPLE | `BffService.java` (agregación real), 5 servicios con pom/puerto propio | Ninguna |
| 2. Frontend moderno + backend distintas tecnologías | 10% | CUMPLE | React 19+Vite 8, Spring Boot 4 + RabbitMQ + JPA + JWT | Ninguna |
| 3. REST + JPA/SP + RabbitMQ | 5% | CUMPLE | 8 controllers REST, 6 entidades/repos, 3 colas RabbitMQ funcionales | Documentar cola `cupo.liberado` no mencionada en el alcance original |
| 4. Pruebas unitarias (cobertura) | 10% | **PARCIAL** | Backend 86.3% global, frontend 0% | Crear suite Vitest en frontend |
| 8. Pruebas unitarias (informe/profundidad) | 20% | **PARCIAL** | Listeners RabbitMQ y GlobalExceptionHandler en 0% en 2 servicios; sin informe PDF versionado | Tests de listeners + exception handlers; generar y versionar reporte HTML/PDF |
| Entregables documentales | — | **FALTANTE en su mayoría** | Sin diagrama imagen, sin Postman, sin PDFs, sin README por servicio, sin repositorios.txt | Ver checklist de BLOQUEADORES |

---

## 2) BLOQUEADORES (priorizados, lo crítico para la nota)

1. **Frontend sin testing (0%)** — no hay Vitest/Jest instalado ni un solo archivo de test. Es el hueco más grande de la rúbrica de testing (peso combinado 30% entre indicadores 4 y 8). Acción: instalar Vitest + Testing Library y escribir pruebas de al menos los componentes de login y las 3 vistas por rol.
2. **Listeners de RabbitMQ sin tests (`CitaCanceladaListener`, `CupoLiberadoListener` = 0%)** — es la lógica de negocio asíncrona central del proyecto (cancelación → reasignación → notificación) y queda totalmente sin verificar.
3. **`GlobalExceptionHandler` sin tests en 2 de 4 servicios con backend.**
4. **No hay reporte de cobertura versionado en el repo** (ni HTML ni PDF) — el `target/` está gitignored, así que aunque `mvn test jacoco:report` funciona, no hay nada que "entregar" hoy. Acción: copiar `target/site/jacoco/` a una carpeta `docs/coverage/<servicio>/` antes de la entrega, o exportar a PDF.
5. **Faltan por completo:** diagrama de arquitectura como imagen, colección Postman, PDF de persistencia, PDF de informe de pruebas, `repositorios.txt`, README por microservicio. El `README.md` de frontend es el boilerplate de Vite sin contenido real.
6. **Descripción de estrategia de ramas inexacta** si se entrega como "GitHub Flow" — el flujo real es de 3 niveles (`feature → develop → qa → main`).

---

## 3) CHECKLIST DE COMANDOS EXACTOS

### Correr tests y generar cobertura backend (JaCoCo), por servicio
```bash
cd api-gateway && mvn test jacoco:report
cd servicio-pacientes && mvn test jacoco:report
cd servicio-lista-espera && mvn test jacoco:report
cd servicio-reasignacion && mvn test jacoco:report
cd servicio-notificaciones && mvn test jacoco:report
```
Reporte HTML por servicio: `<servicio>/target/site/jacoco/index.html`

### Cobertura global ponderada (los 5 servicios)
```powershell
powershell -ExecutionPolicy Bypass -File cobertura-global.ps1 -RunTests
```

### Frontend — testing (a implementar, ver Bloqueador 1)
```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm run test            # una vez agregado el script "test": "vitest run"
npm run test:coverage   # una vez agregado el script "test:coverage": "vitest run --coverage"
```

### Levantar el proyecto completo para la demo
```bash
docker compose -f docker-compose.full.yml up -d   # 4 PostgreSQL + RabbitMQ + (según compose) servicios contenerizados
# o, en modo desarrollo local sin Docker para los servicios Java:
cd api-gateway && mvn spring-boot:run              # puerto 8080
cd servicio-pacientes && mvn spring-boot:run       # puerto 8081
cd servicio-lista-espera && mvn spring-boot:run    # puerto 8082
cd servicio-reasignacion && mvn spring-boot:run    # puerto 8083
cd servicio-notificaciones && mvn spring-boot:run  # puerto 8084
cd frontend && npm run dev                         # Vite dev server
```
Swagger UI por servicio: `http://localhost:<puerto>/swagger-ui.html`
