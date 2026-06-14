# ESTADO ACTUAL DEL PROYECTO — RedNorte

> Generado: 2026-06-13  
> Rama analizada: `develop`

---

## 1. OBJETIVO Y ALCANCE

**RedNorte** es un sistema de gestión de listas de espera hospitalarias. Permite que:

- Los **pacientes (clientes)** consulten sus citas y solicitudes pendientes.
- Los **doctores** visualicen la lista de espera y gestionen citas.
- Los **administradores** gestionen el ciclo completo: registro de pacientes, solicitudes de cita, cancelaciones, reasignaciones automáticas y notificaciones.

El flujo central es:

1. Se registra un paciente.
2. Se crea una solicitud en la lista de espera (especialidad + prioridad).
3. Si se cancela una cita, el sistema reasigna automáticamente y notifica al paciente por SMS o email.

---

## 2. ARQUITECTURA ACTUAL

### 2.1 Árbol de carpetas principal

```
rednorte/
├── api-gateway/                  ← Punto de entrada único (puerto 8080)
├── servicio-pacientes/           ← CRUD de pacientes (puerto 8081)
├── servicio-lista-espera/        ← Gestión de solicitudes (puerto 8082)
├── servicio-reasignacion/        ← Reasignación automática (puerto 8083)
├── servicio-notificaciones/      ← Envío de notificaciones (puerto 8084)
├── frontend/                     ← SPA React + Vite
├── scripts/                      ← Script de arranque (start-rednorte.bat)
├── docker-compose.yml            ← Infraestructura (PostgreSQL x4 + RabbitMQ)
└── ESTADO_ACTUAL.md              ← Este documento
```

Cada servicio Spring Boot tiene su propia estructura interna:

```
servicio-*/
└── src/main/java/cl/rednorte/<nombre>/
    ├── controller/       ← Capa REST
    ├── service/          ← Lógica de negocio
    ├── model/            ← Entidades JPA
    ├── repository/       ← Acceso a datos (Spring Data JPA)
    ├── config/           ← RabbitMQ, OpenAPI, Seguridad
    ├── event/            ← Clases de eventos para mensajería
    └── listener/         ← Consumidores de colas RabbitMQ (donde aplica)
```

### 2.2 Componentes y relaciones

```
┌─────────────┐
│  Frontend   │  React + Vite (Vite dev server / build estático)
│  :3000      │
└──────┬──────┘
       │ HTTP + JWT
       ▼
┌─────────────────────────────────────────┐
│              API Gateway                │  Spring Cloud Gateway (WebFlux)
│  :8080                                  │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │ /auth/*  │  │  BFF /bff/*          │ │
│  │ JWT login│  │  Agrega datos de     │ │
│  └──────────┘  │  múltiples servicios │ │
│                └──────────────────────┘ │
└──────┬──────────────────────────────────┘
       │ Proxy HTTP / WebClient
       ├──────────────────────────────────────────┐
       │                          │               │
       ▼                          ▼               ▼
┌────────────┐           ┌──────────────┐  ┌──────────────┐
│ Pacientes  │           │ Lista Espera │  │ Notificaciones│
│   :8081    │           │    :8082     │  │    :8084      │
│ PostgreSQL │           │ PostgreSQL + │  │ PostgreSQL +  │
│ (5433)     │           │  RabbitMQ ──┼──┤► RabbitMQ    │
└────────────┘           └──────┬───────┘  └──────────────┘
                                │ cola: cita.cancelada
                                ▼
                        ┌──────────────┐
                        │ Reasignacion │
                        │    :8083     │
                        │ PostgreSQL + │
                        │ RabbitMQ ───►│ cola: notificacion.solicitada
                        └──────────────┘
```

### 2.3 Flujo de datos de principio a fin

**Carga inicial (admin/doctor):**
```
Frontend → GET /bff/dashboard          → Gateway agrega totales de todos los servicios
Frontend → GET /bff/lista-espera/completa → Gateway enriquece solicitudes con datos de paciente
Frontend → GET /pacientes, /reasignaciones, /notificaciones (directo vía proxy)
```

**Cancelación de cita (evento asíncrono):**
```
Frontend
  → POST /listas-espera/cancelar-cita
  → SolicitudService actualiza estado a "CANCELADA"
  → Publica CitaCanceladaEvent → cola RabbitMQ "cita.cancelada"
  → CitaCanceladaListener (reasignacion) recibe evento
  → ReasignacionService crea registro y publica NotificacionSolicitadaEvent
  → NotificacionListener (notificaciones) recibe evento
  → NotificacionFactory selecciona canal (SMS | EMAIL)
  → Persiste historial en BD
```

---

## 3. STACK Y DEPENDENCIAS

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje principal |
| Spring Boot | 4.0.6 | Framework base de todos los servicios |
| Spring Cloud | 2025.1.1 | Solo en api-gateway (Gateway + WebFlux) |
| Spring Data JPA / Hibernate | (incluido en Boot) | Persistencia ORM |
| PostgreSQL JDBC | (incluido en Boot) | Driver de BD |
| Spring AMQP (RabbitMQ) | (incluido en Boot) | Mensajería entre servicios |
| JJWT | 0.12.6 | Generación y validación de tokens JWT |
| SpringDoc OpenAPI | 2.8.8 | Documentación Swagger automática |
| Lombok | (incluido en Boot) | Reducción de boilerplate (getters, constructors) |

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2.5 | Framework UI |
| Vite | 8.0.10 | Build tool y dev server |
| React Router DOM | 7.15.0 | Enrutamiento SPA con roles |
| Axios | 1.16.0 | Cliente HTTP |
| ESLint | 10.2.1 | Linting de código |

### Infraestructura (Docker Compose)

| Servicio | Imagen | Puerto |
|---|---|---|
| postgres-pacientes | postgres:16 | 5433 |
| postgres-lista | postgres:16 | 5434 |
| postgres-reasignacion | postgres:16 | 5435 |
| postgres-notificaciones | postgres:16 | 5436 |
| RabbitMQ | rabbitmq:3-management | 5672 / 15672 |

---

## 4. ESTADO DEL DESARROLLO

### Terminado y funcionando

- **Infraestructura base**: Docker Compose levanta 4 instancias PostgreSQL + RabbitMQ correctamente.
- **API Gateway**: enrutamiento, filtro JWT, endpoints BFF (`/bff/dashboard`, `/bff/lista-espera/completa`).
- **Autenticación**: login con usuario/contraseña, generación de JWT con rol y datos del usuario, validación en cada request.
- **Servicio Pacientes**: CRUD completo (crear, listar, buscar por ID, eliminar).
- **Servicio Lista de Espera**: crear solicitud, listar, cancelar cita con publicación de evento.
- **Servicio Reasignación**: listener de cancelaciones, creación de registro de reasignación, publicación de evento de notificación.
- **Servicio Notificaciones**: listener, patrón Factory para canal SMS/Email, persistencia de historial.
- **Frontend**: login, dashboard, gestión de pacientes, lista de espera, citas, notificaciones, reasignaciones, vistas por rol (ADMIN / DOCTOR / CLIENTE).
- **Swagger/OpenAPI**: documentación disponible en todos los servicios (`/swagger-ui.html`).
- **Script de arranque**: `scripts/start-rednorte.bat` orquesta el arranque completo.

### En progreso / incompleto

- **Envío real de notificaciones**: las clases `EmailNotificacion` y `SmsNotificacion` implementan la interfaz `CanalNotificacion` pero el envío efectivo (SMTP, proveedor SMS) es simulado o no está integrado (POR CONFIRMAR revisando el código de esas clases).
- **Actualización de lista de espera**: no existe endpoint `PUT` o `PATCH` para actualizar especialidad, prioridad o estado de una solicitud — solo crear y cancelar.
- **Eliminación de solicitudes**: no hay endpoint de eliminación en `servicio-lista-espera`.
- **Vista CLIENTE**: `MisCitasPage.jsx` existe pero el filtrado de solicitudes por paciente logueado depende de que el `pacienteRut` esté en el JWT y de la lógica del hook (POR CONFIRMAR si filtra correctamente en el backend o solo en el frontend).

### Falta o está planeado

- **Tests**: no se encontraron archivos de test (`*Test.java`, `*.test.jsx`) en ningún servicio ni en el frontend (POR CONFIRMAR).
- **Service discovery / Eureka**: las URLs entre servicios son hardcoded a `localhost`. No hay Eureka, Consul ni variable de entorno para producción.
- **CI/CD**: no hay pipeline de integración continua (GitHub Actions, Jenkins, etc.).
- **Contenerización de servicios**: el `docker-compose.yml` solo incluye bases de datos y RabbitMQ; los servicios Spring Boot y el frontend se ejecutan directamente en la máquina del desarrollador.
- **Manejo de errores global**: no se identificó un `@ControllerAdvice` centralizado (POR CONFIRMAR si existe en algún servicio).
- **Paginación**: los endpoints `GET /pacientes`, `GET /listas-espera` devuelven listas completas sin paginación.

---

## 5. PROBLEMAS CONOCIDOS / DEUDA TÉCNICA

| # | Problema | Impacto | Notas |
|---|---|---|---|
| 1 | **JWT secret en hardcode** | Alto | El secreto base64 está en `application.properties` del gateway; debería venir de variable de entorno o gestor de secretos. |
| 2 | **Contraseña por defecto en claro** | Alto | `app.cliente.password=rednorte2026` en properties; no hay hash ni gestión de usuarios en BD. |
| 3 | **URLs de microservicios hardcoded** | Medio | `BffService` y clientes usan `http://localhost:808X`; rompe en cualquier despliegue que no sea localhost. |
| 4 | **Sin tests automatizados** | Medio | No hay cobertura de pruebas unitarias ni de integración (POR CONFIRMAR). |
| 5 | **DDL auto=update en producción** | Medio | `spring.jpa.hibernate.ddl-auto=update` puede alterar el esquema involuntariamente en entornos no-dev. |
| 6 | **BD por defecto sin credenciales seguras** | Bajo-Medio | Todos los servicios usan `postgres/postgres`; sin cambio en variables de entorno, esto pasa a producción. |
| 7 | **Sin paginación** | Bajo | Listas completas; con muchos registros puede causar problemas de memoria y timeouts. |
| 8 | **Envío de notificaciones simulado** | Bajo | La integración real con SMTP/SMS no está confirmada. |

---

## 6. RESTRICCIONES DE DISEÑO

Las siguientes decisiones son **intencionales** y no deben cambiarse sin evaluación:

1. **Gateway como único punto de entrada**: todo el CORS está configurado en el gateway; los servicios backend no tienen configuración CORS propia.
2. **Una base de datos por servicio**: cada microservicio tiene su propia instancia PostgreSQL aislada; no hay BD compartida entre servicios.
3. **Comunicación asíncrona solo para eventos de negocio**: la comunicación síncrona HTTP se usa para queries, y RabbitMQ solo para flujos de cancelación → reasignación → notificación.
4. **BFF en el gateway**: la agregación de datos para el frontend ocurre en el gateway (BFF pattern), no en el cliente ni en un servicio adicional.
5. **JWT con claims de rol y RUT**: el token incluye `rol`, `nombre` y `pacienteRut`, lo que permite al frontend renderizar vistas por rol sin llamadas adicionales al backend.
6. **Rutas separadas por rol**: el router del frontend define rutas distintas para ADMIN, DOCTOR y CLIENTE; el acceso a rutas no autorizadas redirige al inicio correspondiente al rol.
7. **Sin base de datos de usuarios**: los usuarios están definidos en código dentro de `UserService.java`; no hay tabla de usuarios en PostgreSQL.

---

## ARCHIVOS CLAVE

| Archivo | Descripción |
|---|---|
| [docker-compose.yml](docker-compose.yml) | Define toda la infraestructura de desarrollo (4 PostgreSQL + RabbitMQ). Punto de partida para levantar el entorno. |
| [api-gateway/src/main/java/cl/rednorte/gateway/auth/UserService.java](api-gateway/src/main/java/cl/rednorte/gateway/auth/UserService.java) | Define los usuarios del sistema (hardcoded). Aquí se validan credenciales y se asignan roles. |
| [api-gateway/src/main/java/cl/rednorte/gateway/bff/service/BffService.java](api-gateway/src/main/java/cl/rednorte/gateway/bff/service/BffService.java) | Agrega datos de múltiples servicios para el frontend. Punto crítico de rendimiento. |
| [api-gateway/src/main/java/cl/rednorte/gateway/auth/JwtAuthFilter.java](api-gateway/src/main/java/cl/rednorte/gateway/auth/JwtAuthFilter.java) | Intercepta todas las peticiones y valida el JWT antes de enrutarlas. |
| [servicio-lista-espera/src/main/java/cl/rednorte/listaespera/service/SolicitudService.java](servicio-lista-espera/src/main/java/cl/rednorte/listaespera/service/SolicitudService.java) | Lógica central del negocio: crea solicitudes y publica eventos de cancelación a RabbitMQ. |
| [servicio-notificaciones/src/main/java/cl/rednorte/notificaciones/factory/NotificacionFactory.java](servicio-notificaciones/src/main/java/cl/rednorte/notificaciones/factory/NotificacionFactory.java) | Patrón Factory que selecciona el canal de notificación (SMS o Email) según el evento recibido. |
| [frontend/src/hooks/useRedNorteData.js](frontend/src/hooks/useRedNorteData.js) | Hook principal del frontend; centraliza todo el estado de la aplicación y las llamadas a la API. |
| [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx) | Gestiona la sesión del usuario (JWT en localStorage, datos del perfil, login/logout). |
| [scripts/start-rednorte.bat](scripts/start-rednorte.bat) | Script de arranque completo del sistema en entorno local (Docker + 5 servicios + frontend). |
