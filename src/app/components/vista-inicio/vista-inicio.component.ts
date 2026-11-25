import { BotonCompararComponent } from '../boton-comparar/boton-comparar.component';
import { FotoViviendaComponent } from '../foto-vivienda/foto-vivienda.component';
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OpcionPropiedad, Propiedad } from '../../models/propiedad.model';

@Component({
  selector: 'app-vista-inicio',
  standalone: true,
  imports: [BotonCompararComponent, FotoViviendaComponent, CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './vista-inicio.component.html',
  styleUrl: './vista-inicio.component.css'
})
export class VistaInicioComponent {

  @Input() heroUbicacion: string = 'todos';
  @Output() heroUbicacionChange = new EventEmitter<string>();

  @Input() tiposPropiedad: OpcionPropiedad[] = [];
  @Input() heroTipo: string = 'todos';
  @Output() heroTipoChange = new EventEmitter<string>();

  @Input() heroPrecio: string = 'todos';
  @Output() heroPrecioChange = new EventEmitter<string>();

  @Input() ultimasPropiedades: Propiedad[] = [];
  @Input() cargando = true;
  @Input() errorCarga = false;

  @Output() buscarDesdeHero = new EventEmitter<void>();
  @Output() irABusqueda = new EventEmitter<void>();
  @Output() verDetalles = new EventEmitter<Propiedad>();
  @Input() idsComparacion: readonly number[] = [];
  @Output() alternarComparacion = new EventEmitter<Propiedad>();
  @Output() toggleFavorito = new EventEmitter<{ prop: Propiedad; event: Event }>();
  @Output() reintentarCarga = new EventEmitter<void>();
}
