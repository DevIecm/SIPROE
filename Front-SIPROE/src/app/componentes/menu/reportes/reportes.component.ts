import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FooterComponent } from '../../footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthService } from '../../../services/auth.service';
import { ReasignacionService } from '../../../services/reasignacionService/reasignacion.service';
import { ResultadosService } from '../../../services/resultadosService/resultados.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reportes',
  imports: [
    MatCardModule, 
    MatDatepickerModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    FormsModule,
    MatButtonModule, 
    MatProgressBarModule, 
    MatChipsModule, 
    FooterComponent,
    MatTimepickerModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatGridListModule
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent {

  loading = false;
  proyectos: any[] = [];

  constructor(private http: HttpClient, private resultadosService: ResultadosService, private service: AuthService, private serviceReAsignacion: ReasignacionService) {}

  onSelectedParticipantes(){
   
  }

  onSelectedCancelados(){
   
  }

  onSelectedAsignacion(){

  }

  extractFecha(fecha: Date) {
    const date = new Date(fecha);

    const dia = date.getDate();
    const mes = date.toLocaleString('es-ES', { month: 'long' });
    const año = date.getFullYear();

    return `${dia} de ${mes} de ${año}`;
  }

  async GeneraConstanciaExcelDesdeTemplate() {

    const fechaHoraActual = new Date();

    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };

    const fecha = fechaHoraActual.toLocaleDateString('es-ES', opcionesFecha);
    const hora = fechaHoraActual.toLocaleTimeString('es-ES', opcionesHora);
    
    this.loading = true;
    const primerRegistro = this.proyectos[0];

    const datos = {
      nombre_ut: primerRegistro?.nombre_ut ?? '',
      clave: primerRegistro?.clave ?? '',
      nombre_demarcacion: primerRegistro?.nombre_demarcacion ?? '',
      fecha: this.extractFecha(primerRegistro?.fecha) ?? '',
      distrito: primerRegistro?.distrito ?? '',
      domicilio: primerRegistro?.domicilio ?? '',
      sod: primerRegistro?.sod ?? '',
      tod: primerRegistro?.tod ?? '',
      fecha_sentencia: this.extractFecha(primerRegistro?.fecha_sentencia) ?? '',
      numero_expediente: primerRegistro?.numero_expediente ?? '',
      proyectos: this.proyectos.map((item) => ({
        identificador: item.numero_aleatorio,
        folio: item.folio,
        nombre_proyecto: item.nombre,
      }))
    };

    // Obtener el archivo template
    const templateArrayBuffer = await this.http
      .get('assets/Concentrado_Proyectos.xlsx', { responseType: 'arraybuffer' })
      .toPromise();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateArrayBuffer!);

    const sheet = workbook.getWorksheet(1); // O por nombre: workbook.getWorksheet('Hoja1')

    // Escribir datos en celdas específicas (según tu template)
    sheet!.getCell('B2').value = datos.nombre_ut;
    sheet!.getCell('B3').value = datos.clave;
    sheet!.getCell('B4').value = datos.nombre_demarcacion;
    sheet!.getCell('B5').value = datos.fecha;
    sheet!.getCell('B6').value = datos.distrito;
    sheet!.getCell('B7').value = datos.domicilio;
    sheet!.getCell('B8').value = datos.sod;
    sheet!.getCell('B9').value = datos.tod;
    sheet!.getCell('B10').value = datos.fecha_sentencia;
    sheet!.getCell('B11').value = datos.numero_expediente;

    // Supongamos que los proyectos empiezan a partir de la fila 14
    let rowIndex = 14;
    datos.proyectos.forEach((proyecto) => {
      const row = sheet!.getRow(rowIndex++);
      row.getCell(1).value = proyecto.identificador;
      row.getCell(2).value = proyecto.folio;
      row.getCell(3).value = proyecto.nombre_proyecto;
      row.commit(); // Necesario para algunas versiones de ExcelJS
    });

    // Generar el archivo final
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, 'Reporte Proyectos Participantes por Asignación Directa.xlsx');
    this.loading = false;
  }

}
