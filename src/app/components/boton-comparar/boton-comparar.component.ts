import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-boton-comparar',
  template: `
    <button type="button" [attr.aria-pressed]="seleccionada()"
      [attr.aria-label]="seleccionada() ? 'Quitar de la comparación' : 'Añadir a la comparación'"
      [title]="seleccionada() ? 'Quitar de la comparación' : 'Añadir a la comparación'"
      (click)="alternar.emit()">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <rect x="3" y="5" width="7" height="14" rx="1.5"/>
        <rect x="14" y="5" width="7" height="14" rx="1.5"/>
        <path d="M5 9h3m8 0h3M5 13h3m8 0h3"/>
      </svg>
    </button>
  `,
  styles: `
    button {
      position: absolute;
      top: 12px;
      right: 52px;
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 50%;
      padding: 0;
      color: #173457;
      background: white;
      box-shadow: 0 2px 8px #0002;
      cursor: pointer;
    }

    button:hover { background: #eef7f8; }
    button[aria-pressed="true"] { color: white; background: #007779; }
  `
})
export class BotonCompararComponent {
  readonly seleccionada = input(false);
  readonly alternar = output<void>();
}
