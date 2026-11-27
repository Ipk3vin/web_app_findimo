import { ORIGEN_API } from './origen-api';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resena, ResenasPerfil } from '../models/resena.model';

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${ORIGEN_API}/api/resenas`;

  obtenerResenasDePerfil(idUsuario: number): Observable<ResenasPerfil> {
    return this.http.get<ResenasPerfil>(`${this.apiUrl}/perfil`, { withCredentials: true, params: { cuenta: idUsuario } });
  }

  obtenerResenasDelArrendador(idPropiedad: number): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.apiUrl}/propiedad/${idPropiedad}/arrendador`);
  }

  obtenerResenasPorPropiedad(idPropiedad: number): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.apiUrl}/propiedad/${idPropiedad}`);
  }
}
