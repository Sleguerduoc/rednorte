export const fechaDesdeSolicitud = (solicitud) =>
  solicitud.fechaRegistro ? solicitud.fechaRegistro.slice(0, 10) : new Date().toISOString().slice(0, 10);

export const formatearFecha = (valor) => {
  if (!valor) return "Sin fecha";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;

  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(fecha);
};
