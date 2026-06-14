const DIAS_SEMANA = ["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"];

export function generarDias(n = 7, desde = new Date()) {
  const base = new Date(desde);
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return {
      value: d.toISOString().slice(0, 10),
      dow:   DIAS_SEMANA[d.getDay()],
      num:   d.getDate(),
    };
  });
}

export const hoy = () => new Date().toISOString().slice(0, 10);

export const fechaDesdeSolicitud = (solicitud) =>
  solicitud.fechaRegistro ? solicitud.fechaRegistro.slice(0, 10) : new Date().toISOString().slice(0, 10);

export const formatearFecha = (valor) => {
  if (!valor) return "Sin fecha";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;

  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(fecha);
};
