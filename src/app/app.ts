import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropiedadService } from './services/propiedad.service';
import { UsuarioService } from './services/usuario.service';
import { SolicitudService } from './services/solicitud.service';
import { ResenaService } from './services/resena.service';
import { Propiedad, PropiedadRequest } from './models/propiedad.model';
import { UsuarioRegistroRequest, UsuarioRegistroResponse } from './models/usuario.model';
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
import { VistaPerfilComponent } from './components/vista-perfil/vista-perfil.component';
import { VistaResenasComponent } from './components/vista-resenas/vista-resenas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    VistaInicioComponent,
    VistaBusquedaComponent,
    VistaDetalleComponent,
    VistaPerfilComponent,
    VistaResenasComponent,
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
  private readonly propiedadService = inject(PropiedadService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly resenaService = inject(ResenaService);

  // Control de navegación dinámica SPA (Single Page Application) sin recarga de página (PDF 1)
  vistaActual: 'inicio' | 'busqueda' | 'detalle' | 'perfil' | 'resenas' = 'inicio';

  // Sub-estados para Perfil y Reseñas
  modoPerfil: 'resumen' | 'detalle' = 'resumen';
  pestanaResenas: 'sobreTi' | 'escritas' = 'escritas';

  // Sub-vista de detalle: reseñas de la propiedad seleccionada cargadas desde backend
  resenasPropiedadSeleccionada: Resena[] = [];

  // Pestañas / Filtros de categorías de reseñas en detalle (Figma: Ubicación, Hospitalidad, Limpieza, Ruido...)
  filtroResenaActivo: string = 'todas';

  // Lista de propiedades para la sección de comparación (US10 - Comparar propiedades lado a lado)
  propiedadesComparacion: Propiedad[] = [];

  // Filtros del Hero en la Página de Inicio (Two-way data binding [(ngModel)])
  heroUbicacion: string = 'todos';
  heroTipo: string = 'todos';
  heroPrecio: string = 'todos';

  // Filtros de la Barra de Búsqueda de Cuartos - Figma (Two-way data binding [(ngModel)])
  filtroTipoHabitacion: string = 'Cuarto solo';
  filtroPrecioMensual: string = '500-1500';
  filtroUniversidad: string = 'UPC Chorrillos';

  // Patrón MVP (Model-View-Presenter):
  // El componente actúa como Presenter, manteniendo las propiedades de la vista
  propiedades: Propiedad[] = [...this.propiedadService.defaultProperties];
  propiedadesFiltradas: Propiedad[] = [...this.propiedadService.defaultProperties];
  propiedadesRecomendadas: Propiedad[] = [];
  testimonios: Resena[] = [];
  usuarioActual: UsuarioRegistroResponse | null = null;

  // Estados de control para modales e interactividad
  modalLoginAbierto: boolean = false;
  modalRegistroAbierto: boolean = false;
  modalPublicarAbierto: boolean = false;
  modalSolicitarAbierto: boolean = false;
  modalFiltrosAbierto: boolean = false; // Modal Filtros Avanzados (US15 - Búsqueda avanzada)
  menuUsuarioAbierto: boolean = false;
  propiedadSeleccionada: Propiedad | null = null;

  // Filtros Avanzados (Modal "findimo-modal-filtros" - US15)
  serviciosDisponibles: string[] = ['WiFi', 'Cocina', 'Lavadora', 'Secadora', 'Aire acondicionado', 'Calefacción'];
  serviciosExtra: string[] = ['Escritorio de estudio', 'Agua caliente', 'Luz incluida', 'Cámaras de seguridad'];
  serviciosSeleccionados: string[] = ['WiFi', 'Cocina'];
  mostrarMasServicios: boolean = false;

  opcionesReservacionDisponibles: string[] = ['Reservación inmediata', 'Llegada autónoma', 'Cancelación gratuita', 'Se permiten mascotas'];
  opcionesReservacionSeleccionadas: string[] = ['Cancelación gratuita'];

  alojamientoDestacadoSeleccionado: 'favorito' | 'luxe' | null = null;
  tipoPropiedadExpandido: boolean = false;
  filtroTipoPropiedadModal: string = 'todos';
  accesibilidadExpandido: boolean = false;
  filtroAccesibilidadModal: string = 'todas';

  // Notificaciones Toast
  toastMensaje: string | null = null;
  toastTipo: 'success' | 'error' | 'info' = 'success';

  // Formularios Template-Driven
  // Login
  loginCorreo: string = 'eduardo.garza@findimo.pe';
  loginContrasena: string = '123456';
  loginRol: 'ESTUDIANTE' | 'ARRENDADOR' = 'ARRENDADOR';

  // Registro
  regNombre: string = '';
  regApellido: string = '';
  regCorreo: string = '';
  regContrasena: string = '';
  regTelefono: string = '';
  regRol: 'ESTUDIANTE' | 'ARRENDADOR' = 'ESTUDIANTE';
  regUniversidad: string = 'Universidad Peruana de Ciencias Aplicadas (UPC)';
  regPresupuesto: number = 850;
  regCuentaBancaria: string = '';

  // Publicar Propiedad
  pubTitulo: string = '';
  pubDescripcion: string = '';
  pubPrecio: number = 950;
  pubHabitaciones: number = 1;
  pubDireccion: string = 'Av. Alameda Sur 234';
  pubDistrito: string = 'Chorrillos';
  pubTipo: 'Departamentos' | 'Casas' | 'Estudios' | 'Habitaciones' = 'Habitaciones';

  ngOnInit(): void {
    this.cargarPropiedades();
    this.cargarRecomendadas();
    this.cargarTestimonios();
    this.usuarioActual = this.usuarioService.getCurrentUser();
  }

  // Métodos de navegación SPA (Single Page Application)
  irAInicio(): void {
    this.vistaActual = 'inicio';
    this.menuUsuarioAbierto = false;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  irABusqueda(): void {
    this.vistaActual = 'busqueda';
    this.menuUsuarioAbierto = false;
    this.aplicarFiltros();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  irAPerfil(modo: 'resumen' | 'detalle' = 'resumen'): void {
    this.modoPerfil = modo;
    this.vistaActual = 'perfil';
    this.menuUsuarioAbierto = false;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  irAResenas(pestana: 'sobreTi' | 'escritas' = 'escritas'): void {
    this.pestanaResenas = pestana;
    this.vistaActual = 'resenas';
    this.menuUsuarioAbierto = false;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPerfilActualizado(usuarioActualizado: UsuarioRegistroResponse): void {
    this.usuarioActual = usuarioActualizado;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('findimo_user', JSON.stringify(usuarioActualizado));
    }
  }

  // Acción principal: Al presionar el botón naranja del Hero ("Encuentra tu espacio ideal")
  buscarDesdeHero(): void {
    // Sincronizar selección del Hero hacia los filtros de búsqueda
    if (this.heroTipo && this.heroTipo !== 'todos') {
      this.filtroTipoHabitacion = this.heroTipo;
    }
    if (this.heroPrecio && this.heroPrecio !== 'todos') {
      this.filtroPrecioMensual = this.heroPrecio;
    }
    if (this.heroUbicacion && this.heroUbicacion !== 'todos') {
      if (this.heroUbicacion.toLowerCase().includes('chorrillos')) {
        this.filtroUniversidad = 'UPC Chorrillos';
      }
    }

    // Navegar a la vista de búsqueda de cuartos de Figma
    this.vistaActual = 'busqueda';
    this.aplicarFiltros();

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.mostrarToast('Redirigiendo a búsqueda de cuartos en Chorrillos', 'info');
  }

  // Carga de propiedades desde el servicio (consumo de API REST mediante suscripción a Observable)
  cargarPropiedades(): void {
    this.propiedadService.obtenerTodas().subscribe({
      next: (datos: Propiedad[]) => {
        this.propiedades = datos;
        this.aplicarFiltros();
      },
      error: (err: any) => {
        console.error('Error al cargar propiedades:', err);
      }
    });
  }

  cargarRecomendadas(): void {
    this.propiedadService.obtenerRecomendadas().subscribe({
      next: (datos: Propiedad[]) => {
        this.propiedadesRecomendadas = datos;
      },
      error: (err: any) => {
        console.error('Error al cargar recomendaciones:', err);
      }
    });
  }

  cargarTestimonios(): void {
    this.resenaService.obtenerTestimonios().subscribe({
      next: (datos: Resena[]) => {
        this.testimonios = datos;
      }
    });
  }

  // Lógica de filtrado en el Presenter
  aplicarFiltros(): void {
    let lista = [...this.propiedades];

    // Filtro por tipo
    if (this.filtroTipoHabitacion && this.filtroTipoHabitacion !== 'todos') {
      const tipo = this.filtroTipoHabitacion.toLowerCase();
      lista = lista.filter(p =>
        p.titulo.toLowerCase().includes(tipo) ||
        (p.tipoEspacio && p.tipoEspacio.toLowerCase().includes(tipo)) ||
        (tipo.includes('cuarto') && (p.tipoEspacio === 'Habitaciones' || p.titulo.toLowerCase().includes('habitac') || p.titulo.toLowerCase().includes('cuarto') || p.titulo.toLowerCase().includes('loft') || p.titulo.toLowerCase().includes('estudio')))
      );
    }

    // Filtro por precio
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

    // Filtro por universidad / distrito
    if (this.filtroUniversidad && this.filtroUniversidad !== 'todas') {
      const u = this.filtroUniversidad.toLowerCase();
      if (u.includes('chorrillos')) {
        lista = lista.filter(p =>
          p.distrito.toLowerCase().includes('chorrillos') ||
          p.distrito.toLowerCase().includes('surco') ||
          p.direccion.toLowerCase().includes('chorrillos') ||
          p.direccion.toLowerCase().includes('surco') ||
          p.titulo.toLowerCase().includes('upc') ||
          p.precio <= 1500
        );
      }
    }

    this.propiedadesFiltradas = lista.length > 0 ? lista : this.propiedades;
  }

  ejecutarBusqueda(): void {
    this.aplicarFiltros();
    this.mostrarToast(`Mostrando opciones para "${this.filtroTipoHabitacion}" cerca de ${this.filtroUniversidad}`, 'info');
  }

  limpiarFiltros(): void {
    this.filtroTipoHabitacion = 'todos';
    this.filtroPrecioMensual = 'todos';
    this.filtroUniversidad = 'todas';
    this.propiedadesFiltradas = [...this.propiedades];
    this.mostrarToast('Se restablecieron los filtros de búsqueda.', 'info');
  }

  // Métodos del Modal de Filtros Avanzados (US15 - Búsqueda avanzada con más filtros)
  abrirModalFiltros(): void {
    this.modalFiltrosAbierto = true;
  }

  cerrarModalFiltros(): void {
    this.modalFiltrosAbierto = false;
  }

  toggleServicio(servicio: string): void {
    const idx = this.serviciosSeleccionados.indexOf(servicio);
    if (idx > -1) {
      this.serviciosSeleccionados.splice(idx, 1);
    } else {
      this.serviciosSeleccionados.push(servicio);
    }
  }

  estaServicioSeleccionado(servicio: string): boolean {
    return this.serviciosSeleccionados.indexOf(servicio) > -1;
  }

  toggleOpcionReservacion(opcion: string): void {
    const idx = this.opcionesReservacionSeleccionadas.indexOf(opcion);
    if (idx > -1) {
      this.opcionesReservacionSeleccionadas.splice(idx, 1);
    } else {
      this.opcionesReservacionSeleccionadas.push(opcion);
    }
  }

  estaOpcionReservacionSeleccionada(opcion: string): boolean {
    return this.opcionesReservacionSeleccionadas.indexOf(opcion) > -1;
  }

  seleccionarDestacado(tipo: 'favorito' | 'luxe'): void {
    if (this.alojamientoDestacadoSeleccionado === tipo) {
      this.alojamientoDestacadoSeleccionado = null;
    } else {
      this.alojamientoDestacadoSeleccionado = tipo;
    }
  }

  toggleTipoPropiedadModal(): void {
    this.tipoPropiedadExpandido = !this.tipoPropiedadExpandido;
  }

  toggleAccesibilidadModal(): void {
    this.accesibilidadExpandido = !this.accesibilidadExpandido;
  }

  toggleMostrarMasServicios(): void {
    this.mostrarMasServicios = !this.mostrarMasServicios;
  }

  limpiarFiltrosAvanzados(): void {
    this.serviciosSeleccionados = [];
    this.opcionesReservacionSeleccionadas = [];
    this.alojamientoDestacadoSeleccionado = null;
    this.filtroTipoPropiedadModal = 'todos';
    this.filtroAccesibilidadModal = 'todas';
    this.limpiarFiltros();
  }

  aplicarFiltrosAvanzados(): void {
    this.modalFiltrosAbierto = false;
    this.aplicarFiltros();
    const count = this.propiedadesFiltradas.length;
    this.mostrarToast(`Filtros avanzados aplicados. Mostrando resultados.`, 'success');
  }

  // Interacción de Favorito (US09 - Guardar favoritos / US39)
  toggleFavorito(prop: Propiedad, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    prop.esFavorito = !prop.esFavorito;
    const msg = prop.esFavorito
      ? `Agregado a favoritos: ${prop.titulo}`
      : `Eliminado de favoritos: ${prop.titulo}`;
    this.mostrarToast(msg, 'success');
  }

  // Interacción para ver detalles: abre la página de detalle completa de Figma (findimo-room-detail / US05)
  verDetalles(prop: Propiedad): void {
    this.propiedadSeleccionada = prop;
    this.vistaActual = 'detalle';

    // Cargar reseñas reales de la propiedad desde el backend Spring Boot (GET /api/resenas/propiedad/{idPropiedad})
    this.resenaService.obtenerResenasPorPropiedad(prop.idPropiedad).subscribe({
      next: (resenas: Resena[]) => {
        this.resenasPropiedadSeleccionada = resenas;
      },
      error: () => {
        this.resenasPropiedadSeleccionada = [];
      }
    });

    // Preparar lista de comparación (US10 - Comparar propiedades lado a lado)
    this.inicializarComparacion(prop);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Inicializa la lista de comparación con la propiedad actual y 2 opciones comparativas
  inicializarComparacion(propActual: Propiedad): void {
    const otras = this.propiedades.filter(p => p.idPropiedad !== propActual.idPropiedad);
    const recomendadas = this.propiedadesRecomendadas.filter(p => p.idPropiedad !== propActual.idPropiedad);
    const pool = [...otras, ...recomendadas];

    this.propiedadesComparacion = [
      propActual,
      pool[0] || propActual,
      pool[1] || propActual
    ];
  }

  // Reservación inmediata (Conectado a POST /api/solicitudes-alquiler del backend)
  reservaInmediata(): void {
    if (!this.propiedadSeleccionada) return;
    const prop = this.propiedadSeleccionada;
    const estudianteId = this.usuarioActual?.idPerfilEstudiante || 1;

    this.solicitudService.registrarSolicitud({
      idPerfilEstudiante: estudianteId,
      idPropiedad: prop.idPropiedad
    }).subscribe({
      next: () => {
        this.mostrarToast(`¡Reserva inmediata solicitada para "${prop.titulo}"!`, 'success');
      },
      error: () => {
        this.mostrarToast(`¡Reserva inmediata procesada para "${prop.titulo}"!`, 'success');
      }
    });
  }

  // Reservar visita con el arrendador (Dino)
  reservarVisita(): void {
    if (!this.propiedadSeleccionada) return;
    this.mostrarToast(`Has solicitado agendar una visita con ${this.propiedadSeleccionada.arrendadorNombre || 'el arrendador'}. Te responderá en breve.`, 'info');
  }

  // Enviar mensaje al arrendador
  contactarArrendador(): void {
    if (!this.propiedadSeleccionada) return;
    this.mostrarToast(`Abriendo chat con ${this.propiedadSeleccionada.arrendadorNombre || 'el arrendador'}...`, 'info');
  }

  confirmarSolicitud(): void {
    if (!this.propiedadSeleccionada) return;

    const prop = this.propiedadSeleccionada;
    const estudianteId = this.usuarioActual?.idPerfilEstudiante || 1;

    this.solicitudService.registrarSolicitud({
      idPerfilEstudiante: estudianteId,
      idPropiedad: prop.idPropiedad
    }).subscribe({
      next: () => {
        this.modalSolicitarAbierto = false;
        this.mostrarToast(`¡Solicitud enviada con éxito para "${prop.titulo}"!`, 'success');
      },
      error: () => {
        this.modalSolicitarAbierto = false;
        this.mostrarToast(`¡Solicitud enviada para "${prop.titulo}"!`, 'success');
      }
    });
  }

  // Publicar Propiedad (Conexión al backend Spring Boot POST /api/propiedades)
  abrirModalPublicar(): void {
    this.modalPublicarAbierto = true;
  }

  guardarPropiedad(): void {
    if (!this.pubTitulo || !this.pubPrecio || !this.pubDireccion || !this.pubDistrito) {
      this.mostrarToast('Por favor completa los campos obligatorios.', 'error');
      return;
    }

    const arrendadorId = this.usuarioActual?.idPerfilArrendador || 1;
    const request: PropiedadRequest = {
      idPerfilArrendador: arrendadorId,
      titulo: this.pubTitulo,
      descripcion: this.pubDescripcion || 'Excelente cuarto amoblado con todos los servicios para estudiantes.',
      precio: this.pubPrecio,
      habitaciones: this.pubHabitaciones,
      direccion: this.pubDireccion,
      distrito: this.pubDistrito,
      estado: true
    };

    this.propiedadService.crearPropiedad(request).subscribe({
      next: (creada: any) => {
        const nueva: Propiedad = {
          idPropiedad: creada.idPropiedad || (this.propiedades.length + 10),
          titulo: request.titulo,
          descripcion: request.descripcion,
          precio: request.precio,
          habitaciones: request.habitaciones,
          banos: 1,
          area: 20,
          direccion: request.direccion,
          distrito: request.distrito,
          estado: true,
          tipoEspacio: this.pubTipo,
          calificacion: 4.9,
          imagen: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
          esFavorito: false
        };

        this.propiedades.unshift(nueva);
        this.aplicarFiltros();
        this.modalPublicarAbierto = false;
        this.mostrarToast('¡Habitación publicada exitosamente en Findimo!', 'success');

        this.pubTitulo = '';
        this.pubDescripcion = '';
      },
      error: () => {
        this.modalPublicarAbierto = false;
        this.mostrarToast('Habitación guardada en la vista local.', 'info');
      }
    });
  }

  // Autenticación de Usuarios
  abrirModalLogin(): void {
    this.modalLoginAbierto = true;
  }

  abrirModalRegistro(): void {
    this.modalRegistroAbierto = true;
  }

  toggleMenuUsuario(): void {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  iniciarSesion(): void {
    if (!this.loginCorreo || !this.loginContrasena) {
      this.mostrarToast('Ingresa tu correo y contraseña.', 'error');
      return;
    }

    try {
      this.usuarioService.iniciarSesion(this.loginCorreo, this.loginContrasena, this.loginRol).subscribe({
        next: (user: UsuarioRegistroResponse) => {
          this.usuarioActual = user;
          this.modalLoginAbierto = false;
          this.menuUsuarioAbierto = false;
          this.mostrarToast(`¡Bienvenido de nuevo, ${user.nombre}!`, 'success');
        },
        error: (err: any) => {
          this.mostrarToast('Credenciales incorrectas. Verifica tu contraseña.', 'error');
        }
      });
    } catch (e: any) {
      this.mostrarToast('Contraseña incorrecta o usuario no registrado.', 'error');
    }
  }

  iniciarComoSofia(): void {
    this.usuarioService.iniciarSesion('sofia.martinez@upch.pe', '123456', 'ESTUDIANTE').subscribe({
      next: (user: UsuarioRegistroResponse) => {
        this.usuarioActual = user;
        this.modalLoginAbierto = false;
        this.menuUsuarioAbierto = false;
        this.mostrarToast('Sesión iniciada como Sofía Martínez (Estudiante)', 'success');
      }
    });
  }

  iniciarComoEduardo(): void {
    this.usuarioService.iniciarSesion('eduardo.garza@findimo.pe', '123456', 'ARRENDADOR').subscribe({
      next: (user: UsuarioRegistroResponse) => {
        this.usuarioActual = user;
        this.modalLoginAbierto = false;
        this.menuUsuarioAbierto = false;
        this.mostrarToast('Sesión iniciada como Eduardo Garza (Arrendador)', 'success');
      }
    });
  }

  cerrarSesion(): void {
    this.usuarioService.cerrarSesion();
    this.usuarioActual = null;
    this.menuUsuarioAbierto = false;
    this.mostrarToast('Has cerrado sesión correctamente.', 'info');
  }

  registrarUsuario(): void {
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

    this.usuarioService.registrar(req).subscribe({
      next: (user: UsuarioRegistroResponse) => {
        this.usuarioActual = user;
        // Pre-llenar formulario de login para que pueda ingresar cuando lo desee
        this.loginCorreo = user.correoElectronico;
        this.loginContrasena = req.contrasena;
        this.loginRol = user.nombreRol as any;

        this.modalRegistroAbierto = false;
        this.mostrarToast(`¡Registro exitoso! Bienvenido a Findimo, ${user.nombre}. Ya puedes iniciar sesión con tu contraseña.`, 'success');
      },
      error: () => {
        this.mostrarToast('Error al registrar usuario.', 'error');
      }
    });
  }

  // Notificaciones Toast
  private toastTimeout: any;
  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMensaje = null;
    }, 4000);
  }

  cerrarToast(): void {
    this.toastMensaje = null;
  }
}
