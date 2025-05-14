import { AfterViewInit, ChangeDetectionStrategy, ViewChild, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FooterComponent } from '../../footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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

  dataReport: any[] = [];

  constructor(private http: HttpClient, private service: AuthService) {}

  ngOnInit(): void{

    this.service.catUnidad(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.unidades = data.catUnidad;
      }, error: (err) => {
        console.error("Error al cargar unidades", err);
      }
    });

  }

  guardaData() {

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

                this.service.getRegistros(this.registrosC, this.tokenSesion).subscribe({
                  next: (data) => {
                    this.datosRegistros = true;
                    this.fechaSeleccionada = null;
                    this.horaSeleccionada = '';
                    this.registros = data.registrosCalendario ?? [];
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

  async generaPdf() {
    try {
      this.loading = true;

      const existingPdfBytes = await this.http
        .get('assets/Anexo-Invitacion.pdf', { responseType: 'arraybuffer' })
        .toPromise();

      if (!existingPdfBytes) {
        throw new Error("No se pudo cargar el PDF");
      }

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPages()[0];
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let startYY = 500;
      const startXX = 93;
      const demarcacionXX = 118;
      const claveXX = 225;
      const unidadXX = 300;
      const fechaXX = 442;
      const horaXX = 500;

      startYY -= 20;

      this.dataReport.forEach((d, index) => {
        const y = startYY - index * 20;

        const fechaObj = new Date(d.fecha);
        const fechaStr = `${String(fechaObj.getDate()).padStart(2, '0')}/` +
                        `${String(fechaObj.getMonth() + 1).padStart(2, '0')}/` +
                        `${fechaObj.getFullYear()}`;

        const horaObj = new Date(d.hora);
        const horaStr = `${String(horaObj.getHours()).padStart(2, '0')}:` +
                        `${String(horaObj.getMinutes()).padStart(2, '0')}`;

        page.drawText(`${d.id}`, { x: startXX, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${d.dt}`, { x: demarcacionXX, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${d.clave}`, { x: claveXX, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`${d.ut}`, { x: unidadXX, y, size: 8, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(fechaStr, { x: fechaXX, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(horaStr, { x: horaXX, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'Anexo Calendario.pdf';
      a.click();
    } catch (error) {
      console.error("Error al generar el pdf", error);
    } finally {
      this.loading = false;
    }
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
        this.service.delRegistros(element.ut, this.tokenSesion).subscribe({
          next: (data) => {
            Swal.fire({
              title: "Eliminación de la programacíon con éxito",
              icon: "success"
            });

             this.service.getRegistros(this.registrosC, this.tokenSesion).subscribe({
                next: (data) => {
                  this.datosRegistros = true;
                  this.fechaSeleccionada = null;
                  this.horaSeleccionada = '';
                  this.registros = data.registrosCalendario ?? [];
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

    this.service.getRegistros(idD, this.tokenSesion).subscribe({
      next: (data) => {
        this.datosRegistros = true;
        this.fechaSeleccionada = null;
        this.horaSeleccionada = '';
        this.registros = data.registrosCalendario ?? [];

        let fechaFoermat = data.registrosCalendario[0].fecha;

        this.dataReport.push({
          id: 1,
          dt: idDistrito.dt,
          clave: idDistrito.clave_ut,
          ut: idDistrito.ut,
          fecha: data.registrosCalendario[0].fecha,
          hora: data.registrosCalendario[0].hora.trim(),
        });

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
  }
  
  editarElemento(element: any): void {
    this.fechaSeleccionada = element.fecha;
    this.horaSeleccionada = element.hora.substring(0, 5); // "HH:mm"
    this.modoEdicion = true;
    this.registroEnEdicion = element;

  }

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
}
