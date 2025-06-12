import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})

export class SorteoService {
  private apiUrl = environment.apiUrl; 

  constructor (private http: HttpClient) {
    
    if (environment.production) {
      console.log('Modo producción activado');
    } else {
      console.log('Modo desarrollo');
    }
  }
  
  getDataProyectos(ut: string, distrito: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    const params = new HttpParams()
      .set('ut', ut)
      .set('distrito', distrito)

    return this.http.get(this.apiUrl + 'sorteo/getSorteos', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  insertaSorteo(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    return this.http.post(this.apiUrl + 'sorteo/insertaSorteo', data, {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))

  }

  actualizaProyecto(token: string, registro: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    return this.http.patch(this.apiUrl + 'sorteo/actualizaProyecto', registro, {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }
  
  deleteSorteo(token: string, id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    const params = new HttpParams().set('id', id);

    return this.http.delete(this.apiUrl + 'sorteo/deleteSorteo', {params, headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  actualizaProyectoTo(token: string, registro: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    return this.http.patch(this.apiUrl + 'sorteo/actualizaToDelete', registro, {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }
}
