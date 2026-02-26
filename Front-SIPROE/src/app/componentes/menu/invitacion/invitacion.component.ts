import { ViewChild, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { MatPaginator } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from './mat-paginator-intl-es';
import { CustomDateAdapter } from './custom-date-formats';

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
    MatTimepickerModule,
    MatIcon,
    MatProgressSpinnerModule,
    CommonModule,
    MatPaginator
  ],
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css',
  providers: [ 
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },// opcional: español
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },  provideNativeDateAdapter() ]
})


export class InvitacionComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>();
  value!: Date;

  selectedUnidad: number | null = null;
  idDistrital = sessionStorage.getItem('dir') || '0';
  tokenSesion = sessionStorage.getItem('key') || '0';
  fechaSeleccionada : Date | null = null;
  horaSeleccionada: string = '';
  horaSeleccionadas: string = '';
  
  registrosC!: number;
  dt!: number;
  anioSeleccionado!: string;

  registroEnEdicion: any = null;
  dataReport: any[] = [];
  opcionesHoras: string[] = [];
  unidades: any[] = [];
  registros: any[] = [];
  
  selectedDistrito: boolean = false;
  existDataSame: boolean = false;
  modoEdicion: boolean = false;
  actualiza: boolean = false;
  sinRegistros: boolean = false;
  territorioSelected!: boolean;
  datosRegistros!: boolean;
  loading = false;
  
  dataUpdate: any;
  distritoChange: any;
  utChange: any;
  minFecha = new Date(2026, 2, 20);
  maxFecha = new Date(2026, 2, 30);

  constructor(private http: HttpClient, private service: AuthService) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {

    this.generarOpcionesHoras('08:00', '23:55', 5)

    this.service.catUnidad(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.unidades = data.catUnidad;
      }, error: (err) => {
        
        if(err.error.code === 160) {
         this.service.cerrarSesionByToken();
        }
        
      }
    });

    this.getDataService(parseInt(this.idDistrital));
  }

  fechaValida = (d: Date | null): boolean => {
    if (!d) return false;
    return d >= this.minFecha && d <= this.maxFecha;
  }

  blockMonthNavigation(event: any) {
    setTimeout(() => {
      const calendar = document.querySelector('.mat-calendar');
      if (calendar) {
        const prevButton = calendar.querySelector('.mat-calendar-previous-button') as HTMLButtonElement;
        const nextButton = calendar.querySelector('.mat-calendar-next-button') as HTMLButtonElement;

        if (prevButton) prevButton.disabled = true;
        if (nextButton) nextButton.disabled = true;
      }
    }, 0);
  }

  validaHora() {
    if (!this.fechaSeleccionada) {
      this.existDataSame = false;
      return;
    }

    const fechaSeleccionadaStr = this.extractFecha(this.fechaSeleccionada);
    const anioSel = Number(this.anioSeleccionado);
    
    this.existDataSame = this.dataSource.data.some((element: any) => {

      const mismoAnio = Number(element.anio) === anioSel;
      
      if (!mismoAnio) {
        return false;
      }

      const horaProcesada = this.extraerHoraUTCToGetData(element.hora);
      const fechaProcesada = this.extractFecha(element.fecha);
      
      return (
        horaProcesada === this.horaSeleccionada &&
        fechaProcesada === fechaSeleccionadaStr
      );    
    });
  }

  generarOpcionesHoras(inicio: string, fin: string, intervaloMin: number) {
    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);

    const start = hInicio * 60 + mInicio;
    const end = hFin * 60 + mFin;

    for (let min = start; min <= end; min += intervaloMin) {
      const horas = String(Math.floor(min / 60)).padStart(2, '0');
      const minutos = String(min % 60).padStart(2, '0');
      this.opcionesHoras.push(`${horas}:${minutos}`);
    }
  }

  getDataService(claveIUt: number) {
    this.service.getRegistros(claveIUt, this.tokenSesion).subscribe({
      next: (data) => {
        this.dataSource.data = data.registrosCalendario ?? [];
        this.sinRegistros = false;
        this.datosRegistros = this.dataSource.data.some(d => this.registrosC === d.ut[0]);
      }, error: (err) => {
         if (err.error.code === 100) {
          this.sinRegistros = true;
          this.dataSource.data = [];
          this.datosRegistros = false;
        } else {

          if(err.error.code === 160) {
            this.service.cerrarSesionByToken();
          }

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
      hora: this.horaSeleccionada,
      anio: Number(this.anioSeleccionado)
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
        this.validaHora();

        if(this.existDataSame) {
          Swal.fire( "Se encuentra registros con la misma hora, por favor verifique", "", "warning");
        } else {
          this.service.guardaRegistros(preue, this.tokenSesion).subscribe({
            next: (data) => {  
                  Swal.fire({
                    title: "Creación de la programación con éxito",
                    icon: "success"
                  });

                  this.service.getRegistros(parseInt(this.idDistrital), this.tokenSesion).subscribe({
                    next: (data) => {
                      this.dataSource.data = data.registrosCalendario ?? [];
                      this.datosRegistros = this.dataSource.data.some(d => this.registrosC === d.ut[0]);
                      this.fechaSeleccionada = null;
                      this.horaSeleccionada = '';
                      this.anioSeleccionado = '';
                    },
                    error: (err) => {
                      if (err.error.code === 100) {
                        this.dataSource.data = [];
                        this.datosRegistros = false;
                      } else {

                        if(err.error.code === 160) {
                          this.service.cerrarSesionByToken();
                        }

                      }
                    }
                  });
                }, error: (err) => {
                Swal.fire({
                  title: "Error al crear la programación",
                  icon: "warning"
                });

                if(err.error.code === 160) {
                  this.service.cerrarSesionByToken();
                }
              }
          });
        }
      } else {
        Swal.fire({
          title: "No se creo la programación",
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
    const formattedHours = hours.toString().padStart(2, '0');
    const hrs = "Hrs";

    return `${formattedHours}:${minutes} ${hrs}`;
  }
  
  extraerHoraUTCToGetData(iso: string): string {
    const date = new Date(iso);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const formattedHours = hours.toString().padStart(2, '0');
    const hrs = "Hrs";

    return `${formattedHours}:${minutes}`;
  }

  extractFecha(fecha: Date) {
    const date = new Date(fecha);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  async generaDocumento() {

    this.loading = true;
    const primerRegistro = this.dataSource.data[0];

    const datos = {
      distrito: primerRegistro?.distrito ?? '',
      domicilio: primerRegistro?.domicilio ?? '',
      sod: primerRegistro?.sod ?? '',
      tod: primerRegistro?.tod ?? '',
      productos: this.dataSource.data.map((item, index) => ({
        id: index + 1,
        dt: item.dt[1],
        clave: item.ut[0],
        ut: item.ut[1],
        fecha: this.extractFecha(item.fecha),
        hora: this.extraerHoraUTC(item.hora),
        anio: item.anio
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
              title: "Eliminación de la programación con éxito",
              icon: "success"
            });

             this.service.getRegistros(parseInt(this.idDistrital), this.tokenSesion).subscribe({
                next: (data) => {
                  this.sinRegistros = false;
                  this.dataSource.data = data.registrosCalendario ?? [];
                  this.datosRegistros = this.dataSource.data.some(d => this.registrosC === d.ut[0]);
                },
                error: (err) => {

                  if (err.error.code === 100) {
                    this.sinRegistros = true;
                    this.dataSource.data = [];
                    this.datosRegistros = false;
                  } else {

                    if(err.error.code === 160) {
                      this.service.cerrarSesionByToken();
                    }

                  }
                }
              });
              
          }, error: (err) => {
             Swal.fire({
              title: "Error al eliminar la programación",
              icon: "warning"
            });
          }
        });
      }
    });
  }
  
  onDistritoChange(idDistrito: any) {
    this.actualiza = false;
    this.territorioSelected = true;
    let idD = idDistrito.clave_ut;
    this.registrosC = idD;
    this.dt = idDistrito.idDt;
    this.dataReport = [];
    this.selectedDistrito = true;
    this.fechaSeleccionada = null;
    this.horaSeleccionada = '';
    // this.datosRegistros = this.dataSource.data.some(d => idD === d.ut[0]);
    this.sinRegistros = false;
  }

  actualizaData() {

    const data = { 
      distrito: this.distritoChange,
      hora: this.horaSeleccionada,
      ut: this.utChange,
      fecha: this.fechaSeleccionada,
      anio: this.anioSeleccionado
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

        this.validaHora();

        if(this.existDataSame) {
          Swal.fire( "Se encuentra registros con la misma hora, por favor verifique", "", "warning");
        } else {
          this.service.actualizaRegistros(data, this.tokenSesion).subscribe({
            next: (data) => {  
                Swal.fire({
                  title: "Actualización de la programación con éxito",
                  icon: "success"
                });

                this.service.getRegistros(parseInt(this.idDistrital), this.tokenSesion).subscribe({
                  next: (data) => {
                    this.dataSource.data = data.registrosCalendario ?? [];
                    this.datosRegistros = this.dataSource.data.some(d => this.registrosC === d.ut[0]);
                    this.fechaSeleccionada = null;
                    this.horaSeleccionada = '';
                    this.anioSeleccionado = '';
                  },
                  error: (err) => {

                    if(err.error.code === 160) {
                      this.service.cerrarSesionByToken();
                    }

                    if (err.error.code === 100) {
                      this.dataSource.data = [];
                      this.datosRegistros = false;
                    }

                  }
                });
              }, error: (err) => {
              Swal.fire({
                title: "Error al actualizar la programación con éxito",
                icon: "warning"
              });
            }
          });
        }
      } else {
        Swal.fire({
          title: "Error al actualizar la programación",
          icon: "warning"
        });
      }
    });
  }

  editarElemento(element: any) {
    const fecha = new Date(element.fecha);
    const fechaCorrecta = new Date(
      fecha.getUTCFullYear(),
      fecha.getUTCMonth(),
      fecha.getUTCDate()
    );
    const anio = element.anio;
    const hora = new Date(element.hora);
    this.fechaSeleccionada = fechaCorrecta;
    this.anioSeleccionado = anio;
    this.horaSeleccionada = hora.toISOString().substring(11, 16);
    this.distritoChange = element.distrito;
    this.utChange = element.ut[0];
    this.actualiza = true;
    this.territorioSelected = true;
    this.datosRegistros = false;
    this.selectedUnidad = this.unidades.find(ut => ut.clave_ut === element.ut[0]);
  }

  displayedColumns: string[] = ['cs', 'ut', 'nut', 'fecha', 'anio', 'hora', 'accion'];
}
