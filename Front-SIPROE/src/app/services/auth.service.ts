import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from './enviroment/enviroment';
@Injectable({ providedIn: 'root' })

export class AuthService {
  
  private apiUrl = `${environment.apiUrl}`;

  constructor(private router: Router, private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl + 'users/login', {
      username,
      password
    }).pipe(catchError((error: HttpErrorResponse) => {return throwError(() => error);}));
  }

  catUnidad(idDistrito: number, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams().set('idDistrito', idDistrito);

    return this.http.get(this.apiUrl + 'catalogos/catUnidad' , {headers, params})
        .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error);}))
  }

  catUnidadFilterSorteo(idDistrito: number, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams().set('idDistrito', idDistrito);

    return this.http.get(this.apiUrl + 'catalogos/catunidadFilterSorteo' , {headers, params})
        .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error);}))
  }

  catUnidadFilterSorteoAnio(idDistrito: number, anio: number, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams().set('idDistrito', idDistrito).set('anio', anio.toString());

    return this.http.get(this.apiUrl + 'catalogos/catunidadFilterSorteoAnio' , {headers, params})
        .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error);}))
  }

  catUnidadFilter(idDistrito: number, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams().set('idDistrito', idDistrito);

    return this.http.get(this.apiUrl + 'catalogos/catUnidadFilter' , {headers, params})
        .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error);}))
  }


  getRegistros(claveUt: number, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams().set('claveUt', claveUt);

    return this.http.get(this.apiUrl + 'calendario/getCalendario', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }
  
  delRegistros(claveUt: string, anio: number, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // const preue = {
    //   idUt: claveUt,
    //   anio: anio
    // }

    const params = new HttpParams().set('idUt', claveUt).set('anio', anio.toString());

    return this.http.delete(this.apiUrl + 'calendario/delRegistros', {headers, params})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))

  }

  guardaRegistros(regData: any, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(this.apiUrl + 'calendario/guardaCalendario', regData, {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  actualizaRegistros(actData: any, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.patch(this.apiUrl + 'calendario/actualizaRegistros', actData, {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }

  cerrarSesionByToken() {
    this.router.navigate(['']);
  } 
}