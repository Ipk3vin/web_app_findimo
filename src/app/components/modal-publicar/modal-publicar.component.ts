import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './modal-publicar.component.html',
  styleUrl: './modal-publicar.component.css'
})
export class ModalPublicarComponent {
  @Input() modalPublicarAbierto: boolean = false;

  @Input() pubTitulo: string = '';
  @Output() pubTituloChange = new EventEmitter<string>();

  @Input() pubDescripcion: string = '';
  @Output() pubDescripcionChange = new EventEmitter<string>();

  @Input() pubPrecio: number = 950;
  @Output() pubPrecioChange = new EventEmitter<number>();

  @Input() pubHabitaciones: number = 1;
  @Output() pubHabitacionesChange = new EventEmitter<number>();

  @Input() pubDireccion: string = '';
  @Output() pubDireccionChange = new EventEmitter<string>();

  @Input() pubDistrito: string = '';
  @Output() pubDistritoChange = new EventEmitter<string>();

  @Input() pubTipo: 'Departamentos' | 'Casas' | 'Estudios' | 'Habitaciones' = 'Habitaciones';
  @Output() pubTipoChange = new EventEmitter<'Departamentos' | 'Casas' | 'Estudios' | 'Habitaciones'>();

  @Output() cerrarModalPublicar = new EventEmitter<void>();
  @Output() guardarPropiedad = new EventEmitter<void>();
}
