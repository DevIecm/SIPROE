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
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ReportesService } from '../../../services/reportesService/reportes.service';
import { AuthService } from '../../../services/auth.service';

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
  participantes: any[] = [];
  cancelados: any[] = [];
  asignacion: any[] = [];
  idDistrital = sessionStorage.getItem('dir') || '0';
  tokenSesion = sessionStorage.getItem('key') || '0';
  tipoUsuario = sessionStorage.getItem('tipoUsuario') || '0';
  bloqueaBotonParticipantes: boolean = false;
  bloqueaBotonCancelados: boolean = false;
  bloqueaBotonAsignacion: boolean = false;
  documentos: string = '';

  constructor(private http: HttpClient, private service: AuthService, private reportesSerice: ReportesService) {}

  ngOnInit() {
    this.reportesSerice.proyectosParticipantes(parseInt(this.tipoUsuario), parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.participantes = data.registrosProyectosParticipantes;
        this.bloqueaBotonParticipantes = false;
      }, error: (err) => {

        if(err.error.code === 100){
          this.bloqueaBotonParticipantes = true;
        }
        
        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }

      }
    });

    this.reportesSerice.proyectosCancelados(parseInt(this.tipoUsuario), parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.cancelados = data.registrosProyectosCancelados;
        this.bloqueaBotonCancelados = false;
      }, error: (err) => {

        if(err.error.code === 100){
          this.bloqueaBotonCancelados = true;
        }

        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }

      }
    });

    this.reportesSerice.proyectosAsignacion(parseInt(this.tipoUsuario), parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.asignacion = data.registrosProyectosAsignacion;
        this.bloqueaBotonAsignacion = false;
      }, error: (err) => {

        if(err.error.code === 100){
          this.bloqueaBotonAsignacion = true;
        }

        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }

      }
    });
  }

  extractFecha(fecha: Date) {
    const date = new Date(fecha);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
  
  async GeneraConstanciasProyectosParticipantes(){

    const fechaHoraActual = new Date();

    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };

    const fecha = "Fecha: "+ this.extractFecha(fechaHoraActual);
    const hora = "Hora: "+ fechaHoraActual.toLocaleTimeString('es-ES', opcionesHora);
    this.loading = true;

    const datos = {
      participantes: this.participantes.map((item) => ({
        demarcacion: item.demarcacion,
        unidad_territorial: item.unidad_territorial,
        clave: item.clave,
        identificador: item.identificador,
        folio: item.folio,
        nombre: item.nombre
      }))
    };

    if(parseInt(this.tipoUsuario) === 2){
      this.documentos = 'assets/Concentrado_Proyectos_Central.xlsx';
    } else {
      this.documentos ='assets/Concentrado_Proyectos.xlsx';
    }

    const templateArrayBuffer = await this.http
      .get(this.documentos, { responseType: 'arraybuffer' })
      .toPromise();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateArrayBuffer!);

    const sheet = workbook.getWorksheet(1);


    if(parseInt(this.tipoUsuario) === 2){
      sheet!.getCell('F10').value = hora;
      sheet!.getCell('F9').value = fecha;
    } else {
      sheet!.getCell('B9').value = this.idDistrital;
      sheet!.getCell('F10').value = hora;
      sheet!.getCell('F9').value = fecha;
    }
    
    let rowIndex = 12;
    datos.participantes.forEach((participantes) => {
      const row = sheet!.getRow(rowIndex++);
      row.getCell(1).value = participantes.demarcacion ?? '';
      row.getCell(2).value = participantes.unidad_territorial ?? '';
      row.getCell(3).value = participantes.clave ?? '';
      row.getCell(4).value = participantes.identificador ?? '';
      row.getCell(5).value = participantes.folio ?? '';
      row.getCell(6).value = participantes.nombre ?? '';
      row.commit();
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, 'Reporte Proyectos Participantes.xlsx');
    this.loading = false;
  }

  async GeneraConstanciasSorteosCancelados(){
    
    const fechaHoraActual = new Date();

    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };

    const fecha = fechaHoraActual;
    const hora = fechaHoraActual.toLocaleTimeString('es-ES', opcionesHora);
    
    this.loading = true;

    const datos = {
      cancelados: this.cancelados.map((item) => ({
        demarcacion: item.demarcacion,
        unidad_territorial: item.unidad_territorial,
        clave: item.clave,
        nombre: item.nombre,
        fecha_eliminacion: this.extractFecha(item.fecha_eliminacion),
        motivo_del: item.motivo_del,
        numero_expediente_del: item.numero_expediente_del,
        descripcion: item.descripcion
      }))
    };

    const templateArrayBuffer = await this.http
        .get('assets/Sorteos_Cancelados.xlsx', { responseType: 'arraybuffer' })
        .toPromise();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateArrayBuffer!);

    const sheet = workbook.getWorksheet(1);

    sheet!.getCell('B9').value = this.idDistrital;
    sheet!.getCell('G10').value = hora;
    sheet!.getCell('G9').value = fecha;

    let rowIndex = 12;
    datos.cancelados.forEach((cancelados) => {
      const row = sheet!.getRow(rowIndex++);
      row.getCell(1).value = cancelados.demarcacion ?? '';
      row.getCell(2).value = cancelados.clave ?? '';
      row.getCell(3).value = cancelados.unidad_territorial ?? '';
      row.getCell(4).value = cancelados.fecha_eliminacion ?? '';
      row.getCell(5).value = cancelados.motivo_del ?? '';
      row.getCell(6).value = cancelados.descripcion ?? '';
      row.getCell(7).value = cancelados.numero_expediente_del ?? '';
      row.commit();
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, 'Reporte Sorteos Cancelados.xlsx');
    this.loading = false;
  }

  async GeneraConstanciaAsignacionDirecta() {

    const fechaHoraActual = new Date();

    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };

    const fecha = fechaHoraActual;
    const hora = fechaHoraActual.toLocaleTimeString('es-ES', opcionesHora);
    
    this.loading = true;

    const datos = {
      asignacion: this.asignacion.map((item) => ({
        distrito: item.distrito ,
        demarcacion: item.demarcacion,
        unidad_territorial: item.unidad_territorial,
        clave: item.clave,
        folio: item.folio,
        identificador: item.identificador,
        nombre: item.nombre,
        fecha_asignacion: item.fecha_asignacion,
        fecha: item.fecha,
        resolucion: item.descripcion,
        motivo: item.motivo,
        numero_expediente: item.numero_expediente,
      }))
    };

    if(parseInt(this.tipoUsuario) === 2){
      this.documentos = 'assets/Asignacion_Directa_Central.xlsx';
    } else {
      this.documentos ='assets/Asignacion_Directa.xlsx';
    }

    const templateArrayBuffer = await this.http
      .get(this.documentos, { responseType: 'arraybuffer' })
      .toPromise();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateArrayBuffer!);

    const sheet = workbook.getWorksheet(1);

    if(parseInt(this.tipoUsuario) === 2){
      sheet!.getCell('L10').value = hora;
      sheet!.getCell('L9').value = fecha;
    } else {
      sheet!.getCell('B9').value = this.idDistrital;
      sheet!.getCell('L10').value = hora;
      sheet!.getCell('L9').value = fecha;
    }

    let rowIndex = 12;
    datos.asignacion.forEach((asignacion) => {
      const row = sheet!.getRow(rowIndex++);
      row.getCell(1).value = asignacion.distrito ?? '';
      row.getCell(2).value = asignacion.demarcacion ?? '';
      row.getCell(3).value = asignacion.unidad_territorial ?? '';
      row.getCell(4).value = asignacion.clave ?? '';
      row.getCell(5).value = asignacion.folio ?? '';
      row.getCell(6).value = asignacion.identificador ?? '';
      row.getCell(7).value = asignacion.nombre ?? '';
      row.getCell(8).value = this.extractFecha(asignacion.fecha) ?? '';
      row.getCell(9).value = asignacion.resolucion ?? '';
      row.getCell(10).value = asignacion.motivo ?? '';
      row.getCell(11).value = asignacion.numero_expediente ?? '';
      row.getCell(12).value = this.extractFecha(asignacion.fecha_asignacion) ?? '';
      row.commit();
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, 'Reporte Proyectos Participantes por Asignación Directa.xlsx');
    this.loading = false;
  }

}
