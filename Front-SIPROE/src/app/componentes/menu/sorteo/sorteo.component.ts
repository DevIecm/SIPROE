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
        if(err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }
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

        console.log("data", this.proyectos)
        this.aprobados = this.proyectos[0].aprobados;
        this.sorteados = this.proyectos[0].sorteados;
        this.sortear = this.proyectos[0].sortear;
      }, error: (err) => {
        console.error("Error al cargar proyectos", err);

        if(err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }
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

        const idSorteo = data.id;
        console.log(idSorteo);

        this.guardaProyectosConSorteo(idSorteo);

      }, error: (err) => {
        console.error("Error al crear sorteo", err);

        if(err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }

        Swal.fire('Error', 'No se pudo crear el sorteo.', 'error')
      }
    });

    
    // this.proyectos.forEach((item) => {
    //   const registro = {
    //     ...item,
    //     numero_aleatorio: item.numero
    //   };


    // console.log(registro);

    // this.columnasVisibles = ['position'];

    // const data = this.proyectos.map(item => ({
    //   ...item,
    //   numero_aleatorio: item.numero,
    //   sorteo: prueba
    // }));

    // console.log("register", data);

    // this.proyectos = data;
    // this.sorteoIniciado = false;

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
          console.log(resp)

        }, error: (err) => {
          console.error("Error al guardar proyecto", registro, err);

          if(err.error.code === 160) {
            this.servicea.cerrarSesionByToken();
          }
        }
      });
    });

    Swal.fire("Exito", "Sorteo y proyectos guardados correctamente.", "success");

    this.columnasVisibles = ['position'];
    this.sorteoIniciado = false;
  }

}