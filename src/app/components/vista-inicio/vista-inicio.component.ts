import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Propiedad } from '../../models/propiedad.model';
import { Resena } from '../../models/resena.model';

@Component({
  selector: 'app-vista-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './vista-inicio.component.html',
  styleUrl: './vista-inicio.component.css'
})
export class VistaInicioComponent {
  @Input() heroUbicacion: string = 'todos';
  @Output() heroUbicacionChange = new EventEmitter<string>();

  @Input() heroTipo: string = 'todos';
  @Output() heroTipoChange = new EventEmitter<string>();

  @Input() heroPrecio: string = 'todos';
  @Output() heroPrecioChange = new EventEmitter<string>();

  @Input() propiedadesFiltradas: Propiedad[] = [];
  @Input() testimonios: Resena[] = [];

  @Output() buscarDesdeHero = new EventEmitter<void>();
  @Output() irABusqueda = new EventEmitter<void>();
  @Output() abrirModalRegistro = new EventEmitter<void>();
  @Output() verDetalles = new EventEmitter<Propiedad>();
  @Output() toggleFavorito = new EventEmitter<{ prop: Propiedad; event: Event }>();
}
