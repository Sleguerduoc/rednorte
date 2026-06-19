-- ============================================================
-- SEED RedNorte para Railway (una base, 4 esquemas)
-- Diferencia vs seed local: cada bloque hace SET search_path
-- al esquema correcto antes de insertar.
-- ============================================================

-- ===== BLOQUE 1: esquema pacientes =====
SET search_path TO pacientes;

INSERT INTO pacientes (id, nombres, apellido_paterno, apellido_materno, rut, email, telefono, prevision, estado) VALUES
  (1,  'María José', 'González',  'Fuentes',   '12345678-9',   'mj.gonzalez@rednorte.cl',   '+56 9 8765 4321', 'FONASA', 'ACTIVO'),
  (2,  'Carlos',     'Muñoz',     'Pérez',     '98765432-1',   'carlos.munoz@rednorte.cl',  '+56 9 1111 2222', 'ISAPRE', 'ACTIVO'),
  (13, 'Ana',        'Fuentes',   'Rojas',     '12.345.678-9', 'ana.fuentes@example.cl',    '+56 9 1111 1111', 'FONASA', 'ACTIVO'),
  (14, 'Beto',       'Salinas',   'Vera',      '13.456.789-0', 'beto.salinas@example.cl',   '+56 9 2222 2222', 'FONASA', 'ACTIVO'),
  (15, 'Carla',      'Núñez',     'Pizarro',   '14.567.890-1', 'carla.nunez@example.cl',    '+56 9 3333 3333', 'ISAPRE', 'ACTIVO'),
  (16, 'Diego',      'Rojas',     'Soto',      '15.678.901-2', 'diego.rojas@example.cl',    '+56 9 4444 4444', 'FONASA', 'ACTIVO'),
  (17, 'Elena',      'Paredes',   'Lagos',     '16.789.012-3', 'elena.paredes@example.cl',  '+56 9 5555 5555', 'FONASA', 'ACTIVO'),
  (18, 'Felipe',     'Cortés',    'Bravo',     '17.890.123-4', 'felipe.cortes@example.cl',  '+56 9 6666 6666', 'ISAPRE', 'ACTIVO'),
  (19, 'Gabriela',   'Muñoz',     'Tapia',     '18.901.234-5', 'gabriela.munoz@example.cl', '+56 9 7777 7777', 'FONASA', 'ACTIVO'),
  (20, 'Hugo',       'Araya',     'Donoso',    '19.012.345-6', 'hugo.araya@example.cl',     '+56 9 8888 8888', 'FONASA', 'ACTIVO'),
  (21, 'Isidora',    'Vega',      'Carrasco',  '20.123.456-7', 'isidora.vega@example.cl',   '+56 9 9999 9999', 'ISAPRE', 'ACTIVO'),
  (22, 'Joaquín',    'Fuentealba','Reyes',     '21.234.567-8', 'joaquin.f@example.cl',      '+56 9 1010 1010', 'FONASA', 'ACTIVO'),
  (23, 'Karina',     'Sandoval',  'Morales',   '9.876.543-2',  'karina.sandoval@example.cl','+56 9 1212 1212', 'FONASA', 'ACTIVO'),
  (24, 'Lucas',      'Espinoza',  'Gallardo',  '8.765.432-1',  'lucas.espinoza@example.cl', '+56 9 1313 1313', 'ISAPRE', 'ACTIVO');
SELECT setval(pg_get_serial_sequence('pacientes.pacientes','id'), 24, true);

-- ===== BLOQUE 2: esquema lista (solicitudes + citas) =====
SET search_path TO lista;

INSERT INTO solicitudes_lista_espera (id, paciente_id, especialidad, prioridad, estado, fecha_registro) VALUES
  (1,  13, 'Cardiología', 'NORMAL',  'AGENDADA',  CURRENT_DATE - INTERVAL '40 days'),
  (2,  14, 'Cardiología', 'NORMAL',  'AGENDADA',  CURRENT_DATE - INTERVAL '38 days'),
  (3,  15, 'Cardiología', 'ALTA',    'AGENDADA',  CURRENT_DATE - INTERVAL '35 days'),
  (4,  16, 'Cardiología', 'NORMAL',  'AGENDADA',  CURRENT_DATE - INTERVAL '30 days'),
  (5,  17, 'Cardiología', 'NORMAL',  'AGENDADA',  CURRENT_DATE - INTERVAL '28 days'),
  (6,  18, 'Cardiología', 'CRITICA', 'AGENDADA',  CURRENT_DATE - INTERVAL '10 days'),
  (7,  19, 'Pediatría',   'NORMAL',  'AGENDADA',  CURRENT_DATE - INTERVAL '20 days'),
  (8,  20, 'Pediatría',   'NORMAL',  'PENDIENTE', CURRENT_DATE - INTERVAL '60 days'),
  (9,  21, 'Pediatría',   'CRITICA', 'PENDIENTE', CURRENT_DATE - INTERVAL '3 days'),
  (10, 22, 'Pediatría',   'ALTA',    'PENDIENTE', CURRENT_DATE - INTERVAL '15 days'),
  (11, 23, 'Neurología',  'ALTA',    'PENDIENTE', CURRENT_DATE - INTERVAL '12 days'),
  (12, 24, 'Traumatología','NORMAL', 'PENDIENTE', CURRENT_DATE - INTERVAL '8 days'),
  (13, 15, 'Dermatología','NORMAL',  'PENDIENTE', CURRENT_DATE - INTERVAL '5 days'),
  (14, 20, 'Cardiología', 'NORMAL',  'PENDIENTE', CURRENT_DATE - INTERVAL '2 days');
SELECT setval(pg_get_serial_sequence('solicitudes_lista_espera','id'), 14, true);

INSERT INTO citas (id, solicitud_id, paciente_id, especialidad, fecha, hora, estado, hora_check_in) VALUES
  (1, 1, 13, 'Cardiología', CURRENT_DATE, '09:00', 'ATENDIDA',  CURRENT_DATE + TIME '08:50'),
  (2, 2, 14, 'Cardiología', CURRENT_DATE, '10:00', 'EN_SALA',   CURRENT_DATE + TIME '09:48'),
  (3, 3, 15, 'Cardiología', CURRENT_DATE, '11:00', 'EN_SALA',   CURRENT_DATE + TIME '10:30'),
  (4, 4, 16, 'Cardiología', CURRENT_DATE, '12:00', 'PROGRAMADA', NULL),
  (5, 5, 17, 'Cardiología', CURRENT_DATE, '13:00', 'PROGRAMADA', NULL),
  (6, 6, 18, 'Cardiología', CURRENT_DATE + INTERVAL '6 days', '11:00', 'PROGRAMADA', NULL),
  (7, 7, 19, 'Pediatría',   CURRENT_DATE + INTERVAL '4 days', '10:00', 'PROGRAMADA', NULL);
SELECT setval(pg_get_serial_sequence('citas','id'), 7, true);
