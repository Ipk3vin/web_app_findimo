import { Component, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GRUPOS_DISTRITOS_LIMA_CALLAO } from '../../models/distritos.model';
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
  readonly gruposDistritos = GRUPOS_DISTRITOS_LIMA_CALLAO;
  readonly distritos = this.gruposDistritos.flatMap(grupo => grupo.distritos);

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
  @Output() guardarPropiedad = new EventEmitter<{ entorno: LugarCercano[]; serviciosPersonalizados: string[]; fotos: File[]; fotosRetiradas: string[] }>();

  readonly categoriasEntorno = (Object.keys(TIPOS_ENTORNO) as TipoEntorno[])
    .filter(tipo => tipo !== 'PERSONALIZADO')
    .map(tipo => ({ tipo, etiqueta: TIPOS_ENTORNO[tipo].etiqueta }));
  entorno: { categoria: string; nombre: string; minutos: number | null }[] = [];
  serviciosPersonalizados: { nombre: string }[] = [];
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
      this.entorno = (this.vivienda?.entorno ?? []).map(lugar => ({
        categoria: lugar.categoria ?? TIPOS_ENTORNO[lugar.tipo].etiqueta,
        nombre: lugar.nombre ?? '',
        minutos: lugar.minutos
      }));
      this.serviciosPersonalizados = (this.vivienda?.serviciosPersonalizados ?? []).map(nombre => ({ nombre }));
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

  agregarLugar(): void {
    this.entorno.push({ categoria: '', nombre: '', minutos: null });
  }

  quitarLugar(indice: number): void {
    this.entorno.splice(indice, 1);
  }

  agregarServicioPersonalizado(): void {
    this.serviciosPersonalizados.push({ nombre: '' });
  }

  quitarServicioPersonalizado(indice: number): void {
    this.serviciosPersonalizados.splice(indice, 1);
  }

  publicar(): void {
    this.errorFotos = '';
    if (!this.primeraFotoGuardada && !this.fotos.length) {
      this.errorFotos = 'Agrega o conserva al menos una foto de la vivienda.';
      return;
    }
    this.errorEntorno = '';
    const lugares: LugarCercano[] = [];
    for (const { categoria, nombre, minutos } of this.entorno) {
      const etiqueta = categoria.trim();
      const nombreLimpio = nombre.trim();
      if (!etiqueta && !nombreLimpio && minutos === null) continue;

      if (!etiqueta || minutos === null || !Number.isInteger(minutos) || minutos < 1 || minutos > 1440) {
        this.errorEntorno = 'Indica el tipo de lugar y entre 1 y 1440 minutos a pie en cada fila.';
        return;
      }
      const tipo = this.categoriasEntorno.find(opcion => opcion.etiqueta.toLowerCase() === etiqueta.toLowerCase()
        || opcion.tipo.toLowerCase() === etiqueta.toLowerCase())?.tipo ?? 'PERSONALIZADO';
      lugares.push({ tipo, categoria: tipo === 'PERSONALIZADO' ? etiqueta : null, nombre: nombreLimpio || null, minutos });
    }
    const serviciosPersonalizados = [...new Set(this.serviciosPersonalizados.map(servicio => servicio.nombre.trim()).filter(Boolean))];
    this.guardarPropiedad.emit({ entorno: lugares, serviciosPersonalizados, fotos: this.fotos, fotosRetiradas: [...this.fotosRetiradas] });
  }
}
