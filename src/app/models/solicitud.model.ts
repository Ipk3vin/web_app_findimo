export interface SolicitudAlquilerRequest {
  idPerfilEstudiante: number;
  idPropiedad: number;
}

export interface SolicitudAlquilerResponse {
  idSolicitudAlquiler: number;
  idPerfilEstudiante: number;
  idPropiedad: number;
  estado: boolean;
  fechaCreacion?: string;
}
