import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Propiedad } from '../../models/propiedad.model';

@Component({
  selector: 'app-vista-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './vista-busqueda.component.html',
  styleUrl: './vista-busqueda.component.css'
})
export class VistaBusquedaComponent {
  @Input() filtroTipoHabitacion: string = 'Cuarto solo';
  @Output() filtroTipoHabitacionChange = new EventEmitter<string>();

  @Input() filtroPrecioMensual: string = '500-1500';
  @Output() filtroPrecioMensualChange = new EventEmitter<string>();

  @Input() filtroUniversidad: string = 'UPC Chorrillos';
  @Output() filtroUniversidadChange = new EventEmitter<string>();

  @Input() propiedadesFiltradas: Propiedad[] = [];
  @Input() propiedadesRecomendadas: Propiedad[] = [];

  @Output() irAInicio = new EventEmitter<void>();
  @Output() abrirModalFiltros = new EventEmitter<void>();
  @Output() ejecutarBusqueda = new EventEmitter<void>();
  @Output() limpiarFiltros = new EventEmitter<void>();
  @Output() verDetalles = new EventEmitter<Propiedad>();
  @Output() toggleFavorito = new EventEmitter<{ prop: Propiedad; event: Event }>();
}
