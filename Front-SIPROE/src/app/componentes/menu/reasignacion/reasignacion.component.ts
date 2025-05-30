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
import { ReasignacionService } from '../../../services/reasignacionService/reasignacion.service';
import { AsignacionService } from '../../../services/asignacionService/asignacion.service';
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
   idDistrital = sessionStorage.getItem('dir') || '0';
   tokenSesion = sessionStorage.getItem('key') || '0';
   selectedUnidad: number | null = null;
   selectedTipo: number | null = null;
   unidades: any[] = [];
   organos: any[] = [];
   tipos: any[] = [];
   proyectos: any[] = [];
   clave_ut: string = '';
   aprobados: any;
   sorteados: any;
   sortear: any;
   fechaSeleccionada : Date | null = null;
   minFecha = new Date(2025, 6, 5);
   maxFecha = new Date(2025, 6, 9);
   idOrgano!: Number;
   pSortear: any[] = [];
   id_o!: Number;
   motivo: string = '';
   expediente: string = '';
   cambioDistrito: boolean = false;
   botonUsado: boolean = false;
   mostrarDiv: boolean = false;
   cambiaSorteo = false;
   sorteadosData!: boolean;
   guardoSorteo: boolean = false;
   sorteoIniciado!: boolean;
   ocultaTbla!: boolean;
   datosProyectosSinNumero: any[] = [];
   ocultaIfExist: boolean = false;
   llenadoForm: boolean = false;
   showDataAsigned: boolean = false;
   creoSorteo: boolean = false;
   mostrarAsignacion: boolean = false;
   muestraBotones: boolean = false;
   directa: boolean = false;
   tipoOrgano!: number;
   idSorteo!: number;
   organoDescripcion!: number;
   
   constructor(
    private http: HttpClient, 
    private servicea: AuthService, 
    private service: SorteoService, 
    private serviceReAsignacion: ReasignacionService, private serviceAsignacion: AsignacionService, private cdr: ChangeDetectorRef) {}
 
   ngOnInit(): void {

    this.mostrarAsignacion = true;
    this.muestraBotones = true;

    this.servicea.catUnidadFilter(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.unidades = data.catUnidad;
        this.selectedTipo = null;
      }, error: (err) => {
        console.error("Error al cargar unidades", err);
        if(err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }
      }
    });

    this.serviceReAsignacion.catRipoSorteo(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.tipos = data.catTipoSorteo;
      }, error: (err) => {
        console.error("Error al cargar Organos Jurisiccionales", err);
        if(err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }
      }
    });


   }
 
  onDistritoChange(element: any){
    this.clave_ut = element.clave_ut;
    this.selectedTipo = null;
    this.proyectos = [];
    this.mostrarDiv = false;
    this.cambioDistrito = true;
    this.mostrarAsignacion = true;
  }
 
  onTipoChange(element: any){
    this.tipoOrgano = element.id;
    if(element.id === 1 ) { this.directa = true } else { this.directa = false}
    this.mostrarDiv = true;
    this.botonUsado = false;
    this.getDataProyectos(this.clave_ut, parseInt(this.idDistrital), this.tipoOrgano, this.tokenSesion);
  }

  getDataProyectos(ut: string, distrito: number, tipoOrgano: number, token: string) {
    this.serviceReAsignacion.getDataProyectos(ut, distrito, tipoOrgano, token).subscribe({
      next: (data) => {

        this.proyectos = data.registrosProyectos;
        this.idSorteo = this.proyectos[0].sorteo;
        this.aprobados = this.proyectos[0].aprobados;
        this.sorteados = this.proyectos[0].sorteados;
        this.sortear = this.proyectos[0].sortear;
  
        
        if(this.proyectos.length > 0){
          if(this.proyectos[0].tipo === 1){
            this.llenadoForm = true;
            this.mostrarAsignacion = false;
            this.muestraBotones = false;
            this.cambioDistrito =  false;
          } else {
            this.fechaSeleccionada = this.proyectos[0].fecha_sentencia;
            this.motivo = this.proyectos[0].motivo;
            this.organoDescripcion = this.proyectos[0].organo_jurisdiccional;
            this.expediente = this.proyectos[0].numero_expediente;
            this.llenadoForm = true;
            this.mostrarAsignacion = false;
            this.muestraBotones = true;
          }
        }
        
      },
      error: (err) => {
        console.error("Error al cargar proyectos", err);
        if (err.error.code === 160) {
          this.servicea.cerrarSesionByToken();
        }
        if(err.error.code === 100) {
          this.proyectos = [];
          this.mostrarDiv = false;
          this.guardoSorteo = true;
          this.cambioDistrito = true;
          Swal.fire("No se encontraron registros")
        }
      }
    });
  }
 
  columnasVisibles = ['year', 'sorteo', 'clave', 'ut', 'fecha', 'total'];
   
  deshacerSorteo() {
    this.sorteoIniciado = false;
    this.guardoSorteo = false;
    this.proyectos = [];
    this.botonUsado = false;
    this.selectedUnidad = null;
    this.mostrarDiv = false;
    this.ocultaTbla = false;
    this.datosProyectosSinNumero = [];
    this.ocultaIfExist = false;
    this.llenadoForm = false;
    this.motivo = '';
    this.fechaSeleccionada = null;
    this.expediente = '';
    this.organoDescripcion = 0;
    this.selectedTipo = null;
    this.mostrarAsignacion = true;
  }

  cancelarAsignacion() {
    if(this.directa){

      const registro = {
        sorteo: this.idSorteo
      };

      this.serviceReAsignacion.actualizaProyecto(this.tokenSesion, registro).subscribe({
              next: (resp) => {
                Swal.fire("Sorteo de eliminado con éxito");
                this.deshacerSorteo();
              }, error: (err) => {
                console.error("Error al guardar proyecto", registro, err);

                if(err.error.code === 160) {
                  this.servicea.cerrarSesionByToken();
                }
              }
            });
    } else {
      console.log("directa")
    }
  }

  eliminarSorteo() {

    Swal.fire({
      title: "¿Está seguro de eliminar este Sorteo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {

        this.serviceReAsignacion.deleteSorteo(this.tokenSesion, this.idSorteo).subscribe({
          next: (data) => {
            
            this.idSorteo = data.id;

            const registro = {
              sorteo: this.idSorteo
            };

            this.serviceReAsignacion.actualizaProyecto(this.tokenSesion, registro).subscribe({
              next: (resp) => {
                Swal.fire("Sorteo de eliminado con éxito");
                this.deshacerSorteo();
              }, error: (err) => {
                console.error("Error al guardar proyecto", registro, err);

                if(err.error.code === 160) {
                  this.servicea.cerrarSesionByToken();
                }
              }
            });
          }, error: (err) => {
            if (err.error.code === 160) {
              this.servicea.cerrarSesionByToken();
            }
            if(err.error.code === 100) {
              this.proyectos = [];
              this.guardoSorteo = true;
              Swal.fire("Error al eliminar sorteo");
            }
          }
        })
      }
    });
  }

  fechaValida = (d: Date | null): boolean => {
    if (!d) return false;
    return d >= this.minFecha && d <= this.maxFecha;
  }   
}