import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Propiedad } from '../../models/propiedad.model';
import { Resena } from '../../models/resena.model';

@Component({
  selector: 'app-vista-detalle',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './vista-detalle.component.html',
  styleUrl: './vista-detalle.component.css'
})
export class VistaDetalleComponent {
  @Input() propiedadSeleccionada: Propiedad | null = null;
  @Input() resenasPropiedadSeleccionada: Resena[] = [];
  @Input() filtroResenaActivo: string = 'todas';
  @Input() propiedadesComparacion: Propiedad[] = [];
  @Input() propiedadesRecomendadas: Propiedad[] = [];

  @Output() filtroResenaActivoChange = new EventEmitter<string>();
  @Output() toggleFavorito = new EventEmitter<Propiedad>();
  @Output() reservaInmediata = new EventEmitter<void>();
  @Output() reservarVisita = new EventEmitter<void>();
  @Output() contactarArrendador = new EventEmitter<void>();
  @Output() verDetalles = new EventEmitter<Propiedad>();
  @Output() mostrarToast = new EventEmitter<{ mensaje: string; tipo: 'success' | 'error' | 'info' }>();
}
