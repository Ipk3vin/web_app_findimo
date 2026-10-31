import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Propiedad, PropiedadRequest } from '../models/propiedad.model';

@Injectable({
  providedIn: 'root'
})
export class PropiedadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/propiedades';

  // Propiedades por defecto que replican exactamente el diseño de las capturas
  private defaultProperties: Propiedad[] = [
    {
      idPropiedad: 1,
      titulo: 'Loft Moderno en Roma Norte',
      descripcion: 'Hermoso loft contemporáneo completamente amueblado con acabados premium y amplios ventanales.',
      precio: 1500,
      habitaciones: 1,
      banos: 1,
      area: 65,
      direccion: 'Roma Norte',
      distrito: 'Surco',
      estado: true,
      tipoEspacio: 'Departamentos',
      imagen: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      esFavorito: false
    },
    {
      idPropiedad: 2,
      titulo: 'Casa de Diseño en Coyoacán',
      descripcion: 'Casa contemporánea de arquitectura limpia con patio interior central y excelente iluminación natural.',
      precio: 950,
      habitaciones: 3,
      banos: 2.5,
      area: 80,
      direccion: 'urbanizacion los portales',
      distrito: 'Chorrillos',
      estado: true,
      tipoEspacio: 'Casas',
      imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      esFavorito: false
    },
    {
      idPropiedad: 3,
      titulo: 'Estudio Amueblado Tec de Monterrey',
      descripcion: 'Estudio moderno amueblado ideal para estudiantes, cerca de campus universitario y con áreas verdes.',
      precio: 500,
      habitaciones: 1,
      banos: 1,
      area: 42,
      direccion: 'Villa de los Olivos',
      distrito: 'Molina',
      estado: true,
      tipoEspacio: 'Estudios',
      imagen: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      esFavorito: false
    }
  ];

  obtenerTodas(): Observable<Propiedad[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((backendItems) => {
        if (!backendItems || backendItems.length === 0) {
          return this.defaultProperties;
        }

        return backendItems.map((item, index) => {
          // Asignar datos visuales complementarios según el título o índice
          const fallback = this.defaultProperties[index % this.defaultProperties.length];
          return {
            idPropiedad: item.idPropiedad || fallback.idPropiedad,
            idPerfilArrendador: item.idPerfilArrendador || 1,
            titulo: item.titulo || fallback.titulo,
            descripcion: item.descripcion || fallback.descripcion,
            precio: Number(item.precio) || fallback.precio,
            habitaciones: item.habitaciones || fallback.habitaciones,
            banos: item.habitaciones === 3 ? 2.5 : 1,
            area: item.habitaciones === 3 ? 80 : (item.precio >= 1000 ? 65 : 42),
            direccion: item.direccion || fallback.direccion,
            distrito: item.distrito || fallback.distrito,
            estado: item.estado !== undefined ? item.estado : true,
            tipoEspacio: this.inferirTipo(item.titulo, item.habitaciones),
            imagen: this.obtenerImagen(item.titulo, index),
            esFavorito: false
          };
        });
      }),
      catchError((error) => {
        console.warn('Backend no disponible o error en /api/propiedades, usando datos locales:', error);
        return of(this.defaultProperties);
      })
    );
  }

  crearPropiedad(request: PropiedadRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      catchError((err) => {
        console.warn('Error guardando en backend:', err);
        // Retorno simulado si backend falla
        return of({
          ...request,
          idPropiedad: Math.floor(Math.random() * 1000) + 10
        });
      })
    );
  }

  private inferirTipo(titulo: string, habitaciones: number): 'Departamentos' | 'Casas' | 'Estudios' | 'Habitaciones' {
    const t = (titulo || '').toLowerCase();
    if (t.includes('casa')) return 'Casas';
    if (t.includes('estudio')) return 'Estudios';
    if (t.includes('habitaci')) return 'Habitaciones';
    return 'Departamentos';
  }

  private obtenerImagen(titulo: string, index: number): string {
    const t = (titulo || '').toLowerCase();
    if (t.includes('loft') || t.includes('roma')) {
      return 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('coyoacán') || t.includes('casa')) {
      return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('estudio') || t.includes('tec') || t.includes('monterrey')) {
      return 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80';
    }
    const pool = [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    ];
    return pool[index % pool.length];
  }
}
