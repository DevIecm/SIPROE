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

  loading = false;
  value!: Date;

  constructor(private http: HttpClient) {}

   datos = [
    { nombre: '1', demarcacion: 'Venustiano Carranza', clave: '17-076', unidad:'Jardin Balbuena', fecha: '03/04/1992', hora: '11:45' },
  ];


  ngOnInit() {
  
  }

  guardaData() {
    this.loading = true;

    setTimeout(() => {
      this.loading = false;

      Swal.fire({
      title: "¿Está seguro de eliminar esta programación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = false;
      }
    });
    }, 2000);
  }

  async generaPdf() {

    try {

      this.loading = true;

      const existingPdfBytes = await this.http
        .get('assets/Anexo-Invitacion.pdf', { responseType: 'arraybuffer'})
        .toPromise();

      if(!existingPdfBytes) {
        throw new Error("No se pudo cargar el pdf");
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

      //Consecutivo
      this.datos.forEach((d, index) => {
        page.drawText(`${d.nombre}`, {
          x: startXX,
          y: startYY - index * 20,
          size: 12,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });

        page.drawText(`${d.demarcacion}`, {
          x: demarcacionXX,
          y: startYY - index * 20,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });

        page.drawText(`${d.clave}`, {
          x: claveXX,
          y: startYY - index * 20,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });

        page.drawText(`${d.unidad}`, {
          x: unidadXX,
          y: startYY - index * 20,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });

        page.drawText(`${d.fecha}`, {
          x: fechaXX,
          y: startYY - index * 20,
          size: 9,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });

        page.drawText(`${d.hora}`, {
          x: horaXX,
          y: startYY - index * 20,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
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
        Swal.fire({
          title: "Eliminación de la programacíon con éxito",
          icon: "success"
        });
      }
    });
    // Aquí pones la lógica para eliminar el elemento
    console.log('Eliminar:', element);
  }
  
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  ngAfterViewInit() {
  }
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: string;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: '03/04/1992', weight: '11:45', symbol: 'H'},

];