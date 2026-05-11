const reEmail    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const reRut      = /^\d{7,8}-[\dkK]$/;
const reTelefono = /^\+?[\d\s-]{8,15}$/;

const errorRut = (rut) => {
  if (!rut)              return "Ingresa el RUT.";
  if (!reRut.test(rut))  return "Formato requerido: 12345678-9.";
  return null;
};

const errorFechaNacimiento = (fecha) => {
  if (!fecha) return "Ingresa la fecha de nacimiento.";
  const hoy  = new Date();
  const nac  = new Date(fecha);
  const edad = hoy.getFullYear() - nac.getFullYear();
  if (nac > hoy)    return "La fecha no puede ser futura.";
  if (edad > 120)   return "Fecha no válida.";
  return null;
};

const errorEmail = (email) => {
  if (!email)                return "Ingresa el email.";
  if (!reEmail.test(email))  return "Email inválido.";
  return null;
};

const errorTelefono = (tel) => {
  if (!tel)                  return "Ingresa el teléfono.";
  if (!reTelefono.test(tel)) return "Teléfono inválido.";
  return null;
};

const errorTexto = (valor, campo, min = 2) => {
  if (!valor)            return `Ingresa ${campo}.`;
  if (valor.length < min) return `Mínimo ${min} caracteres.`;
  return null;
};

const set = (errores, campo, mensaje) => {
  if (mensaje) errores[campo] = mensaje;
};

export const validarPacienteForm = (f) => {
  const errores = {};

  set(errores, "rut",             errorRut(f.rut.trim()));
  set(errores, "nombres",         errorTexto(f.nombres.trim(), "el/los nombres."));
  set(errores, "apellidoPaterno", errorTexto(f.apellidoPaterno.trim(), "el apellido paterno."));
  set(errores, "fechaNacimiento", errorFechaNacimiento(f.fechaNacimiento));
  set(errores, "sexo",      f.sexo      ? null : "Selecciona el sexo.");
  set(errores, "prevision", f.prevision ? null : "Selecciona la previsión.");
  set(errores, "email",    errorEmail(f.email.trim()));
  set(errores, "telefono", errorTelefono(f.telefono.trim()));
  set(errores, "direccion", errorTexto(f.direccion.trim(), "la dirección.", 5));

  return errores;
};

export const validarSolicitudForm = (f) => {
  const errores = {};
  const pacienteId = Number(f.pacienteId);

  set(errores, "pacienteId",
    !f.pacienteId || !Number.isInteger(pacienteId) || pacienteId <= 0
      ? "Busca y selecciona un paciente."
      : null
  );
  set(errores, "especialidad", errorTexto(f.especialidad.trim(), "la especialidad.", 3));

  return errores;
};