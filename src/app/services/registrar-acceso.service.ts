// src/app/services/registro-acceso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RegistroAcceso {
  id?: number;
  RUT: string;
  nombre_completo: string;
  parcela: number;
  patente: string;
  vehiculo: string;
  motivo: string;
  nombre_empresa?: string;
  fecha_hora: string;
  nota: string;
}

// Interface para paginación
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class RegistroAccesoService {
  private apiUrl = `${environment.apiUrl}api/registro-acceso/`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    const token = this.auth.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // Ahora getRegistros soporta paginación
  getRegistros(page: number = 1, search: string = '') {
  let url = `${this.apiUrl}?page=${page}`;
  if (search) url += `&search=${search}`;
  return this.http.get<PaginatedResponse<RegistroAcceso>>(url, this.getHeaders());
}


  createRegistro(data: RegistroAcceso): Observable<RegistroAcceso> {
    return this.http.post<RegistroAcceso>(this.apiUrl, data, this.getHeaders());
  }

  updateRegistro(id: number, data: RegistroAcceso): Observable<RegistroAcceso> {
    return this.http.put<RegistroAcceso>(`${this.apiUrl}${id}/`, data, this.getHeaders());
  }

  deleteRegistro(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`, this.getHeaders());
  }
}
