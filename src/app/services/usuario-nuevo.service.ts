import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UsuarioNuevo {
  id: number;
  email: string;
  first_name: string;
  rut: string;
  lote: string;
  n_lote: string;
  color: string;
  is_active: boolean;  // o el campo que quieras mostrar
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioNuevoService {
  
  private apiUrl = `${environment.apiUrl}api/propietarios/`;
  constructor(private http: HttpClient) {}

  getParcelas(): Observable<UsuarioNuevo[]> {
    return this.http.get<UsuarioNuevo[]>(this.apiUrl);
  }
}
