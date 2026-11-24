import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  @Input() toastMensaje: string | null = null;
  @Input() toastTipo: 'success' | 'error' | 'info' = 'success';
  @Output() cerrarToast = new EventEmitter<void>();
}
