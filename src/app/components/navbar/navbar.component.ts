import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioRegistroResponse } from '../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() vistaActual: 'inicio' | 'busqueda' | 'detalle' | 'perfil' | 'resenas' = 'inicio';
  @Input() usuarioActual: UsuarioRegistroResponse | null = null;
  @Input() menuUsuarioAbierto: boolean = false;

  @Output() irAInicio = new EventEmitter<void>();
  @Output() irABusqueda = new EventEmitter<void>();
  @Output() irAPerfil = new EventEmitter<'resumen' | 'detalle'>();
  @Output() irAResenas = new EventEmitter<'sobreTi' | 'escritas'>();
  @Output() toggleMenuUsuario = new EventEmitter<void>();
  @Output() abrirLogin = new EventEmitter<void>();
  @Output() abrirRegistro = new EventEmitter<void>();
  @Output() abrirPublicar = new EventEmitter<void>();
  @Output() cerrarSesion = new EventEmitter<void>();
}
