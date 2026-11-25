import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CatalogosPropiedad, Propiedad, PropiedadRequest } from '../models/propiedad.model';

@Injectable({
  providedIn: 'root'
})
export class PropiedadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/propiedades';

  obtenerCatalogos(): Observable<CatalogosPropiedad> {
    return this.http.get<CatalogosPropiedad>(`${this.apiUrl}/catalogos`);
  }

  obtenerTodas(): Observable<Propiedad[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((backendItems) => {
        if (!backendItems || backendItems.length === 0) {
          return [];
        }

        return backendItems.map(item => {
          const precioNum = Number(item.precio) || 0;
          const titulo = item.titulo || 'Propiedad';
          const descripcion = item.descripcion || '';
          const direccion = item.direccion || '';
          const distrito = item.distrito || '';
          const habitaciones = item.habitaciones || 1;
          const fotosGuardadas = [...new Set((item.imagenes as string[] | undefined)?.filter(Boolean))].map(ruta => ({
            ruta,
            url: ruta.startsWith('/imagenes/') ? new URL(ruta, this.apiUrl).href : ruta
          }));

          return {
            idPropiedad: item.idPropiedad,
            idPerfilArrendador: item.idPerfilArrendador ?? undefined,
            titulo: titulo,
            descripcion: descripcion,
            precio: precioNum,
            habitaciones: habitaciones,
            banos: habitaciones >= 3 ? 2 : 1,
            area: item.area ?? null,
            direccion: direccion,
            distrito: distrito,
            entorno: item.entorno ?? [],
            reservada: item.reservada === true,
            estado: item.estado !== undefined ? item.estado : true,
            idTipoPropiedad: item.idTipoPropiedad ?? null,
            idsServicios: item.idsServicios ?? [],
            universidad: this.determinarUniversidad(titulo, descripcion, direccion, distrito),
            calificacion: item.calificacion ?? undefined,
            totalResenas: item.totalResenas ?? 0,
            subtituloDetalle: `${habitaciones} Hab · Baño en el alojamiento`,
            arrendadorNombre: item.arrendadorNombre,
            imagenesGaleria: fotosGuardadas.map(foto => foto.url),
            fotosGuardadas,
            esFavorito: false
          };
        });
      })
    );
  }

  guardarPropiedad(request: PropiedadRequest, fotos: File[], id?: number): Observable<unknown> {
    const datos = new FormData();
    datos.append('propiedad', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    for (const foto of fotos) {
      datos.append('fotos', foto);
    }
    return id === undefined
      ? this.http.post(this.apiUrl, datos, { withCredentials: true })
      : this.http.put(`${this.apiUrl}/${id}`, datos, { withCredentials: true });
  }

  determinarUniversidad(titulo: string, descripcion: string, direccion: string, distrito: string): string {
    const texto = `${titulo} ${descripcion} ${direccion} ${distrito}`.toLowerCase();
    if (texto.includes('piura') || texto.includes('udep')) {
      return 'Universidad de Piura';
    }
    if (texto.includes('ucsur') || texto.includes('cientifica') || texto.includes('científica')) {
      return 'UCSUR';
    }
    if (texto.includes('upc') || texto.includes('chorrillos')) {
      return 'UPC Chorrillos';
    }
    if (texto.includes('san isidro') || texto.includes('miraflores')) {
      return 'Universidad de Piura';
    }
    if (texto.includes('sur') || texto.includes('villa')) {
      return 'UCSUR';
    }
    return 'UPC Chorrillos';
  }


}
