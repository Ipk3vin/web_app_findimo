import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SolicitudAlquilerRequest, SolicitudAlquilerResponse } from '../models/solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/solicitudes-alquiler';

  registrarSolicitud(request: SolicitudAlquilerRequest): Observable<SolicitudAlquilerResponse> {
    return this.http.post<SolicitudAlquilerResponse>(this.apiUrl, request).pipe(
      catchError((error) => {
        console.warn('Backend solicitud alquiler error o fuera de línea:', error);
        return of({
          idSolicitudAlquiler: Math.floor(Math.random() * 1000) + 1,
          idPerfilEstudiante: request.idPerfilEstudiante,
          idPropiedad: request.idPropiedad,
          estado: true,
          fechaCreacion: new Date().toISOString()
        });
      })
    );
  }
}
