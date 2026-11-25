export interface Resena {
  idResena?: number;
  idUsuarioAutor?: number;
  nombreAutor: string;
  apellidoAutor?: string;
  idPropiedad?: number;
  tituloPropiedad?: string;
  nombreObjetivo?: string;
  idUsuarioObjetivo?: number;
  calificacion: number;
  comentario: string;
  fechaCreacion?: string;
  estado?: boolean;
}

export interface ResenasPerfil {
  recibidas: Resena[];
  escritas: Resena[];
}
