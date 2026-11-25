import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './modal-auth.component.html',
  styleUrl: './modal-auth.component.css'
})

export class ModalAuthComponent {
  @Input() modalLoginAbierto: boolean = false;
  @Input() modalRegistroAbierto: boolean = false;
  @Input() registrandoUsuario = false;

  // Formulario Login (Solo Correo y Contraseña conectados a la BD)
  @Input() loginCorreo: string = '';
  @Output() loginCorreoChange = new EventEmitter<string>();

  @Input() loginContrasena: string = '';
  @Output() loginContrasenaChange = new EventEmitter<string>();

  // Formulario Registro
  @Input() regNombre: string = '';
  @Output() regNombreChange = new EventEmitter<string>();

  @Input() regApellido: string = '';
  @Output() regApellidoChange = new EventEmitter<string>();

  @Input() regCorreo: string = '';
  @Output() regCorreoChange = new EventEmitter<string>();

  @Input() regContrasena: string = '';
  @Output() regContrasenaChange = new EventEmitter<string>();

  @Input() regTelefono: string = '';
  @Output() regTelefonoChange = new EventEmitter<string>();

  @Input() regRol: 'ESTUDIANTE' | 'ARRENDADOR' = 'ESTUDIANTE';
  @Output() regRolChange = new EventEmitter<'ESTUDIANTE' | 'ARRENDADOR'>();

  @Input() regUniversidad: string = '';
  @Output() regUniversidadChange = new EventEmitter<string>();

  @Input() regPresupuesto: number = 850;
  @Output() regPresupuestoChange = new EventEmitter<number>();

  @Input() regCuentaBancaria: string = '';
  @Output() regCuentaBancariaChange = new EventEmitter<string>();

  // Eventos de control y cambio entre modales
  @Output() cerrarLogin = new EventEmitter<void>();
  @Output() cerrarRegistro = new EventEmitter<void>();
  @Output() abrirLogin = new EventEmitter<void>();
  @Output() abrirRegistro = new EventEmitter<void>();
  @Output() iniciarSesion = new EventEmitter<void>();
  @Output() registrarUsuario = new EventEmitter<void>();
}
