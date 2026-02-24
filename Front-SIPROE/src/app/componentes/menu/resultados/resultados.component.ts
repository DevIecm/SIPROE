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
import Swal from 'sweetalert2';
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
  unidadesAsignados:  any[] = [];
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
  proyectosFull: any[] = [];
  clave_ut: string = '';
  mostarLista!: boolean;
  activeButton!: boolean;
  loading = false;
  idTipo!: number;
  documentos: string = '';
  anioSeleccionado!: number;

  constructor(private http: HttpClient, private resultadosService: ResultadosService, private service: AuthService, private serviceReAsignacion: ReasignacionService) {}

  ngOnInit() {
    this.onBuild = false;
    this.selectedProyectos = false;
    this.selectedConstancias = false;
    this.mostrarForm = false;
  }
  
  onDistritoChange(element: any) {
    this.selectedTipo = null;
    this.clave_ut = element.clave_ut;

    this.serviceReAsignacion.catRipoSorteo(this.clave_ut, this.tokenSesion).subscribe({
      next: (data) => {
        this.tipos = data.catTipoSorteo;

        if(data.code === 200) {
          this.seleccionoUnidad = true;
        }

      }, error: (err) => {
      
        this.seleccionoUnidad = false;

        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }
        
      }
    }); 

    this.resultadosService.getDataProyectosFull(this.clave_ut, this.tokenSesion).subscribe({
      next: (data) => {
        this.proyectosFull = data.registrosProyectos;
      }, error: (err) => {

        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }
        
      }
    }); 
    
  }

  onTipoChange() {
   console.log('Tipo seleccionado:', this.selectedTipo);
  }

  onAnioChange() {
    console.log('Año seleccionado:', this.anioSeleccionado);

     this.resultadosService.getDataProyectos(this.clave_ut, parseInt(this.idDistrital), this.selectedTipo!, this.anioSeleccionado, this.tokenSesion).subscribe({
      next: (data) => {
        this.proyectos = data.registrosProyectos;
        this.activeButton = true;
      }, error: (err) => {
        
        Swal.fire(err.error.message, '', 'error');

        this.activeButton = false;

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
    this.service.catUnidad(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.unidades = data.catUnidad;
        this.selectedTipo = null;
      }, error: (err) => {

        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }

      }
    });
    this.onBuild = false;
    this.selectedProyectos = true;
    this.selectedConstancias = false;
    this.ocultaBotones = true;
    this.mostarLista = true;
  }

  onSelectedConstancias(){
    this.service.catUnidadFilter(parseInt(this.idDistrital), this.tokenSesion).subscribe({
      next: (data) => {
        this.unidadesAsignados = data.catUnidad;
        this.selectedTipo = null;
      }, error: (err) => {

        if(err.error.code === 160) {
          this.service.cerrarSesionByToken();
        }

      }
    });
    this.onBuild = false;
    this.selectedProyectos = false;
    this.selectedConstancias = true;
    this.ocultaBotones = true;
    this.mostrarForm = true;
  }

  extraerHoraUTC(iso: string): string {
    const date = new Date(iso);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const formattedHours = hours.toString().padStart(2, '0');
    const hrs = "Hrs";

    return `${formattedHours}:${minutes} ${hrs}`;
  }

  extractFecha(fecha: Date) {
    const date = new Date(fecha);

    const dia = date.getDate();
    const mes = date.toLocaleString('es-ES', { month: 'long' });
    const año = date.getFullYear();

    return `${dia} de ${mes} de ${año}`;
  }

  async GeneraConstancia(){
    
    this.loading = true;
    const motivo = this.proyectos[0].id_motivo || null;
    const primerRegistro = this.proyectos[0];

    console.log('Primer registro:', primerRegistro);

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
      anio: primerRegistro?.anio ?? '',
      proyectos: this.proyectos.map((item, index) => ({
        identificador: item.numero_aleatorio ?? '',
        folio: item.folio ?? '',
        nombre_proyecto: item.nombre ?? '',
      }))
    };

    if(this.selectedTipo === 1) { 
      console.log('Año seleccionado:', this.anioSeleccionado);
      if(this.anioSeleccionado === 2026) {
        this.documentos = 'assets/ConstanciaAsignacionSorteo2026.docx';
      } else if(this.anioSeleccionado === 2027) { 
        this.documentos = 'assets/ConstanciaAsignacionSorteo2027.docx';
      }
    } else { 
      if(motivo === 1){
        this.documentos = 'assets/ConstanciaAsignacion1.docx';
      }else{
        this.documentos = 'assets/ConstanciaAsignacion2.docx';
      }
    }
      
    const templateBob = await this.http
      .get(this.documentos, { responseType: 'arraybuffer' })
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
      saveAs(output, 'Constancia.docx');

      this.loading = false;
  }

  async GeneraLista() {
  
    this.loading = true;


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
    const primerRegistro = this.proyectosFull[0];

    const datos = {
      fecha: fecha ?? 'Sin registro',
      hora: hora ?? 'Sin registro',
      clave: primerRegistro?.clave ?? '',
      nombre_ut: primerRegistro?.nombre_ut ?? '',
      proyectos: this.proyectosFull.map((item, index) => ({
        identificador: item.identificador ?? '',
        nombre: item.nombre ?? '',
        folio: item.folio ?? '',
        descripcion: item.descripcion ?? ''
      }))
    };

    const templateBob = await this.http
      .get('assets/ProyctosList.docx', { responseType: 'arraybuffer' })
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
      saveAs(output, 'Lista de Proyectos.docx');

      this.loading = false;
  }
}
