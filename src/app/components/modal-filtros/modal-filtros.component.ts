import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogosPropiedad } from '../../models/propiedad.model';

@Component({
  selector: 'app-modal-filtros',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './modal-filtros.component.html',
  styleUrl: './modal-filtros.component.css'
})
export class ModalFiltrosComponent {
  @Input() modalFiltrosAbierto: boolean = false;
  @Input() catalogos: CatalogosPropiedad = { tipos: [], servicios: [] };
  @Input() cargandoCatalogos = true;
  @Input() errorCatalogos = false;
  @Input() serviciosSeleccionados: number[] = [];
  @Input() tipoSeleccionado = 'todos';

  @Output() cerrarModalFiltros = new EventEmitter<void>();
  @Output() reintentarCatalogos = new EventEmitter<void>();
  @Output() toggleServicio = new EventEmitter<number>();
  @Output() tipoSeleccionadoChange = new EventEmitter<string>();
  @Output() limpiarFiltrosAvanzados = new EventEmitter<void>();
  @Output() aplicarFiltrosAvanzados = new EventEmitter<void>();
}
