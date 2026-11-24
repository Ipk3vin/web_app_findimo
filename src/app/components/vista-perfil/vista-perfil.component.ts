import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioRegistroResponse } from '../../models/usuario.model';

@Component({
  selector: 'app-vista-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vista-perfil.component.html',
  styleUrl: './vista-perfil.component.css'
})
export class VistaPerfilComponent implements OnInit {
  @Input() usuarioActual: UsuarioRegistroResponse | null = null;
  @Input() modoInicial: 'resumen' | 'detalle' = 'resumen';

  @Output() irAResenas = new EventEmitter<'sobreTi' | 'escritas'>();
  @Output() perfilActualizado = new EventEmitter<UsuarioRegistroResponse>();
  @Output() mostrarToast = new EventEmitter<{ mensaje: string; tipo: 'success' | 'error' | 'info' }>();

  modoEdicion: 'resumen' | 'detalle' = 'resumen';
  tabLateral: 'sobreMi' | 'conexiones' = 'sobreMi';
  tabConfiguracion: 'personal' | 'seguridad' = 'personal';

  campoEditando: 'nombre' | 'preferido' | 'correo' | 'telefono' | null = null;

  editNombre: string = '';
  editApellido: string = '';
  editNombrePreferido: string = '';
  editCorreo: string = '';
  editTelefono: string = '';

  ngOnInit(): void {
    this.modoEdicion = this.modoInicial;
    this.sincronizarCampos();
  }

  ngOnChanges(): void {
    this.sincronizarCampos();
  }

  sincronizarCampos(): void {
    if (this.usuarioActual) {
      this.editNombre = this.usuarioActual.nombre || 'Kevin Arturo';
      this.editApellido = this.usuarioActual.apellido || 'Palomino Ilacupe';
      this.editCorreo = this.usuarioActual.correoElectronico || 'p***5@gmail.com';
      this.editTelefono = this.usuarioActual.telefono || '+51 987 654 390';
    } else {
      this.editNombre = 'Kevin Arturo';
      this.editApellido = 'Palomino Ilacupe';
      this.editCorreo = 'p***5@gmail.com';
      this.editTelefono = '+51 987 654 390';
    }
  }

  obtenerNombreCompleto(): string {
    if (this.usuarioActual && (this.usuarioActual.nombre || this.usuarioActual.apellido)) {
      return `${this.usuarioActual.nombre || ''} ${this.usuarioActual.apellido || ''}`.trim();
    }
    return `${this.editNombre} ${this.editApellido}`.trim() || 'Kevin Arturo Palomino Ilacupe';
  }

  obtenerInicial(): string {
    const nombre = this.obtenerNombreCompleto();
    return nombre ? nombre.charAt(0).toUpperCase() : 'K';
  }

  obtenerCorreo(): string {
    return this.usuarioActual?.correoElectronico || this.editCorreo || 'p***5@gmail.com';
  }

  obtenerTelefono(): string {
    return this.usuarioActual?.telefono || this.editTelefono || '+51 987 654 390';
  }

  ocultarCorreo(correo: string): string {
    if (!correo) return 'p***5@gmail.com';
    if (correo.includes('***')) return correo;
    const parts = correo.split('@');
    if (parts.length === 2) {
      const user = parts[0];
      const masked = user.length > 2 ? `${user.charAt(0)}***${user.charAt(user.length - 1)}` : `${user}***`;
      return `${masked}@${parts[1]}`;
    }
    return correo;
  }

  formatearTelefono(tel: string): string {
    if (!tel) return '+51 *** **5 390';
    if (tel.includes('*')) return tel;
    if (tel.length >= 9) {
      return `+51 *** **${tel.slice(-4, -3)} ${tel.slice(-3)}`;
    }
    return tel;
  }

  activarEdicion(): void {
    this.modoEdicion = 'detalle';
    this.tabConfiguracion = 'personal';
  }

  guardarYFinalizar(): void {
    this.modoEdicion = 'resumen';
    this.campoEditando = null;
    this.mostrarToast.emit({
      mensaje: 'Cambios del perfil guardados correctamente',
      tipo: 'success'
    });
  }

  guardarCampo(campo: 'nombre' | 'preferido' | 'correo' | 'telefono'): void {
    if (this.usuarioActual) {
      if (campo === 'nombre') {
        this.usuarioActual.nombre = this.editNombre;
        this.usuarioActual.apellido = this.editApellido;
      } else if (campo === 'correo') {
        this.usuarioActual.correoElectronico = this.editCorreo;
      } else if (campo === 'telefono') {
        this.usuarioActual.telefono = this.editTelefono;
      }
      this.perfilActualizado.emit(this.usuarioActual);
    }
    this.campoEditando = null;
    this.mostrarToast.emit({
      mensaje: 'Campo actualizado exitosamente',
      tipo: 'success'
    });
  }

  confirmarDireccion(): void {
    this.mostrarToast.emit({
      mensaje: 'Se ha enviado un enlace de confirmación a tu correo electrónico.',
      tipo: 'info'
    });
  }

  cambiarContrasena(): void {
    this.mostrarToast.emit({
      mensaje: 'Se ha enviado un código para restablecer contraseña a tu celular.',
      tipo: 'info'
    });
  }

  activar2FA(): void {
    this.mostrarToast.emit({
      mensaje: 'Autenticación de dos pasos activada.',
      tipo: 'success'
    });
  }
}
