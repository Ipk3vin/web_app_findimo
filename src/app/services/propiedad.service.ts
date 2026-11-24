import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Propiedad, PropiedadRequest } from '../models/propiedad.model';

@Injectable({
  providedIn: 'root'
})
export class PropiedadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/propiedades';

  // Propiedades por defecto basadas en el diseño exacto de Figma (Resultados de búsqueda en Chorrillos)
  readonly defaultProperties: Propiedad[] = [
    {
      idPropiedad: 1,
      titulo: 'Habitación iluminada frente de la UPC Chorrillos',
      descripcion: 'Disfruta de la sencillez de este alojamiento tranquilo y céntrico. Se ofrece habitaciones matrimoniales, simples, y con dos camas, frente a la universidad UPC.\n\nPerfecto para estudiantes que buscan un ambiente enfocado en el estudio con áreas de cocina compartida, excelente señal de Wi-Fi y cercanía a las playas de Chorrillos y al transporte urbano.',
      precio: 780,
      precioNoche: 53,
      habitaciones: 1,
      banos: 1,
      area: 25,
      direccion: 'Chorrillos',
      distrito: 'Lima, Perú',
      estado: true,
      tipoEspacio: 'Habitaciones',
      calificacion: 4.91,
      totalResenas: 22,
      subtituloDetalle: '1 cama doble · Baño privado en el alojamiento',
      arrendadorNombre: 'Dino',
      arrendadorAntiguedad: '1 año como arrendador',
      arrendadorInicial: 'D',
      imagen: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      imagenesGaleria: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
      ],
      esFavorito: false
    },
    {
      idPropiedad: 2,
      titulo: 'Habitación frente al Parque',
      descripcion: 'Habitación luminosa y tranquila con escritorio de estudio, vista al parque y excelente ventilación. Baño privado y cocina compartida para estudiantes.',
      precio: 850,
      precioNoche: 58,
      habitaciones: 1,
      banos: 1,
      area: 18,
      direccion: 'Chorrillos',
      distrito: 'Lima, Perú',
      estado: true,
      tipoEspacio: 'Habitaciones',
      calificacion: 4.85,
      totalResenas: 18,
      subtituloDetalle: '1 cama individual · Baño privado en el alojamiento',
      arrendadorNombre: 'Dino',
      arrendadorAntiguedad: '1 año como arrendador',
      arrendadorInicial: 'D',
      imagen: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      imagenesGaleria: [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
      ],
      esFavorito: false
    },
    {
      idPropiedad: 3,
      titulo: 'Estudio Amoblado UPC',
      descripcion: 'Estudio amoblado moderno a pocos minutos del campus UPC Chorrillos, con baño privado, kitchenette y balcón.',
      precio: 950,
      precioNoche: 65,
      habitaciones: 1,
      banos: 1,
      area: 22,
      direccion: 'Villa de los Olivos',
      distrito: 'Surco, Lima',
      estado: true,
      tipoEspacio: 'Estudios',
      calificacion: 4.78,
      totalResenas: 14,
      subtituloDetalle: '1 cama matrimonial · Baño propio completo',
      arrendadorNombre: 'Mariana',
      arrendadorAntiguedad: '2 años como arrendadora',
      arrendadorInicial: 'M',
      imagen: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      imagenesGaleria: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
      ],
      esFavorito: false
    },
    {
      idPropiedad: 4,
      titulo: 'Cuarto Compartido Premium',
      descripcion: 'Espacio universitario compartido para 2 personas con escritorios ergonómicos y clóset amplio cerca de transporte principal.',
      precio: 580,
      precioNoche: 40,
      habitaciones: 2,
      banos: 1,
      area: 30,
      direccion: 'La Molina',
      distrito: 'Lima, Perú',
      estado: true,
      tipoEspacio: 'Habitaciones',
      calificacion: 4.90,
      totalResenas: 25,
      subtituloDetalle: '2 camas individuales · Baño compartido',
      arrendadorNombre: 'Carlos',
      arrendadorAntiguedad: '3 años como arrendador',
      arrendadorInicial: 'C',
      imagen: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      imagenesGaleria: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
      ],
      esFavorito: false
    }
  ];

  // Propiedades recomendadas según el diseño de Figma (Nuevas opciones de cuartos)
  private recommendedProperties: Propiedad[] = [
    {
      idPropiedad: 101,
      titulo: 'Habitación Individual UPC',
      descripcion: 'Habitación individual amoblada para estudiantes con escritorio, estantería y servicios incluidos.',
      precio: 720,
      habitaciones: 1,
      banos: 1,
      area: 16,
      direccion: 'Chorrillos',
      distrito: 'Lima',
      estado: true,
      tipoEspacio: 'Habitaciones',
      calificacion: 4.8,
      imagen: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      esFavorito: false
    },
    {
      idPropiedad: 102,
      titulo: 'Studio frente al parque',
      descripcion: 'Studio moderno con mampara de vidrio y acceso a terraza, ideal para estudio y descanso.',
      precio: 850,
      habitaciones: 1,
      banos: 1,
      area: 24,
      direccion: 'Chorrillos',
      distrito: 'Lima',
      estado: true,
      tipoEspacio: 'Estudios',
      calificacion: 4.9,
      imagen: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
      esFavorito: false
    },
    {
      idPropiedad: 103,
      titulo: 'Cuarto amoblado céntrico',
      descripcion: 'Cuarto cálido con ambiente acogedor, escritorio y fácil acceso a avenidas principales.',
      precio: 650,
      habitaciones: 1,
      banos: 1,
      area: 17,
      direccion: 'Chorrillos',
      distrito: 'Lima',
      estado: true,
      tipoEspacio: 'Habitaciones',
      calificacion: 4.7,
      imagen: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=800&q=80',
      esFavorito: false
    },
    {
      idPropiedad: 104,
      titulo: 'Espacio compartido premium',
      descripcion: 'Dormitorio compartido moderno para estudiantes cerca de campus universitario.',
      precio: 580,
      habitaciones: 2,
      banos: 1,
      area: 28,
      direccion: 'Chorrillos',
      distrito: 'Lima',
      estado: true,
      tipoEspacio: 'Habitaciones',
      calificacion: 4.9,
      imagen: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
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
          const fallback = this.defaultProperties[index % this.defaultProperties.length];
          const precioNum = Number(item.precio) || fallback.precio;
          return {
            idPropiedad: item.idPropiedad || fallback.idPropiedad,
            idPerfilArrendador: item.idPerfilArrendador || 1,
            titulo: item.titulo || fallback.titulo,
            descripcion: item.descripcion || fallback.descripcion,
            precio: precioNum,
            precioNoche: Math.round(precioNum / 15),
            habitaciones: item.habitaciones || fallback.habitaciones,
            banos: item.habitaciones === 3 ? 2.5 : 1,
            area: item.habitaciones === 3 ? 80 : (item.precio >= 1000 ? 65 : fallback.area || 25),
            direccion: item.direccion || fallback.direccion,
            distrito: item.distrito || fallback.distrito,
            estado: item.estado !== undefined ? item.estado : true,
            tipoEspacio: this.inferirTipo(item.titulo, item.habitaciones),
            calificacion: fallback.calificacion || 4.85,
            totalResenas: fallback.totalResenas || 22,
            subtituloDetalle: fallback.subtituloDetalle || `${item.habitaciones || 1} Hab · Baño en el alojamiento`,
            arrendadorNombre: fallback.arrendadorNombre || 'Dino',
            arrendadorAntiguedad: fallback.arrendadorAntiguedad || '1 año como arrendador',
            arrendadorInicial: fallback.arrendadorInicial || 'D',
            imagen: this.obtenerImagen(item.titulo, index),
            imagenesGaleria: fallback.imagenesGaleria || [
              this.obtenerImagen(item.titulo, index),
              'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
            ],
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

  obtenerRecomendadas(): Observable<Propiedad[]> {
    return of(this.recommendedProperties);
  }

  crearPropiedad(request: PropiedadRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      catchError((err) => {
        console.warn('Error guardando en backend:', err);
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
    if (t.includes('habitaci') || t.includes('cuarto')) return 'Habitaciones';
    return 'Departamentos';
  }

  private obtenerImagen(titulo: string, index: number): string {
    const t = (titulo || '').toLowerCase();
    if (t.includes('loft') || t.includes('roma')) {
      return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('parque')) {
      return 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('upc') || t.includes('olivos')) {
      return 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80';
    }
    if (t.includes('compartido') || t.includes('molina')) {
      return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';
    }
    const pool = [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
    ];
    return pool[index % pool.length];
  }
}
