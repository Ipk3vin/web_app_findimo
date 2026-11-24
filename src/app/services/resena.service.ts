import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Resena } from '../models/resena.model';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/resenas';

  private defaultReviews: Resena[] = [
    {
      idResena: 1,
      nombreAutor: 'Sofía',
      apellidoAutor: 'Martínez',
      rolAutor: 'Estudiante de Medicina',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
      calificacion: 5,
      comentario: '“Encontrar departamento cerca de mi universidad solía ser un dolor de cabeza de meses. Con Findimo, agendé la visita virtual, firmé mi contrato y me mudé en menos de una semana.”',
      destacado: false
    },
    {
      idResena: 2,
      nombreAutor: 'Eduardo',
      apellidoAutor: 'Garza',
      rolAutor: 'Arrendador registrado',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      calificacion: 5,
      comentario: '“Como arrendador, la seguridad es mi prioridad. Findimo valida el perfil financiero de los candidatos de forma inmediata y su contrato digital es fantástico.”',
      destacado: true
    }
  ];

  obtenerTestimonios(): Observable<Resena[]> {
    return of(this.defaultReviews);
  }

  /**
   * Obtiene las reseñas reales de una propiedad desde el backend Spring Boot (GET /api/resenas/propiedad/{idPropiedad}).
   * Si la BD no tiene registros o no está disponible, provee las reseñas de la maqueta Figma.
   */
  obtenerResenasPorPropiedad(idPropiedad: number): Observable<Resena[]> {
    return this.http.get<any[]>(`${this.apiUrl}/propiedad/${idPropiedad}`).pipe(
      catchError(() => of([])),
      map((resenasBackend: any[]) => {
        if (resenasBackend && resenasBackend.length > 0) {
          return resenasBackend.map((r: any) => ({
            idResena: r.idResena,
            idUsuarioAutor: r.idUsuarioAutor,
            nombreAutor: r.nombreAutor,
            apellidoAutor: r.apellidoAutor,
            rolAutor: 'Estudiante verificado',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            calificacion: r.calificacion || 5,
            comentario: r.comentario || '',
            fechaCreacion: r.fechaCreacion,
            estado: r.estado
          }));
        }
        // Fallback enriquecido correspondiente a la maqueta Figma (US08 / US10)
        return [
          {
            idResena: 1,
            nombreAutor: 'Sofía',
            apellidoAutor: 'M.',
            rolAutor: 'Estudiante UPC',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            calificacion: 5,
            comentario: 'Excelente ubicación, muy cerca de la UPC. Zona tranquila y segura.',
            fechaCreacion: 'Hace 2 meses'
          },
          {
            idResena: 2,
            nombreAutor: 'Luciana',
            apellidoAutor: 'R.',
            rolAutor: 'Estudiante UPC',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
            calificacion: 4.8,
            comentario: 'Buen ambiente y convivencia. El condominio es muy seguro y el internet vuela para las clases.',
            fechaCreacion: 'Hace 1 mes'
          },
          {
            idResena: 3,
            nombreAutor: 'Carlos',
            apellidoAutor: 'D.',
            rolAutor: 'Estudiante UCSUR',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
            calificacion: 4.9,
            comentario: 'Muy buena relación calidad-precio. Todo en buen estado y el arrendador Dino siempre atento.',
            fechaCreacion: 'Hace 3 semanas'
          }
        ];
      })
    );
  }
}
