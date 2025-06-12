import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = `${environment.apiUrl}`;
  // private apiUrl = 'https://app.iecm.mx/siproe-aleatorio2025/api/';
  
  constructor(private http: HttpClient) { }

  proyectosParticipantes(tipoUsuario: number, idDistrito: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('idDistrito', idDistrito)
      .set('tipoUsuario', tipoUsuario)

    return this.http.get(this.apiUrl + 'reportes/getProyectosParticipantes', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  proyectosCancelados(tipoUsuario: number, idDistrito: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('idDistrito', idDistrito)
      .set('tipoUsuario', tipoUsuario)

    return this.http.get(this.apiUrl + 'reportes/getProyectosCancelados', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => {return throwError(() => error);}))
  }

  proyectosAsignacion(tipoUsuario: number, idDistrito: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('idDistrito', idDistrito)
      .set('tipoUsuario', tipoUsuario)

    return this.http.get(this.apiUrl + 'reportes/getProyectosAsignacion', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

}
