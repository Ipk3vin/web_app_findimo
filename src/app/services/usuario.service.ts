import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UsuarioRegistroRequest, UsuarioRegistroResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/usuarios';

  private currentUser: UsuarioRegistroResponse | null = null;

  getCurrentUser(): UsuarioRegistroResponse | null {
    if (!this.currentUser && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('findimo_user');
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return this.currentUser;
  }

  registrar(dto: UsuarioRegistroRequest): Observable<UsuarioRegistroResponse> {
    return this.http.post<UsuarioRegistroResponse>(`${this.apiUrl}/registro`, dto).pipe(
      tap((res) => {
        this.currentUser = res;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('findimo_user', JSON.stringify(res));
        }
      }),
      catchError((error) => {
        console.warn('Fallo registro en backend, usando fallback simulado:', error);
        const mockResponse: UsuarioRegistroResponse = {
          idUsuario: Math.floor(Math.random() * 1000) + 10,
          correoElectronico: dto.correoElectronico,
          nombre: dto.nombre,
          apellido: dto.apellido,
          telefono: dto.telefono,
          idRol: dto.nombreRol === 'ESTUDIANTE' ? 1 : 2,
          nombreRol: dto.nombreRol,
          nombreUniversidad: dto.nombreUniversidad,
          presupuestoMaximo: dto.presupuestoMaximo,
          cuentaBancaria: dto.cuentaBancaria,
          idPerfilEstudiante: dto.nombreRol === 'ESTUDIANTE' ? 1 : undefined,
          idPerfilArrendador: dto.nombreRol === 'ARRENDADOR' ? 1 : undefined
        };
        this.currentUser = mockResponse;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('findimo_user', JSON.stringify(mockResponse));
        }
        return of(mockResponse);
      })
    );
  }

  iniciarSesion(correo: string, contrasena: string, rol: 'ESTUDIANTE' | 'ARRENDADOR'): Observable<UsuarioRegistroResponse> {
    // Si es Sofía o Eduardo
    const isEduardo = correo.toLowerCase().includes('eduardo') || rol === 'ARRENDADOR';
    const response: UsuarioRegistroResponse = {
      idUsuario: isEduardo ? 1 : 2,
      correoElectronico: correo,
      nombre: isEduardo ? 'Eduardo' : 'Sofía',
      apellido: isEduardo ? 'Garza' : 'Martínez',
      telefono: isEduardo ? '987654321' : '912345678',
      idRol: isEduardo ? 2 : 1,
      nombreRol: rol,
      cuentaBancaria: isEduardo ? 'BCP-191-88492019-0-45' : undefined,
      nombreUniversidad: !isEduardo ? 'Universidad Peruana Cayetano Heredia' : undefined,
      presupuestoMaximo: !isEduardo ? 900 : undefined,
      idPerfilArrendador: isEduardo ? 1 : undefined,
      idPerfilEstudiante: !isEduardo ? 1 : undefined
    };
    this.currentUser = response;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('findimo_user', JSON.stringify(response));
    }
    return of(response);
  }

  cerrarSesion(): void {
    this.currentUser = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('findimo_user');
    }
  }
}
