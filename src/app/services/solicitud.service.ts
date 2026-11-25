import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudAlquilerRequest, SolicitudAlquilerResponse } from '../models/solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/solicitudes-alquiler';

  registrarSolicitud(request: SolicitudAlquilerRequest): Observable<SolicitudAlquilerResponse> {
    return this.http.post<SolicitudAlquilerResponse>(this.apiUrl, request, { withCredentials: true });
  }
}
