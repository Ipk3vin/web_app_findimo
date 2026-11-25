import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModoCuenta, UsuarioRegistroResponse } from '../../models/usuario.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() vistaActual: 'inicio' | 'busqueda' | 'detalle' | 'perfil' | 'resenas' | 'favoritos' | 'mensajes' | 'mis-viviendas' | 'comparacion' = 'inicio';
  @Input() modoCuenta: ModoCuenta | null = null;
  @Input() usuarioActual: UsuarioRegistroResponse | null = null;
  @Input() menuUsuarioAbierto: boolean = false;

  @Output() elegirModo = new EventEmitter<ModoCuenta>();
  @Output() irAComparacion = new EventEmitter<void>();
  @Output() irAFavoritos = new EventEmitter<void>();
  @Output() irAInicio = new EventEmitter<void>();
  @Output() irABusqueda = new EventEmitter<void>();
  @Output() irAPerfil = new EventEmitter<void>();
  @Output() irAMensajes = new EventEmitter<void>();
  @Output() irAMisViviendas = new EventEmitter<void>();
  @Output() toggleMenuUsuario = new EventEmitter<void>();
  @Output() abrirLogin = new EventEmitter<void>();
  @Output() abrirRegistro = new EventEmitter<void>();
  @Output() abrirRegistroEstudiante = new EventEmitter<void>();
  @Output() abrirRegistroAnfitrion = new EventEmitter<void>();
  @Output() abrirPublicar = new EventEmitter<void>();
  @Output() cerrarSesion = new EventEmitter<void>();
}
