import { FotoViviendaComponent } from '../foto-vivienda/foto-vivienda.component';
import { Component, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Propiedad, TIPOS_ENTORNO } from '../../models/propiedad.model';
import { Resena } from '../../models/resena.model';

@Component({
  selector: 'app-vista-detalle',
  standalone: true,
  imports: [FotoViviendaComponent, CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './vista-detalle.component.html',
  styleUrl: './vista-detalle.component.css'
})
export class VistaDetalleComponent implements OnChanges {
  readonly tiposEntorno = TIPOS_ENTORNO;

  @Input() propiedadSeleccionada: Propiedad | null = null;
  @Input() resenasPropiedadSeleccionada: Resena[] = [];
  @Input() cargandoResenasPropiedad = true;
  @Input() errorResenasPropiedad = false;
  @Input() propiedadesRecomendadas: Propiedad[] = [];

  @Output() toggleFavorito = new EventEmitter<Propiedad>();
  @Input() puedeSolicitarAlquiler = true;
  @Output() reservaInmediata = new EventEmitter<void>();
  @Input() solicitandoAlquiler = false;
  @Output() irAComparacion = new EventEmitter<void>();
  @Output() verDetalles = new EventEmitter<Propiedad>();
  @Output() mostrarToast = new EventEmitter<{ mensaje: string; tipo: 'success' | 'error' | 'info' }>();

  fotoActiva?: string;
  private fotosOcultas = new Set<string>();

  get fotos(): string[] {
    return [...new Set(this.propiedadSeleccionada?.imagenesGaleria ?? [])].filter(foto => !this.fotosOcultas.has(foto));
  }

  get fotoVisible(): string | undefined {
    const fotos = this.fotos;
    return fotos.find(foto => foto === this.fotoActiva) ?? fotos[0];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propiedadSeleccionada']) {
      this.fotoActiva = undefined;
      this.fotosOcultas.clear();
    }
  }

  ocultarFoto(foto: string): void {
    this.fotosOcultas.add(foto);
  }

  async compartir(): Promise<void> {
    if (!this.propiedadSeleccionada) return;
    const url = new URL(window.location.href);
    url.searchParams.set('propiedad', String(this.propiedadSeleccionada.idPropiedad));
    url.hash = 'detalle';

    try {
      await navigator.clipboard.writeText(url.href);
      this.mostrarToast.emit({ mensaje: 'Enlace copiado al portapapeles.', tipo: 'success' });
    } catch {
      this.mostrarToast.emit({ mensaje: 'No se pudo copiar el enlace.', tipo: 'error' });
    }
  }
}
