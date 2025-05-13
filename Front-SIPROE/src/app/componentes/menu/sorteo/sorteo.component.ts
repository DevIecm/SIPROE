import { AfterViewInit, ChangeDetectionStrategy, ViewChild, Component } from '@angular/core';
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
import {MatGridListModule} from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';

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

  selectedValue(option: string) {

    this.mostrarDiv = true;
    console.log("option", option)
    return this.selectedValues === option;
  }

  dataSource = new MatTableDataSource([
    { position: 'F001', numero: '' },
    { position: 'F002', numero: '' },
    { position: 'F003', numero: '' },
  ]);

  columnasVisibles = ['position'];

  iniciarSorteo() {
    Swal.fire({
      title: 'Aleatorización en proceso',
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          this.asignarNumerosAleatorios();
          this.sorteoIniciado = true;
          this.columnasVisibles = ['position', 'numero'];
          Swal.close();
        }, 2000);
      }
    });
  }

  cambiarsalida() {
    Swal.fire({
      title: "¿Está seguro de cambiar el orden de salida?",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Cambio de orden de salida En Proceso',
          didOpen: () => {
            Swal.showLoading();
            setTimeout(() => {
              this.asignarNumerosAleatorios();
              this.sorteoIniciado = true;
              this.columnasVisibles = ['position', 'numero'];
              Swal.close();
            }, 2000);
          }
        });
        this.cambiaSorteo = true;
      }
    });
  }

  asignarNumerosAleatorios() {
    const usados = new Set<number>();
    const nuevosDatos = this.dataSource.data.map(project => {
      let numero: number;

      do {
        numero = Math.floor(Math.random() * 200); // puedes ajustar el rango si es necesario
      } while (usados.has(numero));

      usados.add(numero);

      return {
        ...project,
        numero: numero.toString(),
      };
  });

  this.dataSource.data = nuevosDatos;
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
        Swal.fire({
          title: 'Sorteo deshecho con éxito'
        });
        this.cambiaSorteo = true;
      }

       this.sorteoIniciado = false;
        this.columnasVisibles = ['position'];
        const data = this.dataSource.data.map(item => ({
          ...item,
          numero: ''
        }));
        this.dataSource.data = data;
    });
  }

  cambiarOrden() {
    this.asignarNumerosAleatorios();
  }

  aceptarSorteo() {
    Swal.fire({
      title: "Sorteo aplicado con éxito!",
      icon: "success",
      draggable: true
    });

    this.columnasVisibles = ['position'];
    const data = this.dataSource.data.map(item => ({
      ...item,
      numero: ''
    }));
    this.dataSource.data = data;

    this.sorteoIniciado = false;

    // y que actulize las card de proyectos
  }
}