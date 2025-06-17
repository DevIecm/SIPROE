import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  catOrgano(idDistrito: number, token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams().set('idDistrito', idDistrito);

    return this.http.get(this.apiUrl + 'catOrganoJ/catOrgano' , {headers, params})
        .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error);}))
  }
  
  insertaSorteo(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    return this.http.post(this.apiUrl + 'asignacion/insertaSorteo', data, {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))

  }

  catMotivo(token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(this.apiUrl + 'catMotivo/catMotivo' , {headers})
        .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error);}))
  }
}