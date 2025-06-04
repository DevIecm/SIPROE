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
import saveAs from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
@Component({
  selector: 'app-resultados',
  standalone: true,
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
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.css'
})
export class ResultadosComponent {
  animandoSorteo!: boolean;
  unidades: any[] = [];
  onBuild: boolean = false;
  selectedProyectos: boolean = false;
  selectedConstancias: boolean = false;
  selectedUnidad: number | null = null;
  idDistrital = sessionStorage.getItem('dir') || '0';
  tokenSesion = sessionStorage.getItem('key') || '0';
  selectedTipo: number | null = null;
  ocultaBotones!: boolean;
  mostrarForm!: boolean;
  seleccionoUnidad!: boolean;
  tipos: any[] = [];
  proyectos: any[] = [];
  clave_ut: string = '';
  mostarLista!: boolean;
  loading = false;
  idTipo!: number;

  constructor(private http: HttpClient, private resultadosService: ResultadosService, private service: AuthService, private serviceReAsignacion: ReasignacionService) {}

  ngOnInit() {
    this.onBuild = false;
    this.selectedProyectos = false;
    this.selectedConstancias = false;
    this.mostrarForm = false;

    this.service.catUnidad(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.unidades = data.catUnidad;
        this.selectedTipo = null;
      }, error: (err) => {
        console.error("Error al cargar unidades", err);
        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }
      }
    });
  }

  async getDataProyectos(tipo: number) {
    try{

    this.resultadosService.getDataProyectos(this.clave_ut, parseInt(this.idDistrital), tipo, this.tokenSesion).subscribe({
      next: (data) => {
        console.log(data.registrosProyectos)
        this.proyectos = data.registrosProyectos;
        console.log("Listaaaaa", this.proyectos)
      }, error: (err) => {
        console.error("Error al cargar tipos de sorteo", err);
        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }
      }
    }); 
    } catch (error) {
      console.error(error);
    }
  }
  
  onDistritoChange(element: any) {
    this.clave_ut = element.clave_ut;
    this.seleccionoUnidad = true;

    this.serviceReAsignacion.catRipoSorteo(this.clave_ut, this.tokenSesion).subscribe({
      next: (data) => {
        this.tipos = data.catTipoSorteo;
      }, error: (err) => {
        console.error("Error al cargar tipos de sorteo", err);
        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }
      }
    }); 
  }

  limpiarFormulario(){
    this.onBuild = false;
    this.selectedProyectos = false;
    this.selectedConstancias = false;
    this.ocultaBotones = false;
    this.mostrarForm = false;
    this.selectedUnidad = null
    this.selectedTipo = null;
    this.mostarLista = false;    
    this.seleccionoUnidad = false;
  }

  onSelectedProyectos(){
    this.onBuild = false;
    this.selectedProyectos = true;
    this.selectedConstancias = false;
    this.ocultaBotones = true;
    this.mostarLista = true;
  }

  onSelectedConstancias(){
    this.onBuild = false;
    this.selectedProyectos = false;
    this.selectedConstancias = true;
    this.ocultaBotones = true;
    this.mostrarForm = true;
  }

  async GeneraConstancia(){
    debugger
    
    this.getDataProyectos(this.selectedTipo!)

    console.log(this.proyectos);
    this.loading = true;
    const primerRegistro = this.proyectos[0];

    const datos = {
      nombre_ut: primerRegistro?.nombre_ut ?? '',
      clave: primerRegistro?.clave ?? '',
      nombre_demarcacion: primerRegistro?.nombre_demarcacion ?? '',
      fecha: primerRegistro?.fecha ?? '',
      distrito: primerRegistro?.distrito ?? '',
      domicilio: primerRegistro?.domicilio ?? '',
      proyectos: this.proyectos.map((item, index) => ({
        identificador: index + 1,
        folio: item.dt[1],
        nombre_proyecto: item.ut[0],
        // ut: item.ut[1],
        // fecha: this.extractFecha(item.fecha),
        // hora: this.extraerHoraUTC(item.hora),
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

  async GeneraLista() {
  
      this.loading = true;
      // const primerRegistro = this.dataSource.data[0];
  
      // const datos = {
      //   distrito: primerRegistro?.distrito ?? '',
      //   domicilio: primerRegistro?.domicilio ?? '',
      //   sod: primerRegistro?.sod ?? '',
      //   tod: primerRegistro?.tod ?? '',
      //   productos: this.dataSource.data.map((item, index) => ({
      //     id: index + 1,
      //     dt: item.dt[1],
      //     clave: item.ut[0],
      //     ut: item.ut[1],
      //     fecha: this.extractFecha(item.fecha),
      //     hora: this.extraerHoraUTC(item.hora),
      //   }))
      // };
  
      // const templateBob = await this.http
      //   .get('assets/Anexo-Invitacion.docx', { responseType: 'arraybuffer' })
      //   .toPromise();
  
      //   if (!templateBob) {
      //     throw new Error("No se pudo cargar el Documento");
      //   }
  
      //   const zip = new PizZip(templateBob);
      //   const doc = new Docxtemplater(zip, { 
      //     paragraphLoop: true,
      //     linebreaks: true,
      //     delimiters: { start: '[[', end: ']]' }
      //   });
  
      //   doc.setData(datos);
  
      //   try{
      //     doc.render();
      //   } catch (error) {
      //     console.error('Error al cargar archivo', error);
      //     return;
      //   } 
  
      //   const output = doc.getZip().generate({ type: 'blob' });
      //   saveAs(output, 'Anexo Calendario.docx');
  
      //   this.loading = false;
  }
}
