import { ChangeDetectorRef, Component } from '@angular/core';
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
import { provideNativeDateAdapter } from '@angular/material/core';
import { getSpanishPaginatorIntl } from '../invitacion/mat-paginator-intl-es';
import { MatPaginatorIntl } from '@angular/material/paginator';


@Component({
  selector: 'app-asignacion',
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
    templateUrl: './reasignacion.component.html',
    styleUrl: './reasignacion.component.css',
    providers: [ { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },  provideNativeDateAdapter() ]
})
export class ReasignacionComponent {
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
  fechaSeleccionada : Date | null = null;
  minFecha = new Date(2025, 6, 5);
  maxFecha = new Date(2025, 6, 9);

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
    this.getDataProyectos(this.clave_ut, parseInt(this.idDistrital), this.tokenSesion)
  }


  getDataProyectos(ut: string, distrito: number, token: string) {
    this.service.getDataProyectos(ut, distrito, token).subscribe({
      next: (data) => {        
        this.proyectos = data.registrosProyectos;

        this.aprobados = this.proyectos[0].aprobados;
        this.sorteados = this.proyectos[0].sorteados;
        this.sortear = this.proyectos[0].sortear;

        if(this.sorteados === 0){
          this.sorteadosData = false;
        } else {
          this.sorteadosData = true;
        }

        const hayNumeros = this.proyectos.some(p => p.numero_aleatorio && p.numero_aleatorio !== '');

        if (hayNumeros) {
          this.sorteoIniciado = true;
          this.columnasVisibles = ['position', 'numero'];

          this.proyectos = this.proyectos.map(p => ({
            ...p,
            numero: p.numero_aleatorio
          }));
        } else {
          this.sorteoIniciado = false;
          this.columnasVisibles = ['position'];
        }
      },
      error: (err) => {
        console.error("Error al cargar proyectos", err);
        if (err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }
      }
    });
  }

  columnasVisibles = ['position'];

  iniciarSorteo() {
    this.cambiaSorteo = false;
    console.log(this.proyectos)
    // this.service.mostrarAnimacion(this.proyectos.length, (numero, index) => {
    //   this.proyectos[index].numero_aleatorio = numero.toString();
    //   this.cdr.detectChanges();
    // });
    
    // setTimeout(() => {
    //   this.asignarNumerosAleatorios();
    //   this.sorteoIniciado = true;
    //   this.columnasVisibles = ['position', 'numero'];
    //   this.service.ocultarAnimacion();
    // }, 5000);
         
    // if(this.sortear >0){
    //   this.guardoSorteo = true
    // }

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

        this.sorteoIniciado = false;
        this.columnasVisibles = ['position'];

        const registro = { sorteo: this.proyectos[0].sorteo };

        this.service.actualizaProyectoTo(this.tokenSesion, registro).subscribe ({
          next: (data) => {

            this.service.deleteSorteo(this.tokenSesion, this.proyectos[0].sorteo).subscribe ({
              next: (data) => { 

                Swal.fire({
                  title: "Sorteo deshecho con éxito!",
                  icon: "success",
                  draggable: false
                });

                this.getDataProyectos(this.clave_ut, parseInt(this.idDistrital), this.tokenSesion);

              }, error: (err) => {
                console.error("Error al actualizar datos del sorteo sorteo", err);
              }
            })

          }, error: (err) => {

            console.error("Error al actualizar datos del sorteo sorteo", err);

            if(err.error.code === 160) {
              this.servicea.cerrarSesionByToken();
            }

            this.cambiaSorteo = true;

            Swal.fire('Error', 'No se pudo deshacer el sorteo.', 'error')
          }  
        });

        this.proyectos = this.proyectos.map(item => ({
          ...item,
          numero: ''
        }));

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

    Swal.fire("Exito", "Sorteo y proyectos guardados correctamente.", "success");

    this.columnasVisibles = ['position'];
    this.sorteoIniciado = false;
  }

  fechaValida = (d: Date | null): boolean => {
    if (!d) return false;
    return d >= this.minFecha && d <= this.maxFecha;
  }


  displayedColumns: string[] = ['año', 'sorteo', 'clave', 'ut', 'fecha', 'total'];

}