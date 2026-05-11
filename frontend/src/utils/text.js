export const normalizar = (valor) =>
  String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Construye nombre completo desde un paciente. Compatible con registros viejos que tengan `nombre`. */
export const nombreCompleto = (paciente) => {
  if (!paciente) return "";
  const partes = [paciente.nombres, paciente.apellidoPaterno, paciente.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
  return partes || paciente.nombre || "";
};

/** Iniciales para avatar (máx. 2 caracteres). */
export const inicialesPaciente = (paciente) => {
  if (!paciente) return "?";
  const n = paciente.nombres || paciente.nombre || "";
  const a = paciente.apellidoPaterno || "";
  return `${n[0] || ""}${a[0] || ""}`.toUpperCase() || "?";
};