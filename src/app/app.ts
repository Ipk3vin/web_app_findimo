import { FotoViviendaComponent } from './components/foto-vivienda/foto-vivienda.component';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoritoService } from './services/favorito.service';
import { PropiedadService } from './services/propiedad.service';
import { UsuarioService } from './services/usuario.service';
import { SolicitudService } from './services/solicitud.service';
import { ResenaService } from './services/resena.service';
import { CatalogosPropiedad, Propiedad, PropiedadRequest, LugarCercano, TIPOS_ENTORNO } from './models/propiedad.model';
import { ActivarPerfilRequest, ModoCuenta, UsuarioRegistroRequest, UsuarioRegistroResponse } from './models/usuario.model';
import { Resena } from './models/resena.model';

// Componentes modulares
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { VistaInicioComponent } from './components/vista-inicio/vista-inicio.component';
import { VistaBusquedaComponent } from './components/vista-busqueda/vista-busqueda.component';
import { VistaDetalleComponent } from './components/vista-detalle/vista-detalle.component';
import { ModalFiltrosComponent } from './components/modal-filtros/modal-filtros.component';
import { ModalAuthComponent } from './components/modal-auth/modal-auth.component';
import { ModalPublicarComponent } from './components/modal-publicar/modal-publicar.component';
import { ToastComponent } from './components/toast/toast.component';
import { VistaMensajesComponent } from './components/vista-mensajes/vista-mensajes.component';
import { SeccionPerfil, VistaPerfilComponent } from './components/vista-perfil/vista-perfil.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FotoViviendaComponent,
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    VistaInicioComponent,
    VistaBusquedaComponent,
    VistaDetalleComponent,
    VistaPerfilComponent,
    VistaMensajesComponent,
    ModalFiltrosComponent,
    ModalAuthComponent,
    ModalPublicarComponent,
    ToastComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Inyección de dependencias (Dependency Injection - DI) mediante inject()
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly favoritoService = inject(FavoritoService);
  private readonly propiedadService = inject(PropiedadService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly resenaService = inject(ResenaService);

  // Control de navegación dinámica SPA (Single Page Application) sin recarga de página (PDF 1)
  vistaActual: 'inicio' | 'busqueda' | 'detalle' | 'perfil' | 'favoritos' | 'mensajes' | 'mis-viviendas' | 'comparacion' = 'inicio';

  // Sub-estados para Perfil y Reseñas
  seccionPerfil: SeccionPerfil = 'sobreMi';
  pestanaResenas: 'sobreTi' | 'escritas' = 'escritas';

  // Sub-vista de detalle: reseñas de la propiedad seleccionada cargadas desde backend
  resenasPropiedadSeleccionada: Resena[] = [];

  cargandoResenasPropiedad = true;
  errorResenasPropiedad = false;
  private solicitudResenasPropiedad?: Subscription;

  // Lista de propiedades para la sección de comparación (US10 - Comparar propiedades lado a lado)
  idsComparacion: number[] = [];
  readonly tiposEntorno = TIPOS_ENTORNO;

  get propiedadesComparacion(): Propiedad[] {
    const catalogo = this.propiedades;
    return this.idsComparacion.flatMap(id => {
      const vivienda = catalogo.find(prop => prop.idPropiedad === id);
      return vivienda ? [vivienda] : [];
    });
  }
  private idsFavoritos = new Set<number>();
  private favoritosPendientes = new Set<number>();
  cargandoFavoritos = false;
  errorFavoritos = '';
  private favoritosCargados = false;

  get propiedadesFavoritas(): Propiedad[] {
    return this.propiedades.filter(propiedad => this.idsFavoritos.has(propiedad.idPropiedad));
  }

  // Filtros del Hero en la Página de Inicio (Two-way data binding [(ngModel)])
  heroUbicacion: string = 'todos';
  heroTipo: string = 'todos';
  heroPrecio: string = 'todos';

  // Filtros de la Barra de Búsqueda de Cuartos - Figma (Two-way data binding [(ngModel)])
  filtroTipoHabitacion: string = 'todos';
  filtroPrecioMensual: string = 'todos';
  filtroUniversidad: string = 'todas';

  // Patrón MVP (Model-View-Presenter):
  // El componente actúa como Presenter, manteniendo las propiedades de la vista
  propiedades: Propiedad[] = [];
  propiedadesFiltradas: Propiedad[] = [];
  ultimasPropiedades: Propiedad[] = [];
  cargandoPropiedades = true;
  errorCargaPropiedades = false;
  get propiedadesRecomendadas(): Propiedad[] {
    const actual = this.propiedadSeleccionada;
    return this.propiedades
      .filter(propiedad => propiedad.estado && propiedad.idPropiedad !== actual?.idPropiedad)
      .sort((a, b) => Number(b.distrito === actual?.distrito) - Number(a.distrito === actual?.distrito)
        || b.idPropiedad - a.idPropiedad)
      .slice(0, 4);
  }
  usuarioActual: UsuarioRegistroResponse | null = null;
  modoCuenta: ModoCuenta | null = null;
  perfilPorActivar: ModoCuenta | null = null;
  activandoPerfil = false;
  universidadPerfil = '';
  presupuestoPerfil: number | null = null;
  cuentaBancariaPerfil = '';
  errorActivarPerfil = '';

  get puedeSolicitarAlquiler(): boolean {
    if (!this.usuarioActual) return true;
    return this.modoCuenta === 'ESTUDIANTE' && !!this.usuarioActual.idPerfilEstudiante &&
      (!this.usuarioActual.idPerfilArrendador ||
        this.propiedadSeleccionada?.idPerfilArrendador !== this.usuarioActual.idPerfilArrendador);
  }

  // Estados de control para modales e interactividad
  modalLoginAbierto: boolean = false;
  modalRegistroAbierto: boolean = false;
  modalPublicarAbierto: boolean = false;
  modalFiltrosAbierto: boolean = false; // Modal Filtros Avanzados (US15 - Búsqueda avanzada)
  menuUsuarioAbierto: boolean = false;
  propiedadSeleccionada: Propiedad | null = null;

  // Filtros Avanzados (Modal "findimo-modal-filtros" - US15)
  catalogos: CatalogosPropiedad = { tipos: [], servicios: [] };
  cargandoCatalogos = true;
  errorCatalogos = false;
  serviciosSeleccionados: number[] = [];

  // Notificaciones Toast
  toastMensaje: string | null = null;
  toastTipo: 'success' | 'error' | 'info' = 'success';

  // Formularios Template-Driven
  // Login
  loginCorreo: string = '';
  loginContrasena: string = '';

  // Registro
  regNombre: string = '';
  regApellido: string = '';
  regCorreo: string = '';
  regContrasena: string = '';
  regTelefono: string = '';
  regRol: 'ESTUDIANTE' | 'ARRENDADOR' = 'ESTUDIANTE';
  regUniversidad: string = '';
  regPresupuesto: number = 850;
  regCuentaBancaria: string = '';
  registrandoUsuario = false;
  private readonly sesionCerrada = new Subject<void>();

  // Publicar Propiedad
  publicandoPropiedad = false;
  viviendaEditando: Propiedad | null = null;
  pubTitulo: string = '';
  pubDescripcion: string = '';
  pubPrecio: number = 950;
  pubHabitaciones: number = 1;
  pubArea: number | null = null;
  pubDireccion: string = 'Av. Alameda Sur 234';
  pubDistrito: string = 'Chorrillos';
  pubIdTipoPropiedad: number | null = null;
  pubIdsServicios: number[] = [];

  ngOnInit(): void {
    this.usuarioActual = this.usuarioService.getCurrentUser();
    this.restaurarModoCuenta();
    if (typeof sessionStorage !== 'undefined') {
      const guardadas = sessionStorage.getItem('findimo_comparacion') ?? '';
      this.idsComparacion = [...new Set(guardadas.split(',').map(Number))]
        .filter(id => Number.isSafeInteger(id) && id > 0).slice(0, 3);
    }
    this.recuperarVistaGuardada();
    this.cargarPropiedades();
    this.cargarFavoritos();
    this.cargarCatalogos();
  }

  // Recupera la vista actual tras recargar la página (F5 / botón recargar del navegador)
  recuperarVistaGuardada(): void {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const guardada = typeof localStorage !== 'undefined' ? localStorage.getItem('findimo_vista_actual') : null;
      const vistasValidas = ['inicio', 'busqueda', 'detalle', 'perfil', 'resenas', 'favoritos', 'mensajes', 'mis-viviendas', 'comparacion'];
      const vista = vistasValidas.includes(hash) ? hash : guardada;
      if ((!this.usuarioActual && (vista === 'perfil' || vista === 'resenas' || vista === 'favoritos' || vista === 'mensajes'))
          || (vista === 'mis-viviendas' && this.modoCuenta !== 'ARRENDADOR')) {
        this.cambiarVista('inicio');
      } else if (vista === 'resenas') {
        this.vistaActual = 'perfil';
        this.seccionPerfil = 'resenas';
      } else if (vista === 'inicio' || vista === 'busqueda' || vista === 'detalle' || vista === 'perfil' || vista === 'favoritos' || vista === 'mensajes' || vista === 'mis-viviendas' || vista === 'comparacion') {
        this.vistaActual = vista;
      }
    }
  }

  cambiarVista(nuevaVista: 'inicio' | 'busqueda' | 'detalle' | 'perfil' | 'favoritos' | 'mensajes' | 'mis-viviendas' | 'comparacion'): void {
    this.vistaActual = nuevaVista;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('findimo_vista_actual', nuevaVista);
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (nuevaVista === 'detalle' && this.propiedadSeleccionada) {
        url.searchParams.set('propiedad', String(this.propiedadSeleccionada.idPropiedad));
      } else {
        url.searchParams.delete('propiedad');
      }
      url.hash = nuevaVista;
      if (url.href !== window.location.href) window.history.pushState(null, '', url);
    }
  }

  // Métodos de navegación SPA (Single Page Application)
  irAInicio(): void {
    this.cargarPropiedades(); // Refresh latest rooms on each home navigation
    this.cambiarVista('inicio');
    this.menuUsuarioAbierto = false;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  irABusqueda(): void {
    this.restablecerFiltros();
    this.cambiarVista('busqueda');
    this.cargarPropiedades();
    this.menuUsuarioAbierto = false;
    this.aplicarFiltros();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  irAPerfil(): void {
    if (!this.usuarioActual) {
      this.abrirModalLogin();
      return;
    }

    this.seccionPerfil = 'sobreMi';
    this.cambiarVista('perfil');
    this.menuUsuarioAbierto = false;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  solicitudChatInicial: number | null = null;
  viviendaChatInicial: number | null = null;

  get misViviendas(): Propiedad[] {
    const perfil = this.usuarioActual?.idPerfilArrendador;
    return perfil ? this.propiedades.filter(propiedad => propiedad.idPerfilArrendador === perfil) : [];
  }

  irAMensajes(idSolicitud: number | null = null, idVivienda: number | null = null): void {
    if (!this.usuarioActual) {
      this.abrirModalLogin();
      return;
    }
    this.solicitudChatInicial = idSolicitud;
    this.viviendaChatInicial = idVivienda;
    this.menuUsuarioAbierto = false;
    this.cambiarVista('mensajes');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }

  irAMisViviendas(): void {
    if (this.modoCuenta !== 'ARRENDADOR' || !this.usuarioActual?.idPerfilArrendador) return;
    this.menuUsuarioAbierto = false;
    this.cambiarVista('mis-viviendas');
    this.cargarPropiedades();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }

  onPerfilActualizado(usuarioActualizado: UsuarioRegistroResponse): void {
    this.usuarioActual = usuarioActualizado;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('findimo_user', JSON.stringify(usuarioActualizado));
    }
  }

  // Acción principal: Al presionar el botón de búsqueda con el símbolo en el Hero
  buscarDesdeHero(): void {
    // Sincronizar selección del Hero hacia los filtros de búsqueda
    if (this.heroTipo && this.heroTipo !== 'todos') {
      this.filtroTipoHabitacion = this.heroTipo;
    } else {
      this.filtroTipoHabitacion = 'todos';
    }

    if (this.heroPrecio && this.heroPrecio !== 'todos') {
      this.filtroPrecioMensual = this.heroPrecio;
    } else {
      this.filtroPrecioMensual = 'todos';
    }

    if (this.heroUbicacion && this.heroUbicacion !== 'todos') {
      const u = this.heroUbicacion.toLowerCase();
      if (u.includes('chorrillos') || u.includes('surco')) {
        this.filtroUniversidad = 'UPC Chorrillos';
      } else if (u.includes('molina') || u.includes('miraflores')) {
        this.filtroUniversidad = 'Universidad de Piura';
      }
    } else {
      this.filtroUniversidad = 'todas';
    }

    // Navegar a la pantalla de resultados
    this.cambiarVista('busqueda');
    this.aplicarFiltros();

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.mostrarToast('Mostrando resultados de búsqueda', 'info');
  }

  // Carga de propiedades desde el servicio (consumo de API REST mediante suscripción a Observable)
  cargarPropiedades(): void {
    this.cargandoPropiedades = true;
    this.errorCargaPropiedades = false;
    this.propiedadService.obtenerTodas().subscribe({
      next: (datos: Propiedad[]) => {
        this.propiedades = datos;
        const idsDisponibles = new Set(datos.map(propiedad => propiedad.idPropiedad));
        this.idsComparacion = this.idsComparacion.filter(id => idsDisponibles.has(id));
        this.guardarComparacion();
        this.aplicarFavoritos();
        this.actualizarUltimasPropiedades();
        this.aplicarFiltros();

        this.cargandoPropiedades = false;
        this.changeDetector.markForCheck();

        // Si se recarga estando en detalle, restaurar la propiedad seleccionada
        if (this.vistaActual === 'detalle' && !this.propiedadSeleccionada && typeof localStorage !== 'undefined') {
          const idGuardado = Number(new URLSearchParams(window.location.search).get('propiedad') ?? localStorage.getItem('findimo_propiedad_id'));
          const encontrada = this.propiedades.find(p => p.idPropiedad === idGuardado);
          if (encontrada) {
            this.verDetalles(encontrada);
          } else {
            this.cambiarVista('busqueda');
          }
        }
      },
      error: (err: any) => {
        console.error('Error al cargar propiedades:', err);
        this.cargandoPropiedades = false;
        this.errorCargaPropiedades = true;
        this.changeDetector.markForCheck();
        this.propiedades = [];
        this.ultimasPropiedades = [];
        this.propiedadesFiltradas = [];
      }
    });
  }

  actualizarUltimasPropiedades(): void {
    const ordenadas = [...this.propiedades].sort((a, b) => b.idPropiedad - a.idPropiedad);
    this.ultimasPropiedades = ordenadas.slice(0, 4);
  }

  // Lógica de filtrado en el Presenter
  // Aplica los filtros principales y los combina con los filtros adicionales (AND)
  aplicarFiltros(): void {
    let lista = this.propiedades.filter(propiedad => !propiedad.reservada);

    if (this.filtroTipoHabitacion !== 'todos') {
      const tipo = Number(this.filtroTipoHabitacion);
      lista = lista.filter(propiedad => propiedad.idTipoPropiedad === tipo);
    }

    // 2. Filtro principal por precio mensual
    if (this.filtroPrecioMensual && this.filtroPrecioMensual !== 'todos') {
      if (this.filtroPrecioMensual === '500-1500') {
        lista = lista.filter(p => p.precio >= 500 && p.precio <= 1500);
      } else if (this.filtroPrecioMensual === 'hasta-600') {
        lista = lista.filter(p => p.precio <= 600);
      } else if (this.filtroPrecioMensual === '600-1000') {
        lista = lista.filter(p => p.precio >= 600 && p.precio <= 1000);
      } else if (this.filtroPrecioMensual === 'mas-1000') {
        lista = lista.filter(p => p.precio > 1000);
      }
    }

    // 3. Filtro principal por universidad
    if (this.filtroUniversidad && this.filtroUniversidad !== 'todas') {
      const u = this.filtroUniversidad.toLowerCase();
      lista = lista.filter(p => {
        const uniProp = (p.universidad || '').toLowerCase();
        const dist = (p.distrito || '').toLowerCase();
        const tit = p.titulo.toLowerCase();
        const dir = (p.direccion || '').toLowerCase();

        if (u.includes('upc') || u.includes('chorrillos')) {
          return uniProp.includes('upc') || dist.includes('chorrillos') || tit.includes('upc') || dir.includes('chorrillos');
        }
        if (u.includes('piura')) {
          return uniProp.includes('piura') || dist.includes('miraflores') || dist.includes('san isidro') || tit.includes('piura');
        }
        if (u.includes('ucsur')) {
          return uniProp.includes('ucsur') || dist.includes('sur') || tit.includes('ucsur');
        }
        return uniProp.includes(u);
      });
    }

    if (this.serviciosSeleccionados.length) {
      lista = lista.filter(propiedad =>
        this.serviciosSeleccionados.every(servicio => propiedad.idsServicios?.includes(servicio)));
    }

    this.propiedadesFiltradas = lista;
  }

  ejecutarBusqueda(): void {
    this.aplicarFiltros();
    this.mostrarToast(`Búsqueda actualizada con los filtros seleccionados`, 'info');
  }

  limpiarFiltros(): void {
    this.restablecerFiltros();
    this.aplicarFiltros();
    this.mostrarToast('Se restablecieron los filtros de búsqueda.', 'info');
  }

  private restablecerFiltros(): void {
    this.filtroTipoHabitacion = 'todos';
    this.filtroPrecioMensual = 'todos';
    this.filtroUniversidad = 'todas';
    this.serviciosSeleccionados = [];
  }

  // Métodos del Modal de Filtros Avanzados (US15 - Búsqueda avanzada con más filtros)
  abrirModalFiltros(): void {
    this.modalFiltrosAbierto = true;
  }

  cerrarModalFiltros(): void {
    this.modalFiltrosAbierto = false;
  }

  cargarCatalogos(): void {
    this.cargandoCatalogos = true;
    this.errorCatalogos = false;
    this.propiedadService.obtenerCatalogos().subscribe({
      next: catalogos => {
        this.catalogos = catalogos;
        this.cargandoCatalogos = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.cargandoCatalogos = false;
        this.errorCatalogos = true;
        this.changeDetector.markForCheck();
      }
    });
  }

  toggleServicio(servicio: number): void {
    this.serviciosSeleccionados = this.serviciosSeleccionados.includes(servicio)
      ? this.serviciosSeleccionados.filter(id => id !== servicio)
      : [...this.serviciosSeleccionados, servicio];
  }

  limpiarFiltrosAvanzados(): void {
    this.filtroTipoHabitacion = 'todos';
    this.serviciosSeleccionados = [];
    this.aplicarFiltros();
  }

  aplicarFiltrosAvanzados(): void {
    this.modalFiltrosAbierto = false;
    this.aplicarFiltros();
    this.mostrarToast('Filtros aplicados.', 'success');
  }

  irAFavoritos(): void {
    if (!this.usuarioActual) {
      this.abrirModalLogin();
      return;
    }
    this.menuUsuarioAbierto = false;
    this.cambiarVista('favoritos');
    if (!this.favoritosCargados) this.cargarFavoritos();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }

  cargarFavoritos(): void {
    const cuenta = this.usuarioActual?.idUsuario;
    if (!cuenta || this.cargandoFavoritos) return;

    this.cargandoFavoritos = true;
    this.errorFavoritos = '';
    this.favoritoService.listar(cuenta).pipe(takeUntil(this.sesionCerrada)).subscribe({
      next: ids => {
        this.idsFavoritos = new Set(ids);
        this.favoritosCargados = true;
        this.cargandoFavoritos = false;
        this.aplicarFavoritos();
        this.changeDetector.markForCheck();
      },
      error: error => {
        this.cargandoFavoritos = false;
        this.errorFavoritos = error.status === 401
          ? 'Vuelve a iniciar sesión para ver tus favoritos.'
          : 'No se pudieron cargar tus favoritos.';
        this.changeDetector.markForCheck();
      }
    });
  }

  private aplicarFavoritos(): void {
    for (const propiedad of this.propiedades) {
      propiedad.esFavorito = this.idsFavoritos.has(propiedad.idPropiedad);
    }
    if (this.propiedadSeleccionada) {
      this.propiedadSeleccionada.esFavorito = this.idsFavoritos.has(this.propiedadSeleccionada.idPropiedad);
    }
  }

  toggleFavorito(prop: Propiedad, event?: Event): void {
    event?.stopPropagation();
    const cuenta = this.usuarioActual?.idUsuario;
    if (!cuenta) {
      this.abrirModalLogin();
      return;
    }
    if (!this.favoritosCargados) {
      if (this.errorFavoritos) this.irAFavoritos();
      else this.mostrarToast('Estamos cargando tus favoritos.', 'info');
      return;
    }
    const id = prop.idPropiedad;
    if (this.favoritosPendientes.has(id)) return;

    const activo = !this.idsFavoritos.has(id);
    this.favoritosPendientes.add(id);
    this.favoritoService.guardar(cuenta, id, activo).pipe(takeUntil(this.sesionCerrada)).subscribe({
      next: () => {
        this.favoritosPendientes.delete(id);
        if (activo) this.idsFavoritos.add(id);
        else this.idsFavoritos.delete(id);
        this.aplicarFavoritos();
        this.aplicarFiltros();
        this.mostrarToast(activo ? 'Vivienda guardada en favoritos.' : 'Vivienda quitada de favoritos.');
      },
      error: () => {
        this.favoritosPendientes.delete(id);
        this.mostrarToast('No se pudo actualizar tus favoritos. Inténtalo de nuevo.', 'error');
      }
    });
  }

  // Interacción para ver detalles: abre la página de detalle completa de Figma (findimo-room-detail / US05)
  verDetalles(prop: Propiedad): void {
    this.propiedadSeleccionada = prop;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('findimo_propiedad_id', String(prop.idPropiedad));
    }
    this.cambiarVista('detalle');

    // Cargar reseñas reales de la propiedad desde el backend Spring Boot (GET /api/resenas/propiedad/{idPropiedad})
    this.solicitudResenasPropiedad?.unsubscribe();
    this.resenasPropiedadSeleccionada = [];
    this.cargandoResenasPropiedad = true;
    this.errorResenasPropiedad = false;
    this.solicitudResenasPropiedad = this.resenaService.obtenerResenasPorPropiedad(prop.idPropiedad).subscribe({
      next: (resenas: Resena[]) => {
        this.resenasPropiedadSeleccionada = resenas;
        this.cargandoResenasPropiedad = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.cargandoResenasPropiedad = false;
        this.errorResenasPropiedad = true;
        this.changeDetector.markForCheck();
      }
    });

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  irAComparacion(): void {
    this.menuUsuarioAbierto = false;
    this.cambiarVista('comparacion');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }

  alternarComparacion(propiedad: Propiedad): void {
    const id = propiedad.idPropiedad;
    if (this.idsComparacion.includes(id)) {
      this.quitarComparacion(id);
      this.mostrarToast('Vivienda quitada de la comparación.', 'info');
      return;
    }
    if (this.idsComparacion.length >= 3) {
      this.mostrarToast('Puedes comparar hasta tres viviendas. Quita una para añadir otra.', 'info');
      return;
    }
    this.idsComparacion = [...this.idsComparacion, id];
    this.guardarComparacion();
    this.mostrarToast(`Vivienda añadida a la comparación (${this.idsComparacion.length}/3).`);
  }

  quitarComparacion(id: number): void {
    this.idsComparacion = this.idsComparacion.filter(seleccionada => seleccionada !== id);
    this.guardarComparacion();
  }

  private guardarComparacion(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('findimo_comparacion', this.idsComparacion.join(','));
    }
  }

  marcarViviendaReservada(idPropiedad: number, reservada = true): void {
    const vivienda = this.propiedades.find(prop => prop.idPropiedad === idPropiedad);
    if (vivienda) {
      vivienda.reservada = reservada;
      if (!reservada) vivienda.estado = true;
    }
    if (this.propiedadSeleccionada?.idPropiedad === idPropiedad) this.propiedadSeleccionada.reservada = reservada;
    this.aplicarFiltros();
  }

  solicitandoAlquiler = false;

  reservaInmediata(): void {
    const prop = this.propiedadSeleccionada;
    if (!prop || prop.reservada || this.solicitandoAlquiler || !this.puedeSolicitarAlquiler) return;
    if (!this.usuarioActual) {
      this.abrirModalLogin();
      return;
    }
    const idPerfilEstudiante = this.usuarioActual.idPerfilEstudiante;
    if (!idPerfilEstudiante) {
      this.mostrarToast('La solicitud de alquiler requiere una cuenta de estudiante.', 'info');
      return;
    }

    this.solicitandoAlquiler = true;
    this.solicitudService.registrarSolicitud({ idPerfilEstudiante, idPropiedad: prop.idPropiedad })
      .pipe(takeUntil(this.sesionCerrada)).subscribe({
        next: solicitud => {
          this.solicitandoAlquiler = false;
          this.irAMensajes(solicitud.idSolicitudAlquiler);
          this.mostrarToast(`Solicitud de alquiler enviada para «${prop.titulo}».`);
        },
        error: error => {
          this.solicitandoAlquiler = false;
          const mensajes: Record<number, string> = {
            0: 'No se pudo conectar al backend de Findimo.',
            401: 'Tu sesión expiró. Vuelve a iniciar sesión para solicitar el alquiler.',
            403: 'La cuenta activa no tiene un perfil de estudiante habilitado.',
            404: 'No se encontró la vivienda o el perfil de estudiante.',
            409: 'La vivienda está reservada o no está disponible para recibir solicitudes.'
          };
          this.mostrarToast(mensajes[error.status] ?? 'No se pudo enviar la solicitud de alquiler.', 'error');
        }
      });
  }

  // Publicar Propiedad (Conexión al backend Spring Boot POST /api/propiedades)
  abrirModalPublicar(): void {
    if (!this.usuarioActual) {
      this.abrirModalLogin();
      return;
    }
    if (this.modoCuenta !== 'ARRENDADOR' || !this.usuarioActual.idPerfilArrendador) {
      this.mostrarToast('Cambia al modo arrendador para publicar una vivienda.', 'info');
      return;
    }
    this.menuUsuarioAbierto = false;
    this.modalPublicarAbierto = true;
  }

  editarVivienda(propiedad: Propiedad): void {
    if (this.modoCuenta !== 'ARRENDADOR' || !this.usuarioActual?.idPerfilArrendador ||
      this.usuarioActual.idPerfilArrendador !== propiedad.idPerfilArrendador) return;

    this.viviendaEditando = propiedad;
    this.pubTitulo = propiedad.titulo;
    this.pubDescripcion = propiedad.descripcion;
    this.pubPrecio = propiedad.precio;
    this.pubHabitaciones = propiedad.habitaciones;
    this.pubArea = propiedad.area ?? null;
    this.pubIdTipoPropiedad = propiedad.idTipoPropiedad ?? null;
    this.pubIdsServicios = [...(propiedad.idsServicios ?? [])];
    this.pubDireccion = propiedad.direccion;
    this.pubDistrito = propiedad.distrito;
    this.modalPublicarAbierto = true;
  }

  cerrarEditorVivienda(): void {
    this.modalPublicarAbierto = false;
    if (!this.viviendaEditando) return;

    this.viviendaEditando = null;
    this.pubTitulo = '';
    this.pubDescripcion = '';
    this.pubPrecio = 950;
    this.pubHabitaciones = 1;
    this.pubArea = null;
    this.pubIdTipoPropiedad = null;
    this.pubIdsServicios = [];
    this.pubDireccion = 'Av. Alameda Sur 234';
    this.pubDistrito = 'Chorrillos';
  }

  guardarPropiedad({ entorno, fotos, fotosRetiradas }: { entorno: LugarCercano[]; fotos: File[]; fotosRetiradas: string[] }): void {
    if (this.publicandoPropiedad) return;

    if (!this.pubTitulo.trim() || !this.pubDescripcion.trim() || !(this.pubPrecio > 0) || !Number.isInteger(this.pubHabitaciones) ||
      this.pubHabitaciones < 1 || !this.pubDireccion.trim() || !this.pubDistrito.trim()) {
      this.mostrarToast('Por favor completa los campos obligatorios.', 'error');
      return;
    }

    if (this.pubArea === null || !Number.isFinite(this.pubArea) || this.pubArea <= 0 ||
      this.pubArea > 999999.99 || !/^\d+(?:\.\d{1,2})?$/.test(String(this.pubArea))) {
      this.mostrarToast('Ingresa un área mayor que cero, con hasta dos decimales.', 'error');
      return;
    }

    const arrendadorId = this.usuarioActual?.idPerfilArrendador;
    if (this.modoCuenta !== 'ARRENDADOR' || !arrendadorId) return;
    const request: PropiedadRequest = {
      idPerfilArrendador: arrendadorId,
      titulo: this.pubTitulo,
      descripcion: this.pubDescripcion.trim(),
      precio: this.pubPrecio,
      habitaciones: this.pubHabitaciones,
      area: this.pubArea,
      idTipoPropiedad: this.pubIdTipoPropiedad,
      idsServicios: this.pubIdsServicios,
      direccion: this.pubDireccion,
      distrito: this.pubDistrito,
      estado: true,
      entorno,
      fotosRetiradas
    };

    this.publicandoPropiedad = true;
    const id = this.viviendaEditando?.idPropiedad;
    this.propiedadService.guardarPropiedad(request, fotos, id).pipe(takeUntil(this.sesionCerrada)).subscribe({
      next: () => {
        this.publicandoPropiedad = false;
        this.cargarPropiedades();
        this.cerrarEditorVivienda();
        this.changeDetector.markForCheck();
        this.mostrarToast(id ? 'Cambios de la vivienda guardados.' : '¡Habitación publicada exitosamente en Findimo!', 'success');

        this.pubTitulo = '';
        this.pubDescripcion = '';
        this.pubArea = null;
        this.pubIdTipoPropiedad = null;
        this.pubIdsServicios = [];
      },
      error: error => {
        this.publicandoPropiedad = false;
        const mensajes: Record<number, string> = {
          0: 'No se pudo conectar al backend de Findimo.',
          400: 'Completa los campos obligatorios y asegúrate de conservar al menos una foto válida.',
          401: 'Tu sesión expiró. Vuelve a iniciar sesión antes de guardar.',
          403: 'La cuenta activa no tiene permiso para guardar esta vivienda.',
          404: 'No se encontró esta vivienda para la cuenta activa.',
          405: 'El backend local aún no tiene habilitada la edición. Recompílalo y reinícialo.',
          413: 'La carga supera el límite. Usa hasta cinco fotos de 5 MB cada una.',
          415: 'El backend no aceptó el formato del formulario.'
        };
        const mensaje = mensajes[error.status] ?? 'No se pudo guardar la vivienda en el servidor. Inténtalo de nuevo.';
        this.mostrarToast(mensaje, 'error');
        this.changeDetector.markForCheck();
      }
    });
  }

  // Autenticación de Usuarios
  abrirModalLogin(): void {
    this.loginCorreo = '';
    this.loginContrasena = '';
    this.modalLoginAbierto = true;
    this.modalRegistroAbierto = false;
    this.menuUsuarioAbierto = false;
  }

  abrirModalRegistro(): void {
    this.modalRegistroAbierto = true;
    this.modalLoginAbierto = false;
    this.menuUsuarioAbierto = false;
  }

  abrirModalRegistroEstudiante(): void {
    this.regRol = 'ESTUDIANTE';
    this.modalRegistroAbierto = true;
    this.modalLoginAbierto = false;
    this.menuUsuarioAbierto = false;
  }

  abrirModalRegistroAnfitrion(): void {
    this.regRol = 'ARRENDADOR';
    this.modalRegistroAbierto = true;
    this.modalLoginAbierto = false;
    this.menuUsuarioAbierto = false;
  }

  toggleMenuUsuario(): void {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  private tienePerfil(modo: ModoCuenta): boolean {
    return modo === 'ESTUDIANTE' ? !!this.usuarioActual?.idPerfilEstudiante : !!this.usuarioActual?.idPerfilArrendador;
  }

  private restaurarModoCuenta(): void {
    const cuenta = this.usuarioActual;
    this.modoCuenta = null;
    if (!cuenta) return;

    const guardado = typeof localStorage === 'undefined' ? null : localStorage.getItem(`findimo_modo_${cuenta.idUsuario}`);
    const inicial = cuenta.nombreRol === 'ARRENDADOR' ? 'ARRENDADOR' : 'ESTUDIANTE';
    for (const modo of [guardado, inicial, 'ESTUDIANTE', 'ARRENDADOR']) {
      if ((modo === 'ESTUDIANTE' || modo === 'ARRENDADOR') && this.tienePerfil(modo)) {
        this.modoCuenta = modo;
        return;
      }
    }
  }

  elegirModo(modo: ModoCuenta): void {
    if (!this.usuarioActual) return;
    this.menuUsuarioAbierto = false;
    if (!this.tienePerfil(modo)) {
      this.perfilPorActivar = modo;
      return;
    }

    this.modoCuenta = modo;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`findimo_modo_${this.usuarioActual.idUsuario}`, modo);
    }
    if (modo === 'ESTUDIANTE' && this.vistaActual === 'mis-viviendas') this.irABusqueda();
    if (this.vistaActual === 'mensajes') this.solicitudChatInicial = null;
    this.mostrarToast(modo === 'ESTUDIANTE' ? 'Modo estudiante activado.' : 'Modo arrendador activado.');
  }

  cerrarActivacionPerfil(): void {
    if (this.activandoPerfil) return;
    this.perfilPorActivar = null;
    this.universidadPerfil = '';
    this.presupuestoPerfil = null;
    this.cuentaBancariaPerfil = '';
    this.errorActivarPerfil = '';
  }

  activarPerfil(): void {
    const tipo = this.perfilPorActivar;
    if (!tipo || this.activandoPerfil) return;
    const universidad = this.universidadPerfil.trim();
    const cuenta = this.cuentaBancariaPerfil.trim();
    if ((tipo === 'ESTUDIANTE' && !universidad) || (tipo === 'ARRENDADOR' && !cuenta)) {
      this.errorActivarPerfil = 'Completa los datos requeridos.';
      return;
    }

    const solicitud: ActivarPerfilRequest = tipo === 'ESTUDIANTE'
      ? { tipo, nombreUniversidad: universidad, presupuestoMaximo: this.presupuestoPerfil ?? undefined }
      : { tipo, cuentaBancaria: cuenta };
    this.activandoPerfil = true;
    this.errorActivarPerfil = '';
    this.usuarioService.activarPerfil(solicitud).pipe(takeUntil(this.sesionCerrada)).subscribe({
      next: usuario => {
        this.usuarioActual = usuario;
        this.activandoPerfil = false;
        this.cerrarActivacionPerfil();
        this.elegirModo(tipo);
      },
      error: error => {
        this.activandoPerfil = false;
        this.errorActivarPerfil = error.status === 401 ? 'Vuelve a iniciar sesión para activar otro perfil.'
          : error.status === 400 ? 'Revisa los datos del perfil y vuelve a intentarlo.'
          : 'No se pudo activar el perfil. Inténtalo de nuevo.';
        this.changeDetector.markForCheck();
      }
    });
  }

  iniciarSesion(): void {
    if (!this.loginCorreo || !this.loginContrasena) {
      this.mostrarToast('Ingresa tu correo y contraseña.', 'error');
      return;
    }

    this.usuarioService.iniciarSesion(this.loginCorreo, this.loginContrasena).pipe(takeUntil(this.sesionCerrada)).subscribe({
      next: (user: UsuarioRegistroResponse) => {
        this.usuarioActual = user;
        this.restaurarModoCuenta();
        this.cargarFavoritos();
        this.modalLoginAbierto = false;
        this.menuUsuarioAbierto = false;
        const tipoRol = this.modoCuenta === 'ARRENDADOR' ? 'Anfitrión (Arrendador)' : 'Estudiante';
        this.mostrarToast(`¡Bienvenido de nuevo, ${user.nombre}! Has ingresado como ${tipoRol}.`, 'success');
      },
      error: (err: any) => {
        const errorMsg = err?.error?.mensaje || err?.message || 'Credenciales incorrectas. Verifica tu contraseña.';
        this.mostrarToast(errorMsg, 'error');
      }
    });
  }

  cerrarSesion(): void {
    this.sesionCerrada.next();
    this.usuarioService.cerrarSesion();
    this.usuarioActual = null;
    this.modoCuenta = null;
    this.activandoPerfil = false;
    this.cerrarActivacionPerfil();
    this.viviendaEditando = null;
    this.solicitudChatInicial = null;
    this.viviendaChatInicial = null;
    this.publicandoPropiedad = false;
    this.idsFavoritos.clear();
    this.favoritosPendientes.clear();
    this.favoritosCargados = false;
    this.cargandoFavoritos = false;
    this.errorFavoritos = '';
    this.seccionPerfil = 'sobreMi';
    this.pestanaResenas = 'escritas';
    this.modalLoginAbierto = false;
    this.modalRegistroAbierto = false;
    this.modalPublicarAbierto = false;
    this.solicitandoAlquiler = false;
    this.modalFiltrosAbierto = false;

    this.loginCorreo = '';
    this.loginContrasena = '';
    this.regRol = 'ESTUDIANTE';
    this.registrandoUsuario = false;
    this.limpiarFormularioRegistro();

    this.pubTitulo = '';
    this.pubDescripcion = '';
    this.pubPrecio = 950;
    this.pubHabitaciones = 1;
    this.pubArea = null;
    this.pubIdTipoPropiedad = null;
    this.pubIdsServicios = [];
    this.pubDireccion = 'Av. Alameda Sur 234';
    this.pubDistrito = 'Chorrillos';

    this.heroUbicacion = 'todos';
    this.heroTipo = 'todos';
    this.heroPrecio = 'todos';
    this.restablecerFiltros();

    this.propiedadSeleccionada = null;
    this.resenasPropiedadSeleccionada = [];
    this.idsComparacion = [];
    this.guardarComparacion();
    this.solicitudResenasPropiedad?.unsubscribe();
    this.aplicarFavoritos();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('findimo_propiedad_id');
    }

    this.irAInicio();
    this.mostrarToast('Has cerrado sesión correctamente.', 'info');
  }

  private limpiarFormularioRegistro(): void {
    this.regNombre = '';
    this.regApellido = '';
    this.regCorreo = '';
    this.regContrasena = '';
    this.regTelefono = '';
    this.regUniversidad = '';
    this.regPresupuesto = 850;
    this.regCuentaBancaria = '';
  }

  registrarUsuario(): void {
    if (this.registrandoUsuario) return;

    if (!this.regNombre || !this.regApellido || !this.regCorreo || !this.regContrasena) {
      this.mostrarToast('Por favor completa todos los campos requeridos con asterisco (*).', 'error');
      return;
    }

    if (this.regRol === 'ARRENDADOR' && !this.regCuentaBancaria) {
      this.mostrarToast('Por favor ingresa tu cuenta bancaria (tm_perfil_arrendador).', 'error');
      return;
    }

    if (this.regRol === 'ESTUDIANTE' && !this.regUniversidad) {
      this.mostrarToast('Por favor indica el nombre de tu universidad.', 'error');
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

    this.registrandoUsuario = true;
    this.usuarioService.registrar(req).pipe(takeUntil(this.sesionCerrada)).subscribe({
      next: (user: UsuarioRegistroResponse) => {
        this.usuarioActual = user;
        this.restaurarModoCuenta();
        this.cargarFavoritos();
        this.registrandoUsuario = false;
        this.limpiarFormularioRegistro();

        this.modalRegistroAbierto = false;
        const tipoRol = user.nombreRol === 'ARRENDADOR' ? 'Anfitrión' : 'Estudiante';
        this.mostrarToast(`¡Registro exitoso! Bienvenido a Findimo como ${tipoRol}, ${user.nombre}.`, 'success');
      },
      error: () => {
        this.registrandoUsuario = false;
        this.mostrarToast('No se pudo completar el registro. Inténtalo de nuevo.', 'error');
      }
    });
  }

  // Notificaciones Toast
  private toastTimeout: any;
  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.changeDetector.markForCheck();

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMensaje = null;
      this.changeDetector.markForCheck();
    }, 4000);
  }

  cerrarToast(): void {
    this.toastMensaje = null;
  }
}
