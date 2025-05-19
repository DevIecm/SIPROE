import { Component } from '@angular/core';
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

  constructor(private http: HttpClient, private servicea: AuthService, private service: SorteoService) {}

  ngOnInit(): void {
    this.servicea.catUnidad(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.unidades = data.catUnidad;
      }, error: (err) => {
        console.error("Error al cargar unidades", err);
      }
    });
  }

  onDistritoChange(element: any){
    this.mostrarDiv = true;
    this.clave_ut = element.clave_ut;
    this.getDataProyectos(this.clave_ut, parseInt(this.idDistrital), this.tokenSesion)
  }

  getDataProyectos(ut: string, distrito: number, token: string) {
    this.service.getDataProyectos(ut, distrito, token).subscribe({
      next: (data) => {        
        this.proyectos = data.registrosProyectos;
        this.aprobados = this.proyectos[0].aprobados;
        this.sorteados = this.proyectos[0].sorteados;
        this.sortear = this.proyectos[0].sortear;
      }, error: (err) => {
        console.error("Error al cargar proyectos", err);
      }
    })
  }

  columnasVisibles = ['position'];

  iniciarSorteo() {
    this.cambiaSorteo = false;
    this.service.mostrarAnimacion(this.proyectos.length);
    
    setTimeout(() => {
      this.asignarNumerosAleatorios();
      this.sorteoIniciado = true;
      this.columnasVisibles = ['position', 'numero'];
      this.service.ocultarAnimacion();
    }, 5000);
  }

  asignarNumerosAleatorios() {
    const usados = new Set<number>();

    if (!this.cambiaSorteo) {
      this.proyectos.forEach(p => {
        const n = parseInt(p.numero_aleatorio);
        if (!isNaN(n)) usados.add(n);
      });
    }

    this.proyectos = this.proyectos.map(p => {
      let numero: number;

      if (!this.cambiaSorteo && p.numero_aleatorio && p.numero_aleatorio !== '') {
        return { ...p, numero: p.numero_aleatorio };
      }

      do {
        numero = Math.floor(Math.random() * this.aprobados) + 1;
      } while (usados.has(numero));

      usados.add(numero);

      return {
        ...p,
        numero: numero.toString()
      };
    });
  }

  deshacerSorteo() {
    Swal.fire({
      title: "¿Está seguro de deshacer este Sorteo?",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Sorteo deshecho con éxito' });

        this.sorteoIniciado = false;
        this.columnasVisibles = ['position'];

        this.proyectos = this.proyectos.map(item => ({
          ...item,
          numero: ''
        }));

        this.cambiaSorteo = false;
      }
    });
  }

  cambiarOrden() {
    this.asignarNumerosAleatorios();
  }

  aceptarSorteo() {
    this.service.insertaSorteo(this.tokenSesion).subscribe({
      next: (data) => {
        
      Swal.fire({
        title: "Sorteo aplicado con éxito!",
        icon: "success",
        draggable: true
      });
        console.log("a", data)
      }, error: (err) => {
        console.error("Error al cargar unidades", err);
      }
    });

    this.columnasVisibles = ['position'];
    const data = this.proyectos.map(item => ({
      ...item,
      numero: ''
    }));

    console.log("register", data);

    this.proyectos = data;
    this.sorteoIniciado = false;

  }
}