import { Component, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogosPropiedad, LugarCercano, Propiedad, TIPOS_ENTORNO, TipoEntorno } from '../../models/propiedad.model';

@Component({
  selector: 'app-modal-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './modal-publicar.component.html',
  styleUrl: './modal-publicar.component.css'
})
export class ModalPublicarComponent implements OnChanges {
  @Input() modalPublicarAbierto: boolean = false;
  @Input() publicando = false;
  @Input() vivienda: Propiedad | null = null;
  readonly distritos = ['Chorrillos', 'Surco', 'La Molina', 'Miraflores', 'San Isidro'];

  @Input() pubTitulo: string = '';
  @Output() pubTituloChange = new EventEmitter<string>();

  @Input() pubDescripcion: string = '';
  @Output() pubDescripcionChange = new EventEmitter<string>();

  @Input() pubPrecio: number = 950;
  @Output() pubPrecioChange = new EventEmitter<number>();

  @Input() pubHabitaciones: number = 1;
  @Output() pubHabitacionesChange = new EventEmitter<number>();

  @Input() pubArea: number | null = null;
  @Output() pubAreaChange = new EventEmitter<number | null>();

  @Input() pubDireccion: string = '';
  @Output() pubDireccionChange = new EventEmitter<string>();

  @Input() pubDistrito: string = '';
  @Output() pubDistritoChange = new EventEmitter<string>();

  @Input() catalogos: CatalogosPropiedad = { tipos: [], servicios: [] };
  @Input() cargandoCatalogos = true;
  @Input() errorCatalogos = false;
  @Input() pubIdTipoPropiedad: number | null = null;
  @Input() pubIdsServicios: number[] = [];
  @Output() pubIdTipoPropiedadChange = new EventEmitter<number | null>();
  @Output() pubIdsServiciosChange = new EventEmitter<number[]>();
  @Output() reintentarCatalogos = new EventEmitter<void>();

  alternarServicio(id: number): void {
    this.pubIdsServiciosChange.emit(this.pubIdsServicios.includes(id)
      ? this.pubIdsServicios.filter(servicio => servicio !== id)
      : [...this.pubIdsServicios, id]);
  }

  @Output() cerrarModalPublicar = new EventEmitter<void>();
  @Output() guardarPropiedad = new EventEmitter<{ entorno: LugarCercano[]; fotos: File[]; fotosRetiradas: string[] }>();

  readonly tiposEntorno = TIPOS_ENTORNO;
  entorno = (Object.keys(TIPOS_ENTORNO) as TipoEntorno[]).map(tipo => ({
    tipo, nombre: '', minutos: null as number | null
  }));
  errorEntorno = '';
  errorFotos = '';
  fotos: File[] = [];
  fotosRetiradas = new Set<string>();
  fotosNoDisponibles = new Set<string>();

  get primeraFotoGuardada(): string | undefined {
    return this.vivienda?.fotosGuardadas?.find(foto => !this.fotosRetiradas.has(foto.ruta))?.ruta;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modalPublicarAbierto'] || changes['vivienda']) {
      for (const lugar of this.entorno) {
        const original = this.vivienda?.entorno?.find(item => item.tipo === lugar.tipo);
        lugar.nombre = original?.nombre ?? '';
        lugar.minutos = original?.minutos ?? null;
      }
      this.errorEntorno = '';
      this.errorFotos = '';
      this.fotos = [];
      this.fotosRetiradas.clear();
      this.fotosNoDisponibles.clear();
    }
  }

  alternarFotoRetirada(ruta: string): void {
    if (!this.fotosRetiradas.delete(ruta)) this.fotosRetiradas.add(ruta);
  }

  agregarFotos(input: HTMLInputElement): void {
    const nuevas = Array.from(input.files ?? []);
    input.value = '';
    this.errorFotos = '';
    if (this.fotos.length + nuevas.length > 5) {
      this.errorFotos = 'Puedes agregar hasta cinco fotos.';
      return;
    }
    if (nuevas.some(foto => !['image/jpeg', 'image/png'].includes(foto.type) ||
      foto.size === 0 || foto.size > 5 * 1024 * 1024)) {
      this.errorFotos = 'Selecciona fotos JPG o PNG de hasta 5 MB cada una.';
      return;
    }
    this.fotos = [...this.fotos, ...nuevas];
  }

  quitarFoto(indice: number): void {
    this.fotos = this.fotos.filter((_, posicion) => posicion !== indice);
    this.errorFotos = '';
  }

  publicar(): void {
    this.errorFotos = '';
    if (!this.primeraFotoGuardada && !this.fotos.length) {
      this.errorFotos = 'Agrega o conserva al menos una foto de la vivienda.';
      return;
    }
    this.errorEntorno = '';
    const lugares: LugarCercano[] = [];
    for (const { tipo, nombre, minutos } of this.entorno) {
      const nombreLimpio = nombre.trim();
      if (!nombreLimpio && minutos === null) continue;

      if (minutos === null || !Number.isInteger(minutos) || minutos < 1 || minutos > 1440) {
        this.errorEntorno = `Indica entre 1 y 1440 minutos para «${this.tiposEntorno[tipo].etiqueta}».`;
        return;
      }
      lugares.push({ tipo, nombre: nombreLimpio || null, minutos });
    }
    this.guardarPropiedad.emit({ entorno: lugares, fotos: this.fotos, fotosRetiradas: [...this.fotosRetiradas] });
  }
}
