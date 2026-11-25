import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ResenasPerfil } from '../../models/resena.model';
import { ResenaService } from '../../services/resena.service';

@Component({
  selector: 'app-vista-resenas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-resenas.component.html',
  styleUrl: './vista-resenas.component.css'
})
export class VistaResenasComponent implements OnChanges, OnDestroy {
  private readonly resenaService = inject(ResenaService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private solicitud?: Subscription;

  @Input({ required: true }) idUsuario!: number;
  @Input() pestanaActiva: 'sobreTi' | 'escritas' = 'escritas';
  @Output() pestanaActivaChange = new EventEmitter<'sobreTi' | 'escritas'>();

  resenas: ResenasPerfil | null = null;
  errorCarga = '';
  cargando = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idUsuario']) {
      this.cargarResenas();
    }
  }

  ngOnDestroy(): void {
    this.solicitud?.unsubscribe();
  }

  cargarResenas(): void {
    this.solicitud?.unsubscribe();
    this.resenas = null;
    this.errorCarga = '';
    this.cargando = true;

    this.solicitud = this.resenaService.obtenerResenasDePerfil(this.idUsuario).subscribe({
      next: resenas => {
        this.resenas = resenas;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: error => {
        this.errorCarga = error.status === 401
          ? 'Vuelve a iniciar sesión para ver tus reseñas.'
          : 'No se pudieron cargar tus reseñas.';
        this.cargando = false;
        this.changeDetector.markForCheck();
      }
    });
  }
}
