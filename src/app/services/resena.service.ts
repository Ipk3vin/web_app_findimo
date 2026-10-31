import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
}
