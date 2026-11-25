import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-foto-vivienda',
  standalone: true,
  styles: ':host { display: contents; }',
  template: `
    @if (fotos?.[indice]; as foto) {
      <img [class]="clase" [src]="foto" [alt]="titulo" loading="lazy" (error)="indice = indice + 1" />
    } @else {
      <span class="room-photo-empty">Sin fotos</span>
    }
  `
})
export class FotoViviendaComponent implements OnChanges {
  @Input() fotos: readonly string[] | undefined;
  @Input() titulo = '';
  @Input() clase = 'room-img';

  indice = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fotos']) this.indice = 0;
  }
}
