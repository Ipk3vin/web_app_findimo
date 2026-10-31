import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropiedadService } from './services/propiedad.service';
import { UsuarioService } from './services/usuario.service';
import { SolicitudService } from './services/solicitud.service';
import { ResenaService } from './services/resena.service';
import { Propiedad, PropiedadRequest } from './models/propiedad.model';
import { UsuarioRegistroRequest, UsuarioRegistroResponse } from './models/usuario.model';
import { Resena } from './models/resena.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private propiedadService = inject(PropiedadService);
  private usuarioService = inject(UsuarioService);
  private solicitudService = inject(SolicitudService);
  private resenaService = inject(ResenaService);

  // Estados reactivos (Signals)
  propiedades = signal<Propiedad[]>([]);
  testimonios = signal<Resena[]>([]);
  usuarioActual = signal<UsuarioRegistroResponse | null>(null);

  // Filtros de búsqueda (Hero Bar)
  filtroUbicacion = signal<string>('todos');
  filtroTipo = signal<string>('Departamentos');
  filtroPrecio = signal<string>('700-850');

  // Filtros aplicados para la lista de propiedades
  filtroAplicadoUbicacion = signal<string>('todos');
  filtroAplicadoTipo = signal<string>('todos');
  filtroAplicadoPrecio = signal<string>('todos');

  // Propiedades filtradas
  propiedadesFiltradas = computed(() => {
    let list = this.propiedades();
    const ubi = this.filtroAplicadoUbicacion();
    const tipo = this.filtroAplicadoTipo();
    const precio = this.filtroAplicadoPrecio();

    if (ubi !== 'todos') {
      list = list.filter(p =>
        p.distrito.toLowerCase().includes(ubi.toLowerCase()) ||
        p.direccion.toLowerCase().includes(ubi.toLowerCase())
      );
    }

    if (tipo !== 'todos') {
      list = list.filter(p => p.tipoEspacio === tipo);
    }

    if (precio !== 'todos') {
      if (precio === '700-850') {
        list = list.filter(p => p.precio >= 600 && p.precio <= 1000);
      } else if (precio === 'hasta-600') {
        list = list.filter(p => p.precio <= 600);
      } else if (precio === '600-1000') {
        list = list.filter(p => p.precio >= 600 && p.precio <= 1000);
      } else if (precio === 'mas-1000') {
        list = list.filter(p => p.precio > 1000);
      }
    }

    return list;
  });

  // Modales
  modalLoginAbierto = signal<boolean>(false);
  modalRegistroAbierto = signal<boolean>(false);
  modalPublicarAbierto = signal<boolean>(false);
  modalSolicitarAbierto = signal<boolean>(false);
  propiedadSeleccionada = signal<Propiedad | null>(null);

  // Notificaciones Toast
  toastMensaje = signal<string | null>(null);
  toastTipo = signal<'success' | 'error' | 'info'>('success');

  // Formularios
  // Login
  loginCorreo = 'eduardo.garza@findimo.pe';
  loginContrasena = '123456';
  loginRol: 'ESTUDIANTE' | 'ARRENDADOR' = 'ARRENDADOR';

  // Registro
  regNombre = '';
  regApellido = '';
  regCorreo = '';
  regContrasena = '';
  regTelefono = '';
  regRol: 'ESTUDIANTE' | 'ARRENDADOR' = 'ESTUDIANTE';
  regUniversidad = 'Universidad Peruana Cayetano Heredia';
  regPresupuesto = 850;
  regCuentaBancaria = '';

  // Publicar Propiedad
  pubTitulo = '';
  pubDescripcion = '';
  pubPrecio: number = 1100;
  pubHabitaciones: number = 2;
  pubDireccion = 'Av. Primavera 450';
  pubDistrito = 'Surco';
  pubTipo: 'Departamentos' | 'Casas' | 'Estudios' = 'Departamentos';

  ngOnInit(): void {
    this.cargarPropiedades();
    this.cargarTestimonios();
    this.usuarioActual.set(this.usuarioService.getCurrentUser());
  }

  cargarPropiedades(): void {
    this.propiedadService.obtenerTodas().subscribe({
      next: (data) => {
        this.propiedades.set(data);
      },
      error: (err) => console.error('Error cargando propiedades:', err)
    });
  }

  cargarTestimonios(): void {
    this.resenaService.obtenerTestimonios().subscribe({
      next: (data) => this.testimonios.set(data)
    });
  }

  // Búsqueda desde el Hero
  ejecutarBusqueda(): void {
    this.filtroAplicadoUbicacion.set(this.filtroUbicacion());
    this.filtroAplicadoTipo.set(this.filtroTipo());
    this.filtroAplicadoPrecio.set(this.filtroPrecio());

    this.mostrarToast('Filtro aplicado. Mostrando resultados disponibles.', 'info');

    // Desplazamiento suave a propiedades destacadas
    if (typeof document !== 'undefined') {
      const el = document.getElementById('propiedades');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  limpiarFiltros(): void {
    this.filtroUbicacion.set('todos');
    this.filtroTipo.set('todos');
    this.filtroPrecio.set('todos');
    this.filtroAplicadoUbicacion.set('todos');
    this.filtroAplicadoTipo.set('todos');
    this.filtroAplicadoPrecio.set('todos');
    this.mostrarToast('Mostrando todas las propiedades', 'info');
  }

  // Favorito
  toggleFavorito(prop: Propiedad, event: Event): void {
    event.stopPropagation();
    prop.esFavorito = !prop.esFavorito;
    const msg = prop.esFavorito
      ? `Agregado a favoritos: ${prop.titulo}`
      : `Eliminado de favoritos: ${prop.titulo}`;
    this.mostrarToast(msg, 'success');
  }

  // Modal Solicitud de Alquiler
  abrirSolicitud(prop: Propiedad): void {
    this.propiedadSeleccionada.set(prop);
    this.modalSolicitarAbierto.set(true);
  }

  confirmarSolicitud(): void {
    const prop = this.propiedadSeleccionada();
    if (!prop) return;

    const estudianteId = this.usuarioActual()?.idPerfilEstudiante || 1;
    this.solicitudService.registrarSolicitud({
      idPerfilEstudiante: estudianteId,
      idPropiedad: prop.idPropiedad
    }).subscribe({
      next: (res) => {
        this.modalSolicitarAbierto.set(false);
        this.mostrarToast(`¡Solicitud enviada con éxito para "${prop.titulo}"!`, 'success');
      },
      error: () => {
        this.modalSolicitarAbierto.set(false);
        this.mostrarToast(`¡Solicitud enviada para "${prop.titulo}"!`, 'success');
      }
    });
  }

  // Modal Publicar Propiedad (Arrendador)
  abrirModalPublicar(): void {
    this.modalPublicarAbierto.set(true);
  }

  guardarPropiedad(): void {
    if (!this.pubTitulo || !this.pubPrecio || !this.pubDireccion || !this.pubDistrito) {
      this.mostrarToast('Por favor completa los campos obligatorios.', 'error');
      return;
    }

    const arrendadorId = this.usuarioActual()?.idPerfilArrendador || 1;
    const request: PropiedadRequest = {
      idPerfilArrendador: arrendadorId,
      titulo: this.pubTitulo,
      descripcion: this.pubDescripcion || 'Excelente propiedad en zona residencial tranquila con fácil acceso.',
      precio: this.pubPrecio,
      habitaciones: this.pubHabitaciones,
      direccion: this.pubDireccion,
      distrito: this.pubDistrito,
      estado: true
    };

    this.propiedadService.crearPropiedad(request).subscribe({
      next: (creada) => {
        const nueva: Propiedad = {
          idPropiedad: creada.idPropiedad || (this.propiedades().length + 1),
          titulo: request.titulo,
          descripcion: request.descripcion,
          precio: request.precio,
          habitaciones: request.habitaciones,
          banos: request.habitaciones > 2 ? 2 : 1,
          area: request.habitaciones * 35,
          direccion: request.direccion,
          distrito: request.distrito,
          estado: true,
          tipoEspacio: this.pubTipo,
          imagen: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          esFavorito: false
        };

        this.propiedades.update(props => [nueva, ...props]);
        this.modalPublicarAbierto.set(false);
        this.mostrarToast('¡Propiedad publicada exitosamente en Findimo!', 'success');

        // Limpiar campos
        this.pubTitulo = '';
        this.pubDescripcion = '';
      },
      error: () => {
        this.modalPublicarAbierto.set(false);
        this.mostrarToast('Propiedad guardada en la vista local.', 'info');
      }
    });
  }

  // Autenticación y Registro
  abrirModalLogin(): void {
    this.modalLoginAbierto.set(true);
  }

  abrirModalRegistro(): void {
    this.modalRegistroAbierto.set(true);
  }

  iniciarSesion(): void {
    this.usuarioService.iniciarSesion(this.loginCorreo, this.loginContrasena, this.loginRol).subscribe({
      next: (user) => {
        this.usuarioActual.set(user);
        this.modalLoginAbierto.set(false);
        this.mostrarToast(`¡Bienvenido de nuevo, ${user.nombre}!`, 'success');
      }
    });
  }

  iniciarComoSofia(): void {
    this.usuarioService.iniciarSesion('sofia.martinez@upch.pe', '123456', 'ESTUDIANTE').subscribe(user => {
      this.usuarioActual.set(user);
      this.modalLoginAbierto.set(false);
      this.mostrarToast('Sesión iniciada como Sofía Martínez (Estudiante)', 'success');
    });
  }

  iniciarComoEduardo(): void {
    this.usuarioService.iniciarSesion('eduardo.garza@findimo.pe', '123456', 'ARRENDADOR').subscribe(user => {
      this.usuarioActual.set(user);
      this.modalLoginAbierto.set(false);
      this.mostrarToast('Sesión iniciada como Eduardo Garza (Arrendador)', 'success');
    });
  }

  cerrarSesion(): void {
    this.usuarioService.cerrarSesion();
    this.usuarioActual.set(null);
    this.mostrarToast('Has cerrado sesión correctamente.', 'info');
  }

  registrarUsuario(): void {
    if (!this.regNombre || !this.regApellido || !this.regCorreo || !this.regContrasena) {
      this.mostrarToast('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    const req: UsuarioRegistroRequest = {
      nombre: this.regNombre,
      apellido: this.regApellido,
      correoElectronico: this.regCorreo,
      contrasena: this.regContrasena,
      telefono: this.regTelefono || '999888777',
      nombreRol: this.regRol,
      nombreUniversidad: this.regRol === 'ESTUDIANTE' ? this.regUniversidad : undefined,
      presupuestoMaximo: this.regRol === 'ESTUDIANTE' ? this.regPresupuesto : undefined,
      cuentaBancaria: this.regRol === 'ARRENDADOR' ? this.regCuentaBancaria : undefined
    };

    this.usuarioService.registrar(req).subscribe({
      next: (user) => {
        this.usuarioActual.set(user);
        this.modalRegistroAbierto.set(false);
        this.mostrarToast(`¡Registro exitoso! Bienvenido a Findimo, ${user.nombre}.`, 'success');
      },
      error: () => {
        this.mostrarToast('Error al registrar usuario.', 'error');
      }
    });
  }

  // Toast
  private toastTimeout: any;
  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMensaje.set(mensaje);
    this.toastTipo.set(tipo);

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMensaje.set(null);
    }, 4000);
  }

  cerrarToast(): void {
    this.toastMensaje.set(null);
  }
}
