import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ResenaArrendadorSobreEstudiante {
  id: number;
  arrendadorNombre: string;
  arrendadorAvatar: string;
  propiedadNombre: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  etiquetas: string[];
}

export interface ResenaEscritaPorEstudiante {
  id: number;
  propiedadTitulo: string;
  arrendadorNombre: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

@Component({
  selector: 'app-vista-resenas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-resenas.component.html',
  styleUrl: './vista-resenas.component.css'
})
export class VistaResenasComponent {
  @Input() pestanaActiva: 'sobreTi' | 'escritas' = 'escritas';
  @Output() volverAlPerfil = new EventEmitter<void>();

  // Reseñas que arrendadores dejaron exclusivamente sobre el estudiante inquilino
  resenasSobreTi: ResenaArrendadorSobreEstudiante[] = [
    {
      id: 1,
      arrendadorNombre: 'Eduardo Garza',
      arrendadorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      propiedadNombre: 'Habitación iluminada frente de la UPC Chorrillos',
      calificacion: 5.0,
      comentario: 'Excelente huésped e inquilino. Siempre muy ordenado, respetuoso con los horarios de silencio y cumplió puntualmente con el pago de todos los meses. 100% recomendado para cualquier arrendador.',
      fecha: 'Hace 3 semanas',
      etiquetas: ['Pago puntual', 'Muy limpio y ordenado', 'Comunicativo', 'Cuidadoso del mobiliario']
    },
    {
      id: 2,
      arrendadorNombre: 'Dino Bianchi',
      arrendadorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      propiedadNombre: 'Habitación frente al Parque',
      calificacion: 4.9,
      comentario: 'Un joven estudiante muy educado y tranquilo. Dejó la habitación en perfectas condiciones y siempre mantuvo una excelente convivencia con los demás estudiantes del edificio.',
      fecha: 'Hace 2 meses',
      etiquetas: ['Excelente convivencia', 'Responsable', 'Cuida las instalaciones']
    }
  ];

  // Reseñas escritas anteriormente por el estudiante
  resenasEscritas: ResenaEscritaPorEstudiante[] = [];
}
