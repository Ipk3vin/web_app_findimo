import { ORIGEN_API } from './origen-api';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudAlquilerRequest, SolicitudAlquilerResponse } from '../models/solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private http = inject(HttpClient);
  private apiUrl = `${ORIGEN_API}/api/solicitudes-alquiler`;

  registrarSolicitud(request: SolicitudAlquilerRequest): Observable<SolicitudAlquilerResponse> {
    return this.http.post<SolicitudAlquilerResponse>(this.apiUrl, request, { withCredentials: true });
  }
}
