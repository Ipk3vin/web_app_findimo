import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/api/usuarios/favoritos';

  listar(cuenta: number) {
    return this.http.get<number[]>(this.url, { withCredentials: true, params: { cuenta } });
  }

  guardar(cuenta: number, propiedad: number, activo: boolean) {
    return this.http.put<void>(`${this.url}/${propiedad}`, null, {
      withCredentials: true,
      params: { cuenta, activo }
    });
  }
}
