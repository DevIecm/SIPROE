import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SorteoService {
  private apiUrl = 'http://localhost:4000/api/';
  private canvasId = 'sorteo-canvas';

  constructor(private http: HttpClient) { }

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

  mostrarAnimacion(cantidad: number = 10) {
    const existing = document.getElementById(this.canvasId);
    if (existing) existing.remove(); // elimina si ya existe

    const canvas = document.createElement('canvas');
    canvas.id = this.canvasId;
    canvas.width = 500;
    canvas.height = 400;
    canvas.style.position = 'fixed';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.zIndex = '1000';
    canvas.style.backdropFilter = 'blur(5px)';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    class Pelota {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radio = 20;
      color: string;
      activa = true;

      constructor(public numero: number) {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = Math.random() * (canvas.height - 40) + 20;
        this.vx = (Math.random() * 2 - 1) * 2;
        this.vy = (Math.random() * 2 - 1) * 2;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
      }

      mover() {
        if (!this.activa) return;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x + this.radio > canvas.width || this.x - this.radio < 0) this.vx *= -1;
        if (this.y + this.radio > canvas.height || this.y - this.radio < 0) this.vy *= -1;
      }

      dibujar(ctx: CanvasRenderingContext2D) {
        if (!this.activa) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'black';
        ctx.font = '15px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.numero.toString(), this.x, this.y);
      }
    }

    const pelotas: Pelota[] = [];
    for (let i = 1; i <= cantidad; i++) pelotas.push(new Pelota(i));

    function detectarColisiones() {
      for (let i = 0; i < pelotas.length; i++) {
        const p1 = pelotas[i];
        if (!p1.activa) continue;

        for (let j = i + 1; j < pelotas.length; j++) {
          const p2 = pelotas[j];
          if (!p2.activa) continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = p1.radio + p2.radio;

          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            const v1 = { x: p1.vx * cos + p1.vy * sin, y: p1.vy * cos - p1.vx * sin };
            const v2 = { x: p2.vx * cos + p2.vy * sin, y: p2.vy * cos - p2.vx * sin };

            [v1.x, v2.x] = [v2.x, v1.x];

            p1.vx = v1.x * cos - v1.y * sin;
            p1.vy = v1.y * cos + v1.x * sin;
            p2.vx = v2.x * cos - v2.y * sin;
            p2.vy = v2.y * cos + v2.x * sin;
          }
        }
      }
    }

    function animar() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      detectarColisiones();
      pelotas.forEach((p) => {
        p.mover();
        p.dibujar(ctx);
      });
      requestAnimationFrame(animar);
    }

    animar();

    let index = 0;
    const intervalo = setInterval(() => {
      if (index < pelotas.length) {
        pelotas[index].activa = false;
        index++;
      } else {
        clearInterval(intervalo);
        this.ocultarAnimacion();
      }
    }, 1000);
  }

  ocultarAnimacion() {
    const canvas = document.getElementById(this.canvasId);
    if (canvas) canvas.remove();
  }

  insertaSorteo(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` 
    });

    console.log(headers)
    return this.http.post(this.apiUrl + 'sorteo/insertaSorteo', {}, {headers})
      .pipe(catchError((error: HttpErrorResponse) => { return throwError(() => error); }))

  }
  
}
