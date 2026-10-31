export interface Propiedad {
  idPropiedad: number;
  idPerfilArrendador?: number;
  titulo: string;
  descripcion: string;
  precio: number;
  habitaciones: number;
  banos?: number;
  area?: number;
  direccion: string;
  distrito: string;
  estado: boolean;
  imagen?: string;
  tipoEspacio?: 'Departamentos' | 'Casas' | 'Estudios' | 'Habitaciones';
  esFavorito?: boolean;
}

export interface PropiedadRequest {
  idPerfilArrendador: number;
  titulo: string;
  descripcion: string;
  precio: number;
  habitaciones: number;
  direccion: string;
  distrito: string;
  estado: boolean;
}
