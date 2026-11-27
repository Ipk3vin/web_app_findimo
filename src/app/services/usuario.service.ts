import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivarPerfilRequest, UsuarioRegistroRequest, UsuarioRegistroResponse } from '../models/usuario.model';

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
          this.currentUser = null;
        }
      }
    }
    return this.currentUser;
  }

  registrar(dto: UsuarioRegistroRequest): Observable<UsuarioRegistroResponse> {
    return this.http.post<UsuarioRegistroResponse>(`${this.apiUrl}/registro`, dto, { withCredentials: true }).pipe(
      tap(respuesta => this.guardarCuenta(respuesta))
    );
  }

  iniciarSesion(correo: string, contrasena: string): Observable<UsuarioRegistroResponse> {
    const payload = {
      correoElectronico: correo.trim(),
      contrasena: contrasena
    };

    return this.http.post<UsuarioRegistroResponse>(`${this.apiUrl}/login`, payload, { withCredentials: true }).pipe(
      tap(respuesta => this.guardarCuenta(respuesta))
    );
  }

  actualizarContrasena(contrasena: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/contrasena`, { contrasena }, { withCredentials: true });
  }

  activarPerfil(dto: ActivarPerfilRequest): Observable<UsuarioRegistroResponse> {
    return this.http.post<UsuarioRegistroResponse>(`${this.apiUrl}/perfiles`, dto, { withCredentials: true }).pipe(
      tap(respuesta => this.guardarCuenta(respuesta))
    );
  }

  private guardarCuenta(usuario: UsuarioRegistroResponse): void {
    this.currentUser = usuario;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('findimo_user', JSON.stringify(usuario));
    }
  }

  cerrarSesion(): void {
    this.currentUser = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('findimo_user');
    }
    this.http.post<void>(`${this.apiUrl}/logout`, null, { withCredentials: true }).subscribe({
      error: error => console.error('No se pudo cerrar la sesión en el servidor.', error)
    });
  }
}
