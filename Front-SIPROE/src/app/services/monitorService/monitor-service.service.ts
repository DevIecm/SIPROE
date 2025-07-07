import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private apiUrl = environment.apiUrl;

  constructor( private http: HttpClient) {}

  getMonitorData(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
    return this.http.get(this.apiUrl + 'monitor/dataMonitor', {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))
  }
}
