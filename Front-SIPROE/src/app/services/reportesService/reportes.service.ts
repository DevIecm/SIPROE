import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = 'http://localhost:4000/api/';

  constructor(private http: HttpClient) { }

  proyectosParticipantes(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(this.apiUrl + 'reportes/getProyectosParticipantes', {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  proyectosCancelados(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(this.apiUrl + 'reportes/getProyectosCancelados', {headers})
      .pipe(catchError((error: HttpErrorResponse) => {return throwError(() => error);}))
  }

  proyectosAsignacion(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(this.apiUrl + 'reportes/getProyectosAsignacion', {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

}
