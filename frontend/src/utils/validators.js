const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validarRut = (rut) => /^[0-9]{7,8}-[0-9kK]$/.test(rut.trim());
const validarTelefono = (telefono) => /^\+?[0-9\s-]{8,15}$/.test(telefono.trim());

export const validarPacienteForm = (pacienteForm) => {
  const errores = {};
  const rut = pacienteForm.rut.trim();
  const nombre = pacienteForm.nombre.trim();
  const email = pacienteForm.email.trim();
  const telefono = pacienteForm.telefono.trim();
  const direccion = pacienteForm.direccion.trim();

  if (!rut) errores.rut = "Ingresa el RUT.";
  else if (!validarRut(rut)) errores.rut = "Usa formato 12345678-9.";

  if (!nombre) errores.nombre = "Ingresa el nombre.";
  else if (nombre.length < 3) errores.nombre = "El nombre debe tener al menos 3 caracteres.";

  if (!email) errores.email = "Ingresa el email.";
  else if (!validarEmail(email)) errores.email = "Ingresa un email valido.";

  if (!telefono) errores.telefono = "Ingresa el telefono.";
  else if (!validarTelefono(telefono)) errores.telefono = "Ingresa un telefono valido.";

  if (!direccion) errores.direccion = "Ingresa la direccion.";
  else if (direccion.length < 5) errores.direccion = "La direccion debe ser mas descriptiva.";

  return errores;
};

export const validarSolicitudForm = (listaForm) => {
  const errores = {};
  const pacienteId = Number(listaForm.pacienteId);
  const especialidad = listaForm.especialidad.trim();

  if (!listaForm.pacienteId) errores.pacienteId = "Busca y selecciona un paciente.";
  else if (!Number.isInteger(pacienteId) || pacienteId <= 0) errores.pacienteId = "Paciente invalido.";

  if (!especialidad) errores.especialidad = "Selecciona o ingresa la especialidad.";
  else if (especialidad.length < 3) errores.especialidad = "La especialidad debe tener al menos 3 caracteres.";

  return errores;
};
