export interface OpcionPropiedad {
  id: number;
  nombre: string;
}

export interface CatalogosPropiedad {
  tipos: OpcionPropiedad[];
  servicios: OpcionPropiedad[];
}

export const TIPOS_ENTORNO = {
  UNIVERSIDAD: { etiqueta: 'Universidad cercana', color: 'blue' },
  MERCADO: { etiqueta: 'Mercado', color: 'green' },
  BODEGA: { etiqueta: 'Bodega', color: 'amber' },
  PARQUE: { etiqueta: 'Parque', color: 'emerald' },
  SEGURIDAD: { etiqueta: 'Caseta de seguridad', color: 'purple' },
  TRANSPORTE: { etiqueta: 'Transporte público', color: 'sky' }
} as const;

export type TipoEntorno = keyof typeof TIPOS_ENTORNO;

export interface LugarCercano {
  tipo: TipoEntorno;
  nombre?: string | null;
  minutos: number;
}

export interface Propiedad {
  idPropiedad: number;
  idPerfilArrendador?: number;
  titulo: string;
  descripcion: string;
  precio: number;
  precioNoche?: number;
  habitaciones: number;
  banos?: number;
  area?: number | null;
  direccion: string;
  distrito: string;
  estado: boolean;
  reservada?: boolean;
  entorno?: LugarCercano[];
  imagenesGaleria?: string[];
  fotosGuardadas?: { ruta: string; url: string }[];
  idTipoPropiedad?: number | null;
  idsServicios?: number[];
  calificacion?: number;
  totalResenas?: number;
  esFavorito?: boolean;
  arrendadorNombre?: string;
  arrendadorAntiguedad?: string;
  arrendadorInicial?: string;
  subtituloDetalle?: string;
  universidad?: string;
}

export interface PropiedadRequest {
  idTipoPropiedad?: number | null;
  idsServicios?: number[];
  idPerfilArrendador: number;
  titulo: string;
  descripcion: string;
  precio: number;
  habitaciones: number;
  area?: number | null;
  direccion: string;
  distrito: string;
  estado: boolean;
  entorno?: LugarCercano[];
  fotosRetiradas?: string[];
}
