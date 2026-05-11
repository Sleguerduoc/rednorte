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
  "Cardiologia",
  "Dermatologia",
  "Ginecologia",
  "Medicina interna",
  "Neurologia",
  "Oftalmologia",
  "Pediatria",
  "Traumatologia",
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