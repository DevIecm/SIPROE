import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FooterComponent } from '../../footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { SorteoService } from '../../../services/sorteoService/sorteo.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sorteo',
  standalone: true,
  imports: [ 
    MatCardModule, 
    MatDatepickerModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatTableModule, 
    MatSelectModule, 
    FormsModule,
    MatButtonModule, 
    MatProgressBarModule, 
    MatChipsModule, 
    FooterComponent,
    MatTimepickerModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatGridListModule,
    MatIcon
  ],
  templateUrl: './sorteo.component.html',
  styleUrl: './sorteo.component.css'
})

export class SorteoComponent {
  selectedValues: string = '';
  sorteoIniciado = false;
  mostrarDiv: boolean = false;
  cambiaSorteo = false;
  idDistrital = sessionStorage.getItem('dir') || '0';
  tokenSesion = sessionStorage.getItem('key') || '0';
  selectedUnidad: number | null = null;
  unidades: any[] = [];
  proyectos: any[] = [];
  clave_ut: string = '';
  aprobados: any;
  sorteados: any;
  sortear: any;
  animandoSorteo!: boolean;
  sorteadosData!: boolean;
  guardoSorteo: boolean = false;
  private canvasId = 'sorteo-canvas';
  sinRegistro!: boolean;
  botonUsado: boolean = false;

  @ViewChild('canvasContainer', { static: false }) canvasContainerRef!: ElementRef<HTMLDivElement>;
  constructor(private http: HttpClient, private servicea: AuthService, private service: SorteoService,  private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.servicea.catUnidad(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.unidades = data.catUnidad;
      }, error: (err) => {
        console.error("Error al cargar unidades", err);
        if(err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }
      }
    });
  }

  onDistritoChange(element: any){
    this.mostrarDiv = true;
    this.clave_ut = element.clave_ut;
    this.botonUsado = false;
    this.getDataProyectos(this.clave_ut, parseInt(this.idDistrital), this.tokenSesion);
  }

  getDataProyectos(ut: string, distrito: number, token: string) {
    this.service.getDataProyectos(ut, distrito, token).subscribe({
      next: (data) => {        
        this.proyectos = data.registrosProyectos;

        this.aprobados = this.proyectos[0].aprobados;
        this.sorteados = this.proyectos[0].sorteados;
        this.sortear = this.proyectos[0].sortear;
        this.sinRegistro = false;


        if(this.sorteados === 0){
          this.sorteadosData = false;
        } else {
          this.sorteadosData = true;
        }

        const hayNumeros = this.proyectos.some(p => p.numero_aleatorio && p.numero_aleatorio !== '');

        if (hayNumeros) {
          this.sorteoIniciado = true;
          this.guardoSorteo = false;
          this.ocultarAnimacion();
          this.proyectos = this.proyectos.map(p => ({
            ...p,
            numero: p.numero_aleatorio
          }));
          this.columnasVisibles = ['position', 'numero'];
        } else {
           this.animandoSorteo = true;
        
        this.mostrarAnimacion(this.proyectos.length, (numero, index) => {});
        this.sorteoIniciado = false;
        this.columnasVisibles = ['id', 'position', 'numero'];
        }
      },
      error: (err) => {
        console.error("Error al cargar proyectos", err);
        if (err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }
        if(err.error.code === 100) {
          this.sinRegistro = true;
          this.proyectos = [];
          this.guardoSorteo = true;
          
          Swal.fire("No se encontraron registros")
          this.deshacerSorteo();
        }
      }
    });
  }

  columnasVisibles = ['id', 'position', 'numero'];

  iniciarSorteo() {
    this.cambiaSorteo = false;
    this.botonUsado = true;

    this.mostrarAnimacion(this.proyectos.length, (numero, index) => {
      this.proyectos[index].numero_aleatorio = numero.toString();
      this.cdr.detectChanges();
    });
    
    if(this.sortear > 0) {
      this.guardoSorteo = true;
    }
  }

  deshacerSorteo() {
    this.sorteoIniciado = false;
    this.guardoSorteo = false;
    this.proyectos = [];
    this.sinRegistro = false;
    this.botonUsado = false;
    this.selectedUnidad = null;
    this.mostrarDiv = false;    
  }

  aceptarSorteo() {

    this.service.insertaSorteo(this.tokenSesion).subscribe({
      next: (data) => {
        
        Swal.fire({
          title: "Sorteo aplicado con éxito!",
          icon: "success",
          draggable: true
        });

        const idSorteo = data.id;
        this.guardaProyectosConSorteo(idSorteo);
        this.guardoSorteo = false;

      }, error: (err) => {
        console.error("Error al crear sorteo", err);

        if(err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }

        Swal.fire('Error', 'No se pudo crear el sorteo.', 'error')
      }
    });

  }

  guardaProyectosConSorteo(idSorteo: number) {
    this.proyectos.forEach((proyecto) => {
      const registro = {
        folio: proyecto.folio,
        numero_aleatorio: proyecto.numero,
        sorteo: idSorteo
      };

      this.service.actualizaProyecto(this.tokenSesion, registro).subscribe({
        next: (resp) => {
          this.getDataProyectos(this.clave_ut, parseInt(this.idDistrital), this.tokenSesion);
        }, error: (err) => {
          console.error("Error al guardar proyecto", registro, err);

          if(err.error.code === 160) {
            this.servicea.cerrarSesionByToken();
          }
        }
      });
    });

    Swal.fire("Exito", "Sorteo aplicado con éxito.", "success");

    this.sorteoIniciado = false;
  }

  mostrarAnimacion(cantidad: number = 10, onNumeroAsignado?: (numero: number, index: number) => void) {
    const existing = document.getElementById(this.canvasId);
    if (existing) existing.remove();

    const canvas = document.createElement('canvas');
    canvas.id = this.canvasId;
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.zIndex = '1000';

    requestAnimationFrame(() => {
      const container = document.getElementById('container');
      if (container) {
        container.appendChild(canvas);
      } else {
        console.warn('No se encontró el contenedor para la animación');
      }
    });

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

            const overlap = minDist - dist;
            const separation = overlap / 2;

            p1.x -= cos * separation;
            p1.y -= sin * separation;
            p2.x += cos * separation;
            p2.y += sin * separation;
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

    const usados = new Set<number>();
    let indexActual = 0;

    if(this.botonUsado){

      const intervalo = setInterval(() => {
        if (indexActual >= pelotas.length) {
          clearInterval(intervalo);

          setTimeout(() => {
            this.cdr.detectChanges();
            setTimeout(() => {
              this.ocultarAnimacion();
              this.sorteoIniciado = true;
            }, 300);
          }, 100);

          return;
        }

        const pelota = pelotas[indexActual];
        pelota.activa = false;

        let numero: number;

        do {
          numero = Math.floor(Math.random() * cantidad) + 1;
        } while (usados.has(numero));
        usados.add(numero);

        if (onNumeroAsignado) {
          onNumeroAsignado(numero, indexActual);
        }

        this.proyectos[indexActual].numero = numero.toString();

        indexActual++;
      }, 600);
    }
  }

  ocultarAnimacion() {
    const canvas = document.getElementById(this.canvasId);
    if (canvas) canvas.remove();
  }
}