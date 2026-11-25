import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, effect, inject, input, output, signal, viewChild, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, EMPTY, Observable, catchError, exhaustMap, switchMap, timer } from 'rxjs';
import { Conversacion, DecisionSolicitud, EstadoReserva, Mensaje, MensajesService, PerfilEstudianteChat } from '../../services/mensajes.service';

@Component({
  selector: 'app-vista-mensajes',
  imports: [DatePipe, FormsModule],
  templateUrl: './vista-mensajes.component.html',
  styleUrl: './vista-mensajes.component.css'
})
export class VistaMensajesComponent implements OnInit {
  private readonly api = inject(MensajesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly solicitud = new BehaviorSubject<number | null>(null);
  private readonly historial = viewChild<ElementRef<HTMLElement>>('historial');
  private readonly dialogoPerfil = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoPerfil');

  readonly reservaConfirmada = output<number>();
  readonly alquilerFinalizado = output<number>();
  readonly procesandoReserva = signal(false);
  readonly errorReserva = signal('');
  readonly etiquetasReserva = { PENDIENTE: 'Reserva pendiente', CONFIRMADA: 'Reserva confirmada', RECHAZADA: 'Reserva rechazada', FINALIZADA: 'Alquiler finalizado' };
  readonly cuenta = input.required<number>();
  readonly esArrendador = input(false);
  readonly solicitudInicial = input<number | null>(null);
  readonly viviendaInicial = input<number | null>(null);
  accionAlquiler: 'finalizar' | 'resena' | null = null;
  codigoLiberacion = '';
  calificacionResena: number | null = null;
  comentarioResena = '';
  readonly conversaciones = signal<Conversacion[] | null>(null);
  readonly activa = signal<number | null>(null);
  readonly conversacion = computed(() => this.conversaciones()?.find(item => item.idSolicitud === this.activa()));
  private readonly reservaActiva = computed(() => this.conversacion()?.reserva);
  readonly mensajes = signal<Mensaje[] | null>(null);
  readonly errorLista = signal('');
  readonly errorChat = signal('');
  readonly errorEnvio = signal('');
  readonly enviando = signal(false);
  readonly perfil = signal<PerfilEstudianteChat | null>(null);
  readonly cargandoPerfil = signal(false);
  readonly procesandoDecision = signal(false);
  readonly errorSolicitud = signal('');
  readonly etiquetas = { PENDIENTE: 'Pendiente', ACEPTADA: 'Aceptada', CANCELADA: 'Cancelada' };
  borrador = '';

  constructor() {
    effect(() => {
      const mensajes = this.mensajes();
      const reserva = this.reservaActiva();
      const historial = this.historial()?.nativeElement;
      if ((mensajes?.length || reserva) && historial) {
        queueMicrotask(() => { historial.scrollTop = historial.scrollHeight; });
      }
    });
  }

  ngOnInit(): void {
    timer(0, 5000).pipe(
      exhaustMap(() => this.api.listar(this.cuenta()).pipe(catchError(error => {
        this.errorLista.set(this.mensajeError(error.status, 'No se pudieron cargar las conversaciones.'));
        return EMPTY;
      }))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(conversaciones => {
      this.errorLista.set('');
      this.conversaciones.set(conversaciones);
      if (this.activa() === null) {
        const preferida = this.solicitudInicial();
        const vivienda = this.viviendaInicial();
        const inicial = conversaciones.find(item => item.idSolicitud === preferida)
          ?? conversaciones.find(item => item.idPropiedad === vivienda && item.arrendador && item.reserva === 'CONFIRMADA')
          ?? conversaciones[0];
        if (inicial) {
          this.abrir(inicial.idSolicitud);
          if (inicial.idPropiedad === vivienda && inicial.arrendador && inicial.reserva === 'CONFIRMADA') {
            this.mostrarAccionAlquiler('finalizar');
          }
        }
      }
    });

    this.solicitud.pipe(
      switchMap(id => id === null ? EMPTY : timer(0, 3000).pipe(
        exhaustMap(() => this.api.leer(this.cuenta(), id).pipe(catchError(error => {
          this.errorChat.set(this.mensajeError(error.status, 'No se pudo actualizar el chat.'));
          return EMPTY;
        })))
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(mensajes => {
      this.errorChat.set('');
      const previos = this.mensajes();
      if (previos?.length !== mensajes.length || previos?.at(-1)?.idMensaje !== mensajes.at(-1)?.idMensaje) {
        this.mensajes.set(mensajes);
      }
    });
  }

  abrir(id: number): void {
    if (this.activa() === id || this.enviando()) return;
    this.activa.set(id);
    this.cerrarAccionAlquiler();
    this.mensajes.set(null);
    this.errorChat.set('');
    this.errorEnvio.set('');
    this.errorSolicitud.set('');
    this.errorReserva.set('');
    this.perfil.set(null);
    this.borrador = '';
    this.solicitud.next(id);
  }

  verPerfil(chat: Conversacion): void {
    if (!chat.arrendador || this.cargandoPerfil()) return;
    this.cargandoPerfil.set(true);
    this.errorSolicitud.set('');
    this.api.perfilEstudiante(this.cuenta(), chat.idSolicitud).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: perfil => {
        this.cargandoPerfil.set(false);
        if (this.activa() === chat.idSolicitud) {
          this.perfil.set(perfil);
          this.dialogoPerfil().nativeElement.showModal();
        }
      },
      error: error => {
        this.cargandoPerfil.set(false);
        if (this.activa() === chat.idSolicitud) {
          this.errorSolicitud.set(this.mensajeError(error.status, 'No se pudo cargar el perfil del estudiante.'));
        }
      }
    });
  }

  decidir(chat: Conversacion, situacion: DecisionSolicitud): void {
    if (!chat.arrendador || chat.situacion !== 'PENDIENTE' || this.procesandoDecision()) return;
    this.procesandoDecision.set(true);
    this.errorSolicitud.set('');
    this.api.resolver(this.cuenta(), chat.idSolicitud, situacion).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: actualizada => {
        this.procesandoDecision.set(false);
        this.conversaciones.update(lista => lista?.map(item =>
          item.idSolicitud === actualizada.idSolicitud ? actualizada : item) ?? []);
      },
      error: error => {
        this.procesandoDecision.set(false);
        if (this.activa() === chat.idSolicitud) {
          this.errorSolicitud.set(this.mensajeError(error.status, 'No se pudo actualizar la solicitud.'));
        }
      }
    });
  }

  gestionarReserva(chat: Conversacion, estado: EstadoReserva): void {
    if (this.procesandoReserva()) return;
    this.procesandoReserva.set(true);
    this.errorReserva.set('');
    this.api.gestionarReserva(this.cuenta(), chat.idSolicitud, estado)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: actualizada => {
          this.procesandoReserva.set(false);
          this.conversaciones.update(lista => lista?.map(item =>
            item.idSolicitud === actualizada.idSolicitud ? actualizada : item) ?? []);
          if (actualizada.reserva === 'CONFIRMADA') this.reservaConfirmada.emit(actualizada.idPropiedad);
        },
        error: error => {
          this.procesandoReserva.set(false);
          if (this.activa() !== chat.idSolicitud) return;
          this.errorReserva.set(this.mensajeError(error.status, error.status === 409
            ? 'La vivienda ya no está disponible o la reserva ya fue atendida.'
            : 'No se pudo actualizar la reserva. Inténtalo de nuevo.'));
        }
      });
  }

  mostrarAccionAlquiler(accion: 'finalizar' | 'resena'): void {
    this.cerrarAccionAlquiler();
    this.accionAlquiler = accion;
  }

  cerrarAccionAlquiler(): void {
    this.accionAlquiler = null;
    this.codigoLiberacion = '';
    this.calificacionResena = null;
    this.comentarioResena = '';
    this.errorReserva.set('');
  }

  finalizarAlquiler(chat: Conversacion): void {
    if (!chat.arrendador || chat.reserva !== 'CONFIRMADA' ||
        this.codigoLiberacion.trim() !== `LIBERAR-${chat.idSolicitud}`) return;
    this.procesarAccionAlquiler(chat, this.api.finalizarAlquiler(
      this.cuenta(), chat.idSolicitud, this.codigoLiberacion.trim()), 'No se pudo finalizar el alquiler.');
  }

  dejarResena(chat: Conversacion): void {
    const nota = this.calificacionResena;
    if (!chat.arrendador || chat.reserva !== 'FINALIZADA' || chat.resenaRegistrada ||
        nota === null || !Number.isInteger(nota) || nota < 1 || nota > 5) return;
    this.procesarAccionAlquiler(chat, this.api.dejarResena(
      this.cuenta(), chat.idSolicitud, nota, this.comentarioResena.trim()), 'No se pudo guardar la reseña.');
  }

  private procesarAccionAlquiler(chat: Conversacion, solicitud: Observable<Conversacion>, mensaje: string): void {
    if (this.procesandoReserva()) return;
    this.procesandoReserva.set(true);
    this.errorReserva.set('');
    const finalizando = this.accionAlquiler === 'finalizar';
    solicitud.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: actualizada => {
        this.procesandoReserva.set(false);
        this.conversaciones.update(lista => lista?.map(item =>
          item.idSolicitud === actualizada.idSolicitud ? actualizada : item) ?? []);
        if (this.activa() === chat.idSolicitud) this.cerrarAccionAlquiler();
        if (finalizando) this.alquilerFinalizado.emit(actualizada.idPropiedad);
      },
      error: error => {
        this.procesandoReserva.set(false);
        if (this.activa() === chat.idSolicitud) this.errorReserva.set(this.mensajeError(error.status, mensaje));
      }
    });
  }

  enviar(): void {
    const id = this.activa();
    const texto = this.borrador.trim();
    if (!id || !texto || texto.length > 1000 || this.enviando() || this.mensajes() === null) return;

    this.enviando.set(true);
    this.errorEnvio.set('');
    this.api.enviar(this.cuenta(), id, texto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: mensaje => {
        this.borrador = '';
        this.enviando.set(false);
        this.mensajes.update(lista => lista?.some(item => item.idMensaje === mensaje.idMensaje)
          ? lista : [...(lista ?? []), mensaje].slice(-100));
        this.solicitud.next(id);
      },
      error: error => {
        this.enviando.set(false);
        this.errorEnvio.set(this.mensajeError(error.status, 'No se pudo enviar el mensaje. Inténtalo de nuevo.'));
      }
    });
  }

  private mensajeError(estado: number, alternativa: string): string {
    return estado === 401 ? 'Vuelve a iniciar sesión para usar Mensajes.' : alternativa;
  }
}
