export interface Propiedad {
  idPropiedad: number;
  idPerfilArrendador?: number;
  titulo: string;
  descripcion: string;
  precio: number;
  precioNoche?: number;
  habitaciones: number;
  banos?: number;
  area?: number;
  direccion: string;
  distrito: string;
  estado: boolean;
  imagen?: string;
  imagenesGaleria?: string[];
  tipoEspacio?: 'Departamentos' | 'Casas' | 'Estudios' | 'Habitaciones';
  calificacion?: number;
  totalResenas?: number;
  esFavorito?: boolean;
  arrendadorNombre?: string;
  arrendadorAntiguedad?: string;
  arrendadorInicial?: string;
  subtituloDetalle?: string;
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
