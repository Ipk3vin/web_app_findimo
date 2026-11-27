import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioRegistroResponse } from '../../models/usuario.model';

import { VistaResenasComponent } from '../vista-resenas/vista-resenas.component';

export type SeccionPerfil = 'sobreMi' | 'personal' | 'seguridad' | 'resenas';

@Component({
  selector: 'app-vista-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, VistaResenasComponent],
  templateUrl: './vista-perfil.component.html',
  styleUrl: './vista-perfil.component.css'
})
export class VistaPerfilComponent implements OnChanges {
  @Input() usuarioActual: UsuarioRegistroResponse | null = null;
  @Input() seccionActiva: SeccionPerfil = 'sobreMi';
  @Input() pestanaResenas: 'sobreTi' | 'escritas' = 'escritas';

  @Output() seccionActivaChange = new EventEmitter<SeccionPerfil>();
  @Output() pestanaResenasChange = new EventEmitter<'sobreTi' | 'escritas'>();
  @Output() perfilActualizado = new EventEmitter<UsuarioRegistroResponse>();
  @Output() mostrarToast = new EventEmitter<{ mensaje: string; tipo: 'success' | 'error' | 'info' }>();

  readonly secciones: ReadonlyArray<{ id: SeccionPerfil; titulo: string }> = [
    { id: 'sobreMi', titulo: 'Información sobre mí' },
    { id: 'personal', titulo: 'Información personal' },
    { id: 'seguridad', titulo: 'Inicio de sesión y seguridad' },
    { id: 'resenas', titulo: 'Reseñas' }
  ];

  get tituloSeccion(): string {
    return this.secciones.find(seccion => seccion.id === this.seccionActiva)?.titulo ?? 'Perfil';
  }

  private readonly usuarioService = inject(UsuarioService);
  private readonly destroyRef = inject(DestroyRef);
  readonly editandoContrasena = signal(false);
  readonly guardandoContrasena = signal(false);
  readonly errorContrasena = signal('');

  campoEditando: 'nombre' | 'correo' | 'telefono' | null = null;

  editNombre: string = '';
  editApellido: string = '';
  editCorreo: string = '';
  editTelefono: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seccionActiva']) {
      this.campoEditando = null;
      this.cerrarContrasena();
    }
    if (changes['usuarioActual'] || changes['seccionActiva']) {
      this.sincronizarCampos();
    }
  }

  sincronizarCampos(): void {
    if (this.usuarioActual) {
      this.editNombre = this.usuarioActual.nombre ?? '';
      this.editApellido = this.usuarioActual.apellido ?? '';
      this.editCorreo = this.usuarioActual.correoElectronico || 'p***5@gmail.com';
      this.editTelefono = this.usuarioActual.telefono || '+51 987 654 390';
    } else {
      this.editNombre = '';
      this.editApellido = '';
      this.editCorreo = 'p***5@gmail.com';
      this.editTelefono = '+51 987 654 390';
    }
  }

  obtenerNombreCompleto(): string {
    return `${this.usuarioActual?.nombre ?? ''} ${this.usuarioActual?.apellido ?? ''}`.trim();
  }

  obtenerInicial(): string {
    return this.obtenerNombreCompleto().charAt(0).toUpperCase() || '?';
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

  seleccionarSeccion(seccion: SeccionPerfil): void {
    this.seccionActivaChange.emit(seccion);
  }

  guardarCampo(campo: 'nombre' | 'correo' | 'telefono'): void {
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

  cerrarContrasena(): void {
    this.editandoContrasena.set(false);
    this.errorContrasena.set('');
  }

  guardarContrasena(contrasena: string): void {
    if (this.guardandoContrasena()) return;
    this.errorContrasena.set('');
    this.guardandoContrasena.set(true);
    this.usuarioService.actualizarContrasena(contrasena).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.guardandoContrasena.set(false);
        this.cerrarContrasena();
        this.mostrarToast.emit({ mensaje: 'Contraseña actualizada.', tipo: 'success' });
      },
      error: error => {
        this.guardandoContrasena.set(false);
        this.errorContrasena.set(error.status === 401 || error.status === 403
          ? 'Vuelve a iniciar sesión para actualizar la contraseña.'
          : error.status === 400 ? 'Ingresa una contraseña de hasta 72 bytes.'
            : 'No se pudo actualizar la contraseña.');
      }
    });
  }
}
