import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ReasignacionService {
  private apiUrl = 'http://localhost:4000/api/'

  constructor(private router: Router, private http: HttpClient) { }


  deleteSorteo(token: string, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    const params = new HttpParams().set('id', id);

    return this.http.delete(this.apiUrl + 'asignacion/deleteSorteo', {params, headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  actualizaProyecto(token: string, registro: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    return this.http.patch(this.apiUrl + 'asignacion/actualizaProyecto', registro, {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  catRipoSorteo(idDistrito: number, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams().set('idDistrito', idDistrito);

    return this.http.get(this.apiUrl + 'catTipoSorteo/catTipoSorteo' , {headers, params})
        .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error);}))
  }

  getDataProyectos(ut: string, distrito: number, tipo: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    const params = new HttpParams()
      .set('ut', ut)
      .set('distrito', distrito)
      .set('tipo', tipo)

    return this.http.get(this.apiUrl + 'asignacion/getSorteosFilter', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }
}


