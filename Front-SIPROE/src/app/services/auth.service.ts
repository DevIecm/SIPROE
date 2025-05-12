import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })

export class AuthService {
  private apiUrl = 'http://localhost:3000/api/'

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl + 'users/login', {
      username,
      password
    }).pipe(catchError((error: HttpErrorResponse) => {return throwError(() => error);}));
  }

  catUnidad() {
    console.log("unidad");
  }

  getRegistros() {
    console.log("registros");
  }
  
}
