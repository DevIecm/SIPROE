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

  deleteSorteoR(fecha_sentencia_del: any, organo_jurisdiccional_del: number, motivo_del: string, numero_expediente_del: string, token: string, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    debugger
    const params = new HttpParams()
      .set('fecha_sentencia_del', fecha_sentencia_del)
      .set('organo_jurisdiccional_del', organo_jurisdiccional_del)
      .set('motivo_del', motivo_del)
      .set('numero_expediente_del', numero_expediente_del)
      .set('id', id)

      console.log(params)

    return this.http.delete(this.apiUrl + 'asignacion/deleteSorteoR', {params, headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  actualizaProyecto(token: string, registro: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    return this.http.patch(this.apiUrl + 'asignacion/actualizaProyecto', registro, {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  catRipoSorteo(ut: string, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams().set('ut', ut);

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


