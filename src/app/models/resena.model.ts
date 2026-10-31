export interface Resena {
  idResena?: number;
  idUsuarioAutor?: number;
  nombreAutor: string;
  apellidoAutor?: string;
  rolAutor?: string;
  avatar?: string;
  idPropiedad?: number;
  idUsuarioObjetivo?: number;
  calificacion: number;
  comentario: string;
  destacado?: boolean;
  fechaCreacion?: string;
  estado?: boolean;
}
