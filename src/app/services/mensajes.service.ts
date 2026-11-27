import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA' | 'FINALIZADA';
export type SituacionSolicitud = 'PENDIENTE' | 'ACEPTADA' | 'CANCELADA';

export interface PerfilEstudianteChat {
  nombre: string;
  universidad?: string | null;
  resenas?: { id: number; calificacion: number; comentario: string | null; fecha: string | null }[];
}

export interface Conversacion {
  idSolicitud: number;
  idPropiedad: number;
  vivienda: string;
  distrito: string;
  contacto: string;
  situacion: SituacionSolicitud;
  arrendador: boolean;
  reserva?: EstadoReserva | null;
  reservaSolicitadaPorMi?: boolean;
  reservaFinalizadaEn?: string | null;
  resenaRegistrada?: boolean;
  resenaViviendaRegistrada?: boolean;
}

export interface Mensaje {
  idMensaje: number;
  propio: boolean;
  texto: string;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class MensajesService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/api/mensajes';

  listar(cuenta: number) {
    return this.http.get<Conversacion[]>(this.url, { withCredentials: true, params: { cuenta } });
  }

  perfilEstudiante(cuenta: number, solicitud: number) {
    return this.http.get<PerfilEstudianteChat>(`${this.url}/${solicitud}/estudiante`,
      { withCredentials: true, params: { cuenta } });
  }

  gestionarReserva(cuenta: number, solicitud: number, estado: EstadoReserva) {
    return this.http.put<Conversacion>(`${this.url}/${solicitud}/reserva`, { estado },
      { withCredentials: true, params: { cuenta } });
  }

  finalizarAlquiler(cuenta: number, solicitud: number, codigo: string) {
    return this.http.put<Conversacion>(`${this.url}/${solicitud}/finalizar-alquiler`, { codigo },
      { withCredentials: true, params: { cuenta } });
  }

  dejarResena(cuenta: number, solicitud: number, destino: 'estudiante' | 'arrendador' | 'vivienda', calificacion: number, comentario: string) {
    return this.http.post<Conversacion>(`${this.url}/${solicitud}/resena-${destino}`, { calificacion, comentario },
      { withCredentials: true, params: { cuenta } });
  }

  leer(cuenta: number, solicitud: number) {
    return this.http.get<Mensaje[]>(`${this.url}/${solicitud}`, { withCredentials: true, params: { cuenta } });
  }

  enviar(cuenta: number, solicitud: number, texto: string) {
    return this.http.post<Mensaje>(`${this.url}/${solicitud}`, { texto }, { withCredentials: true, params: { cuenta } });
  }
}
