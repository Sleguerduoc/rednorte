export const estadoInicialPaciente = {
  rut:             "",
  nombres:         "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  fechaNacimiento: "",
  sexo:            "",
  prevision:       "",
  email:           "",
  telefono:        "",
  direccion:       "",
};

export const estadoInicialLista = {
  pacienteId:  "",
  especialidad: "",
  prioridad:   "NORMAL",
};

export const ESPECIALIDADES = [
  "Cardiología",
  "Dermatología",
  "Ginecología",
  "Medicina interna",
  "Neurología",
  "Oftalmología",
  "Pediatría",
  "Traumatología",
];

export const SEXOS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO",  label: "Femenino"  },
  { value: "OTRO",      label: "Otro"       },
];

export const PREVISIONES = [
  { value: "FONASA",  label: "FONASA"  },
  { value: "ISAPRE",  label: "ISAPRE"  },
  { value: "NINGUNA", label: "Sin previsión" },
];

export const ETIQUETAS_SOLICITUD = {
  PENDIENTE: "En espera",
  AGENDADA:  "Agendada",
  ATENDIDA:  "Atendida",
  CANCELADA: "Cancelada",
};

export const ETIQUETAS_CITA = {
  PROGRAMADA: "Programada",
  EN_SALA:    "En sala",
  ATENDIDA:   "Atendida",
  NO_SHOW:    "No asistió",
  CANCELADA:  "Cancelada",
  REASIGNADA: "Reasignada",
};

export const HORAS_CLINICA = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30",
];