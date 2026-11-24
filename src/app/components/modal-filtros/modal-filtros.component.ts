import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  @Input() serviciosDisponibles: string[] = [];
  @Input() serviciosExtra: string[] = [];
  @Input() serviciosSeleccionados: string[] = [];
  @Input() mostrarMasServicios: boolean = false;
  @Input() opcionesReservacionDisponibles: string[] = [];
  @Input() opcionesReservacionSeleccionadas: string[] = [];
  @Input() alojamientoDestacadoSeleccionado: 'favorito' | 'luxe' | null = null;
  @Input() tipoPropiedadExpandido: boolean = false;
  @Input() filtroTipoPropiedadModal: string = 'todos';
  @Input() accesibilidadExpandido: boolean = false;
  @Input() filtroAccesibilidadModal: string = 'todas';

  @Output() cerrarModalFiltros = new EventEmitter<void>();
  @Output() toggleServicio = new EventEmitter<string>();
  @Output() toggleMostrarMasServicios = new EventEmitter<void>();
  @Output() toggleOpcionReservacion = new EventEmitter<string>();
  @Output() seleccionarDestacado = new EventEmitter<'favorito' | 'luxe'>();
  @Output() toggleTipoPropiedadModal = new EventEmitter<void>();
  @Output() toggleAccesibilidadModal = new EventEmitter<void>();
  @Output() seleccionarTipoPropiedadModal = new EventEmitter<string>();
  @Output() seleccionarAccesibilidadModal = new EventEmitter<string>();
  @Output() limpiarFiltrosAvanzados = new EventEmitter<void>();
  @Output() aplicarFiltrosAvanzados = new EventEmitter<void>();

  estaServicioSeleccionado(s: string): boolean {
    return this.serviciosSeleccionados.indexOf(s) >= 0;
  }

  estaOpcionReservacionSeleccionada(op: string): boolean {
    return this.opcionesReservacionSeleccionadas.indexOf(op) >= 0;
  }
}
