import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})

export class ResultadosService {

  private apiUrl = `${environment.apiUrl}`;
  // private apiUrl = 'https://app.iecm.mx/siproe-aleatorio2025/api/';

  constructor(private http: HttpClient) { }
  
  getDataProyectos(ut: string, distrito: number, tipo: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('ut', ut)
      .set('distrito', distrito)
      .set('tipo', tipo)

    return this.http.get(this.apiUrl + 'resultados/getProyectos', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  getDataProyectosFull(ut: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('ut', ut)

    return this.http.get(this.apiUrl + 'resultados/getProyectosFull', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }
}
