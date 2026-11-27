import { BotonCompararComponent } from '../boton-comparar/boton-comparar.component';
import { FotoViviendaComponent } from '../foto-vivienda/foto-vivienda.component';
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UNIVERSIDADES_LIMA } from '../../models/universidades.model';
import { OpcionPropiedad, Propiedad } from '../../models/propiedad.model';

@Component({
  selector: 'app-vista-busqueda',
  standalone: true,
  imports: [BotonCompararComponent, FotoViviendaComponent, CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './vista-busqueda.component.html',
  styleUrl: './vista-busqueda.component.css'
})
export class VistaBusquedaComponent {
  readonly universidades = UNIVERSIDADES_LIMA;
  @Input() tiposPropiedad: OpcionPropiedad[] = [];
  @Input() filtroTipoHabitacion: string = 'todos';
  @Output() filtroTipoHabitacionChange = new EventEmitter<string>();

  @Input() filtroPrecioMensual: string = 'todos';
  @Output() filtroPrecioMensualChange = new EventEmitter<string>();

  @Input() filtroDistrito = 'todos';
  @Input() filtroUniversidad: string = 'todas';
  @Output() filtroUniversidadChange = new EventEmitter<string>();

  @Input() propiedadesFiltradas: Propiedad[] = [];
  @Input() cargando = true;
  @Input() errorCarga = false;
  @Output() reintentar = new EventEmitter<void>();

  @Output() irAInicio = new EventEmitter<void>();
  @Output() abrirModalFiltros = new EventEmitter<void>();
  @Output() ejecutarBusqueda = new EventEmitter<void>();
  @Output() limpiarFiltros = new EventEmitter<void>();
  @Output() verDetalles = new EventEmitter<Propiedad>();
  @Input() idsComparacion: readonly number[] = [];
  @Output() alternarComparacion = new EventEmitter<Propiedad>();
  @Output() irAComparacion = new EventEmitter<void>();
  @Output() toggleFavorito = new EventEmitter<{ prop: Propiedad; event: Event }>();
}
