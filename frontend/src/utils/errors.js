export const obtenerMensajeError = (error, mensajeFallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  mensajeFallback;
