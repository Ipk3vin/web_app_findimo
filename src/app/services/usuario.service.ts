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

  private registeredUsers: Array<{
    correo: string;
    contrasena: string;
    user: UsuarioRegistroResponse;
  }> = [
    {
      correo: 'kevin.palomino@upc.edu.pe',
      contrasena: '123456',
      user: {
        idUsuario: 3,
        correoElectronico: 'p***5@gmail.com',
        nombre: 'Kevin Arturo',
        apellido: 'Palomino Ilacupe',
        telefono: '+51 987 654 390',
        idRol: 1,
        nombreRol: 'ESTUDIANTE',
        nombreUniversidad: 'Universidad Peruana de Ciencias Aplicadas (UPC)',
        presupuestoMaximo: 950,
        idPerfilEstudiante: 1
      }
    },
    {
      correo: 'sofia.martinez@upch.pe',
      contrasena: '123456',
      user: {
        idUsuario: 2,
        correoElectronico: 'sofia.martinez@upch.pe',
        nombre: 'Sofía',
        apellido: 'Martínez',
        telefono: '912345678',
        idRol: 1,
        nombreRol: 'ESTUDIANTE',
        nombreUniversidad: 'Universidad Peruana de Ciencias Aplicadas (UPC)',
        presupuestoMaximo: 850,
        idPerfilEstudiante: 2
      }
    },
    {
      correo: 'eduardo.garza@findimo.pe',
      contrasena: '123456',
      user: {
        idUsuario: 1,
        correoElectronico: 'eduardo.garza@findimo.pe',
        nombre: 'Eduardo',
        apellido: 'Garza',
        telefono: '987654321',
        idRol: 2,
        nombreRol: 'ARRENDADOR',
        cuentaBancaria: 'BCP-191-88492019-0-45',
        idPerfilArrendador: 1
      }
    }
  ];

  constructor() {
    this.cargarUsuariosGuardados();
  }

  private cargarUsuariosGuardados(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('findimo_registered_users');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Unir sin duplicar por correo
            parsed.forEach((item: any) => {
              if (item && item.correo && !this.registeredUsers.some(u => u.correo.toLowerCase() === item.correo.toLowerCase())) {
                this.registeredUsers.push(item);
              }
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  private guardarUsuarioLocal(correo: string, contrasena: string, user: UsuarioRegistroResponse): void {
    const existingIndex = this.registeredUsers.findIndex(u => u.correo.toLowerCase() === correo.toLowerCase());
    if (existingIndex >= 0) {
      this.registeredUsers[existingIndex] = { correo, contrasena, user };
    } else {
      this.registeredUsers.push({ correo, contrasena, user });
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('findimo_registered_users', JSON.stringify(this.registeredUsers));
      } catch (e) {
        console.error(e);
      }
    }
  }

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
    // Si aún no hay usuario en sesión, asignamos por defecto al estudiante Kevin Arturo según Figma
    if (!this.currentUser) {
      this.currentUser = this.registeredUsers[0].user;
    }
    return this.currentUser;
  }

  registrar(dto: UsuarioRegistroRequest): Observable<UsuarioRegistroResponse> {
    return this.http.post<UsuarioRegistroResponse>(`${this.apiUrl}/registro`, dto).pipe(
      tap((res) => {
        this.currentUser = res;
        this.guardarUsuarioLocal(dto.correoElectronico, dto.contrasena, res);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('findimo_user', JSON.stringify(res));
        }
      }),
      catchError((error) => {
        console.warn('Backend /api/usuarios/registro no disponible, guardando en local storage según esquema PostgreSQL:', error);
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
          idPerfilEstudiante: dto.nombreRol === 'ESTUDIANTE' ? Math.floor(Math.random() * 100) + 1 : undefined,
          idPerfilArrendador: dto.nombreRol === 'ARRENDADOR' ? Math.floor(Math.random() * 100) + 1 : undefined
        };
        this.currentUser = mockResponse;
        this.guardarUsuarioLocal(dto.correoElectronico, dto.contrasena, mockResponse);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('findimo_user', JSON.stringify(mockResponse));
        }
        return of(mockResponse);
      })
    );
  }

  iniciarSesion(correo: string, contrasena: string, rol: 'ESTUDIANTE' | 'ARRENDADOR'): Observable<UsuarioRegistroResponse> {
    this.cargarUsuariosGuardados();

    // 1. Buscar si el usuario fue registrado previamente con este correo y contraseña
    const encontrado = this.registeredUsers.find(
      u => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );

    if (encontrado) {
      // Verificar contraseña ingresada
      if (encontrado.contrasena === contrasena) {
        this.currentUser = encontrado.user;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('findimo_user', JSON.stringify(this.currentUser));
        }
        return of(this.currentUser);
      } else {
        throw new Error('Contraseña incorrecta');
      }
    }

    // 2. Si es uno de los usuarios demo por defecto
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
      nombreUniversidad: !isEduardo ? 'Universidad Peruana de Ciencias Aplicadas (UPC)' : undefined,
      presupuestoMaximo: !isEduardo ? 850 : undefined,
      idPerfilArrendador: isEduardo ? 1 : undefined,
      idPerfilEstudiante: !isEduardo ? 1 : undefined
    };

    this.currentUser = response;
    this.guardarUsuarioLocal(correo, contrasena, response);
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
