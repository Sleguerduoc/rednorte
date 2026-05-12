-- Paciente demo para cliente1 (RUT: 12345678-9)
INSERT INTO pacientes (rut, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, prevision, email, telefono, direccion, estado)
SELECT '12345678-9', 'María José', 'González', 'Fuentes', '1985-03-15', 'FEMENINO', 'FONASA', 'mj.gonzalez@rednorte.cl', '+56 9 8765 4321', 'Av. Los Leones 1234, Providencia', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM pacientes WHERE rut = '12345678-9');

-- Paciente demo para cliente2 (RUT: 98765432-1)
INSERT INTO pacientes (rut, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, prevision, email, telefono, direccion, estado)
SELECT '98765432-1', 'Carlos', 'Muñoz', 'Pérez', '1990-07-22', 'MASCULINO', 'ISAPRE', 'carlos.munoz@rednorte.cl', '+56 9 1111 2222', 'Los Prados 567, Las Condes', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM pacientes WHERE rut = '98765432-1');
