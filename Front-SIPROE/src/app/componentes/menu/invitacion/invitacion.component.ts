import { AfterViewInit, ChangeDetectionStrategy, ViewChild, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FooterComponent } from '../../footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { AuthService } from '../../../services/auth.service';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Component({
  selector: 'app-invitacion',
  standalone: true,
  imports: [ 
    MatCardModule, 
    MatDatepickerModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatTableModule, 
    MatSelectModule, 
    FormsModule,
    MatPaginatorModule, 
    MatButtonModule, 
    MatProgressBarModule, 
    MatChipsModule, 
    FooterComponent,
    MatTimepickerModule,
    MatIcon,
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css',
  providers: [ provideNativeDateAdapter() ]
})

export class InvitacionComponent {

  datosRegistros!: boolean;
  loading = false;
  value!: Date;
  unidades: any[] = [];
  registros: any[] = [];
  selectedUnidad: number | null = null;
  idDistrital = sessionStorage.getItem('dir') || '0';
  tokenSesion = sessionStorage.getItem('key') || '0';
  fechaSeleccionada : Date | null = null;
  horaSeleccionada: string = '';
  territorioSelected!: boolean;
  registrosC!: number;
  dt!: number;
  modoEdicion: boolean = false;
  registroEnEdicion: any = null;
  selectedDistrito: boolean = false;
  existDataSame: boolean = false;
  dataReport: any[] = [];
  actualiza: boolean = false;
  dataUpdate: any;
  distritoChange: any;
  utChange: any;

  constructor(private http: HttpClient, private service: AuthService) {}

  ngOnInit(): void {

    this.service.catUnidad(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.unidades = data.catUnidad;
      }, error: (err) => {
        console.error("Error al cargar unidades", err);
      }
    });

    this.getDataService(parseInt(this.idDistrital));
  }

  getDataService(claveIUt: number) {
    this.service.getRegistros(claveIUt, this.tokenSesion).subscribe({
      next: (data) => {
        this.registros = data.registrosCalendario ?? [];
      }, error: (err) => {
         if (err.error.code === 100) {
          this.registros = [];
          this.datosRegistros = false;
        } else {
          console.error("Error al cargar registros", err);
        }
      }
    })
  }

  guardaData() {

    if(this.actualiza) {
      this.actualizaData();
    } else {

    const preue = {
      dt: this.dt,
      ut: this.registrosC,
      distrito: sessionStorage.getItem('dir'),
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada.trim()
    }

    this.loading = true;

    setTimeout(() => {
      this.loading = false;

      Swal.fire({
      title: "¿Está seguro de guardar esta programación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",

    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = false;

        this.service.guardaRegistros(preue, this.tokenSesion).subscribe({
           next: (data) => {  
                Swal.fire({
                  title: "Creación de la programacíon con éxito",
                  icon: "success"
                });

                this.service.getRegistros(parseInt(this.idDistrital), this.tokenSesion).subscribe({
                  next: (data) => {
                    this.registros = data.registrosCalendario ?? [];
                    this.datosRegistros = this.registros.some(d => this.registrosC === d.ut[0]);
                    this.fechaSeleccionada = null;
                    this.horaSeleccionada = '';
                  },
                  error: (err) => {
                    if (err.error.code === 100) {
                      this.registros = [];
                      this.datosRegistros = false;
                    } else {
                      console.error("Error al cargar registros", err);
                    }
                  }
                });
              }, error: (err) => {
              Swal.fire({
                title: "Error al crear la programacíon con éxito",
                icon: "warning"
              });
            }
        });
      } else {
        Swal.fire({
          title: "Error al crear la programacíon",
          icon: "warning"
        });
      }
    });
    }, 2000);
    }
  }

  extraerHoraUTC(iso: string): string {
    const date = new Date(iso);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours.toString().padStart(2, '0');

    return `${formattedHours}:${minutes} ${ampm}`;
  }

  async generaDocumento() {

    this.loading = true;

    const datos = {
      distrito: this.registros.length > 0 ? this.registros[0].distrito : null,
      productos: this.registros.map(item => ({
        id: item.id,
        dt: item.dt[1],
        clave: item.ut[0],
        ut: item.ut[1],
        fecha: item.fecha,
        hora: this.extraerHoraUTC(item.hora)
      }))
    };

    const templateBob = await this.http
      .get('assets/Anexo-Invitacion.docx', { responseType: 'arraybuffer' })
      .toPromise();

      if (!templateBob) {
        throw new Error("No se pudo cargar el Documento");
      }

      const zip = new PizZip(templateBob);
      const doc = new Docxtemplater(zip, { 
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '[[', end: ']]' }
      });

      doc.setData(datos);

      try{
        doc.render();
      } catch (error) {
        console.error('Error al cargar archivo', error);
        return;
      } 

      const output = doc.getZip().generate({ type: 'blob' });
      saveAs(output, 'Anexo Calendario.docx');

      this.loading = false;
  }

  eliminarElemento(element: any) {

    Swal.fire({
      title: "¿Está seguro de eliminar esta programación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delRegistros(element.ut[0], this.tokenSesion).subscribe({
          next: (data) => {
            Swal.fire({
              title: "Eliminación de la programacíon con éxito",
              icon: "success"
            });

             this.service.getRegistros(parseInt(this.idDistrital), this.tokenSesion).subscribe({
                next: (data) => {
                  this.registros = data.registrosCalendario ?? [];
                  this.datosRegistros = this.registros.some(d => this.registrosC === d.ut[0]);
                },
                error: (err) => {
                  if (err.error.code === 100) {
                    this.registros = [];
                    this.datosRegistros = false;
                  } else {
                    console.error("Error al cargar registros", err);
                  }
                }
              });
              
          }, error: (err) => {
             Swal.fire({
              title: "Error al eliminar la programacíon",
              icon: "warning"
            });
          }
        });
      }
    });
  }

  onDistritoChange(idDistrito: any) {
    this.territorioSelected = true;
    let idD = idDistrito.clave_ut;
    this.registrosC = idD;
    this.dt = idDistrito.idDt;
    this.dataReport = [];
    this.selectedDistrito = true;
    this.fechaSeleccionada = null;
    this.horaSeleccionada = '';
    this.datosRegistros = this.registros.some(d => idD === d.ut[0]);
  }

  formatearHora(fechaStr: string): string | null {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) {
      return null; // o lanzar error personalizado
    }
    return fecha.toISOString().substring(11, 19); // HH:mm:ss
  }

  actualizaData() {

    const data = { 
      distrito: this.distritoChange,
      hora: this.horaSeleccionada.trim(),
      ut: this.utChange,
      fecha: this.fechaSeleccionada
    };

     Swal.fire({
      title: "¿Está seguro de actualizar esta programación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",

    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = false;

          this.service.actualizaRegistros(data, this.tokenSesion).subscribe({
           next: (data) => {  
                Swal.fire({
                  title: "Actualización de la programacíon con éxito",
                  icon: "success"
                });

                this.service.getRegistros(parseInt(this.idDistrital), this.tokenSesion).subscribe({
                  next: (data) => {
                    this.registros = data.registrosCalendario ?? [];
                    this.datosRegistros = this.registros.some(d => this.registrosC === d.ut[0]);
                    this.fechaSeleccionada = null;
                    this.horaSeleccionada = '';
                  },
                  error: (err) => {
                    if (err.error.code === 100) {
                      this.registros = [];
                      this.datosRegistros = false;
                    } else {
                      console.error("Error al cargar registros", err);
                    }
                  }
                });
              }, error: (err) => {
              Swal.fire({
                title: "Error al actualizar la programacíon con éxito",
                icon: "warning"
              });
            }
        });
      } else {
        Swal.fire({
          title: "Error al actualizar la programacíon",
          icon: "warning"
        });
      }
    });

  }

  editarElemento(element: any) {

    const hora = new Date(element.hora);
    const fecha = new Date(element.fecha);
    this.datosRegistros = false;
    this.horaSeleccionada = hora.toISOString().substring(11, 16);
    this.fechaSeleccionada = fecha;
    this.distritoChange = element.distrito;
    this.utChange = element.ut[0]
    this.actualiza = true;

  }
  
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
}
