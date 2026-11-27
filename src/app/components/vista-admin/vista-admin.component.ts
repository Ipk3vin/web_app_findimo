import { ORIGEN_API } from '../../services/origen-api';
import { HttpClient } from '@angular/common/http';
import { Component, computed, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { Observable, retry, throwError, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const SECCIONES = [
  { id: 'resumen', titulo: 'Resumen', columnas: [] },
  { id: 'usuarios', titulo: 'Usuarios', columnas: [
    ['id', 'ID'], ['nombre', 'Nombre'], ['correo', 'Correo'], ['rol', 'Rol'], ['estado', 'Estado']
  ] },
  { id: 'propiedades', titulo: 'Propiedades', columnas: [
    ['id', 'ID'], ['titulo', 'Vivienda'], ['distrito', 'Distrito'], ['precio', 'Precio (S/)'], ['estado', 'Estado']
  ] },
  { id: 'alquileres', titulo: 'Alquileres', columnas: [
    ['id', 'ID'], ['titulo', 'Vivienda'], ['estudiante', 'Estudiante'], ['estado', 'Solicitud'],
    ['reserva', 'Reserva'], ['fecha', 'Fecha']
  ] },
  { id: 'resenas', titulo: 'Reseñas', columnas: [
    ['id', 'ID'], ['autor', 'Autor'], ['destino', 'Destino'], ['calificacion', 'Nota / 5'],
    ['comentario', 'Comentario'], ['estado', 'Estado']
  ] },
  { id: 'reportes', titulo: 'Reportes', columnas: [] },
  { id: 'administradores', titulo: 'Administradores', columnas: [
    ['id', 'ID'], ['correo', 'Correo'], ['rol', 'Nivel'], ['estado', 'Estado']
  ] },
  { id: 'auditoria', titulo: 'Auditoría', columnas: [
    ['fecha', 'Fecha'], ['evento', 'Qué pasó'], ['cuenta', 'Cuenta asociada'], ['id_cuenta', 'ID de cuenta'], ['registro', 'Registro afectado'], ['cambio', 'Cambio de estado']
  ] }
] as const;

const CORREO_SUPREMO = 'adminsupremo@upc.edu.pe';

const ACCIONES = {
  usuarios: { estadoInactivo: 'Inactiva', retirar: 'Desactivar', restaurar: 'Reactivar' },
  propiedades: { estadoInactivo: 'Retirada', retirar: 'Retirar', restaurar: 'Restaurar' },
  resenas: { estadoInactivo: 'Oculta', retirar: 'Ocultar', restaurar: 'Restaurar' }
} as const;

const REPORTES = [
  {
    id: 'solicitudes', titulo: 'Solicitudes por atender', destino: SECCIONES[3],
    descripcion: 'Identifica cuántas solicitudes de alquiler esperan respuesta del arrendador.',
    columnas: [['grupo', 'Estado de la solicitud'], ['total', 'Solicitudes']]
  },
  {
    id: 'reservas', titulo: 'Seguimiento de reservas', destino: SECCIONES[3],
    descripcion: 'Revisa qué reservas están pendientes de confirmación, cuáles siguen confirmadas y cuáles finalizaron.',
    columnas: [['grupo', 'Estado de la reserva'], ['total', 'Reservas']]
  },
  {
    id: 'viviendas', titulo: 'Disponibilidad por distrito', destino: SECCIONES[2],
    descripcion: 'Identifica dónde quedan viviendas disponibles. Las viviendas retiradas se cuentan por separado.',
    columnas: [['grupo', 'Distrito'], ['disponibles', 'Disponibles'], ['reservadas', 'Reservadas'],
      ['retiradas', 'Retiradas'], ['total', 'Total']]
  },
  {
    id: 'resenas', titulo: 'Moderación de reseñas', destino: SECCIONES[4],
    descripcion: 'Consulta cuántas reseñas están visibles u ocultas y abre Reseñas para revisar cada caso.',
    columnas: [['grupo', 'Tipo de reseña'], ['visibles', 'Visibles'], ['ocultas', 'Ocultas'], ['total', 'Total']]
  }
] as const;

type Seccion = typeof SECCIONES[number];
type Fila = Record<string, string | number | null>;
interface PaginaAdmin {
  filas: Fila[];
  haySiguiente: boolean;
}

@Component({
  selector: 'app-vista-admin',
  templateUrl: './vista-admin.component.html',
  styleUrl: './vista-admin.component.css'
})
export class VistaAdminComponent implements OnInit {
  readonly nombre = input.required<string>();
  readonly idCuenta = input.required<number>();
  readonly correoCuenta = input.required<string>();
  readonly esSupremo = computed(() => this.correoCuenta().trim().toLowerCase() === CORREO_SUPREMO);
  readonly salir = output<void>();
  readonly secciones = computed(() => SECCIONES.filter(item => item.id !== 'administradores' || this.esSupremo()));
  readonly errorNuevaCuenta = signal('');
  readonly cuentaContrasena = signal<number | null>(null);
  readonly errorContrasena = signal('');
  readonly seccion = signal<Seccion>(SECCIONES[0]);
  readonly pagina = signal(0);
  readonly busqueda = signal('');
  readonly reportes = REPORTES;
  readonly reporte = computed(() => REPORTES.find(item => item.id === this.busqueda()) ?? REPORTES[0]);
  readonly columnas = computed(() => this.seccion().id === 'reportes' ? this.reporte().columnas : this.seccion().columnas);
  readonly datos = signal<PaginaAdmin | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly cambiandoEstado = signal(false);
  readonly mensajeEstado = signal('');
  readonly accesoDenegado = signal(false);

  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.cargar(this.seccion());
  }

  cargar(seccion: Seccion, pagina = 0, buscar = ''): void {
    if (this.cargando() || this.cambiandoEstado() || this.accesoDenegado()) return;
    this.mensajeEstado.set('');
    this.errorNuevaCuenta.set('');
    this.cerrarCambioContrasena();
    this.seccion.set(seccion);
    this.pagina.set(pagina);
    this.busqueda.set(seccion.id === 'reportes' ? buscar || REPORTES[0].id : buscar.trim());
    this.datos.set(null);
    this.error.set('');
    this.cargando.set(true);
    this.http.get<PaginaAdmin>(`${ORIGEN_API}/api/admin/${seccion.id}`, {
      withCredentials: true, params: { pagina, buscar: this.busqueda() }
    }).pipe(
      retry({
        count: 2,
        delay: error => [0, 502, 503, 504].includes(error.status) ? timer(750) : throwError(() => error)
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: datos => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: error => {
        this.cargando.set(false);
        this.accesoDenegado.set(error.status === 401 || error.status === 403);
        this.error.set(this.accesoDenegado()
          ? 'Tu sesión ya no tiene acceso al panel. Cierra sesión e ingresa de nuevo.'
          : error.status === 0
            ? 'No se pudo conectar con el servidor. Comprueba que esté iniciado y reintenta.'
            : seccion.id === 'auditoria'
              ? 'El servidor no pudo cargar el historial de Auditoría. Vuelve a intentarlo.'
              : 'No se pudo cargar esta sección.');
      }
    });
  }

  accionEstado() {
    const seccion = this.seccion().id;
    if (seccion === 'administradores') {
      return { estadoInactivo: 'Inactiva', retirar: 'Dar de baja', restaurar: 'Reactivar' };
    }
    return seccion === 'usuarios' || seccion === 'propiedades' || seccion === 'resenas' ? ACCIONES[seccion] : null;
  }

  esCuentaSuprema(fila: Fila): boolean {
    return String(fila['correo'] ?? '').trim().toLowerCase() === CORREO_SUPREMO;
  }

  puedeCambiarCuenta(fila: Fila): boolean {
    return fila['id'] !== this.idCuenta() && !this.esCuentaSuprema(fila)
      && (fila['rol'] !== 'ADMINISTRADOR' || this.esSupremo());
  }

  crearAdministrador(formulario: HTMLFormElement, correo: string, contrasena: string, confirmacion: string): void {
    if (!this.esSupremo() || this.cargando() || this.cambiandoEstado() || this.accesoDenegado()) return;
    this.errorNuevaCuenta.set('');
    this.mensajeEstado.set('');
    if (contrasena !== confirmacion) {
      this.errorNuevaCuenta.set('Las contraseñas no coinciden.');
      return;
    }

    this.procesarCambio(this.http.post<void>(`${ORIGEN_API}/api/admin/administradores`,
      { correo: correo.trim(), contrasena, confirmacion }, { withCredentials: true }), () => formulario.reset());
  }

  puedeCambiarContrasena(fila: Fila): boolean {
    return this.puedeCambiarCuenta(fila)
      || (this.esSupremo() && fila['id'] === this.idCuenta() && this.esCuentaSuprema(fila));
  }

  abrirCambioContrasena(fila: Fila): void {
    const id = fila['id'];
    if (typeof id !== 'number' || !this.puedeCambiarContrasena(fila)) return;
    this.errorContrasena.set('');
    this.cuentaContrasena.set(id);
  }

  cerrarCambioContrasena(): void {
    this.errorContrasena.set('');
    this.cuentaContrasena.set(null);
  }

  guardarContrasena(fila: Fila, contrasena: string, confirmacion: string): void {
    const id = fila['id'];
    if (typeof id !== 'number' || id !== this.cuentaContrasena() || !this.puedeCambiarContrasena(fila)
        || this.cambiandoEstado() || this.accesoDenegado()) return;

    this.mensajeEstado.set('');
    if (contrasena !== confirmacion) {
      this.errorContrasena.set('Las contraseñas no coinciden.');
      return;
    }

    this.errorContrasena.set('');
    this.cambiandoEstado.set(true);
    this.http.patch<void>(`${ORIGEN_API}/api/admin/usuarios/${id}/contrasena`,
      { contrasena, confirmacion }, { withCredentials: true })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.cambiandoEstado.set(false);
          this.cerrarCambioContrasena();
          this.mensajeEstado.set('Contraseña cambiada. El cambio quedó en Auditoría.');
        },
        error: error => {
          this.cambiandoEstado.set(false);
          this.errorContrasena.set(error.status === 401 || error.status === 403
            ? 'Tu cuenta no tiene permiso para cambiar esta contraseña.'
            : error.status === 400 ? 'Ingresa una contraseña de hasta 72 bytes y confírmala.'
              : 'No se pudo cambiar la contraseña.');
        }
      });
  }

  cambiarEstado(fila: Fila): void {
    const id = fila['id'];
    const seccion = this.seccion();
    const accion = this.accionEstado();
    if (!accion || typeof id !== 'number' || this.cambiandoEstado() || this.accesoDenegado()
        || ((seccion.id === 'usuarios' || seccion.id === 'administradores') && !this.puedeCambiarCuenta(fila))) return;

    const activo = fila['estado'] === accion.estadoInactivo;
    if (!activo && fila['rol'] === 'ADMINISTRADOR' && !window.confirm('¿Dar de baja a este administrador secundario?')) return;
    const recurso = seccion.id === 'administradores' ? 'usuarios' : seccion.id;
    this.procesarCambio(this.http.patch<void>(`${ORIGEN_API}/api/admin/${recurso}/${id}/estado`,
      { activo }, { withCredentials: true }));
  }

  private procesarCambio(solicitud: Observable<void>, despuesDeCrear?: () => void): void {
    const seccion = this.seccion();
    this.mensajeEstado.set('');
    this.cambiandoEstado.set(true);
    solicitud.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.cambiandoEstado.set(false);
        despuesDeCrear?.();
        this.cargar(seccion, despuesDeCrear ? 0 : this.pagina(), this.busqueda());
        this.mensajeEstado.set('Cambio guardado en Auditoría.');
      },
      error: error => {
        this.cambiandoEstado.set(false);
        this.accesoDenegado.set(error.status === 401 || error.status === 403);
        const mensaje = this.accesoDenegado()
          ? 'Tu sesión ya no tiene acceso al panel. Cierra sesión e ingresa de nuevo.'
          : despuesDeCrear && error.status === 409 ? 'El correo ya está registrado.'
          : despuesDeCrear && error.status === 400 ? 'Ingresa un correo completo (por ejemplo, nombre@upc.edu.pe) y una contraseña de hasta 72 bytes.'
          : 'No se pudo guardar el cambio.';
        (despuesDeCrear ? this.errorNuevaCuenta : this.mensajeEstado).set(mensaje);
      }
    });
  }

  mostrarCelda(fila: Fila, clave: string): string | number {
    const valor = fila[clave];
    if (clave === 'rol' && valor === 'ADMINISTRADOR') {
      return this.esCuentaSuprema(fila) ? 'Administrador supremo' : 'Administrador secundario';
    }
    if (clave === 'fecha' && typeof valor === 'string') {
      return valor.slice(0, 10).split('-').reverse().join('/');
    }
    return valor ?? '—';
  }
}
