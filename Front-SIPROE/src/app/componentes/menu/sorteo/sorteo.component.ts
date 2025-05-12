import { AfterViewInit, ChangeDetectionStrategy, ViewChild, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FooterComponent } from '../../footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
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
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-sorteo',
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
    MatProgressSpinnerModule,
    CommonModule,
    MatGridListModule
  ],
  templateUrl: './sorteo.component.html',
  styleUrl: './sorteo.component.css'
})
export class SorteoComponent {
  selectedValues: string = '';
  mostrarDiv: boolean = false;

  selectedValue(option: string) {

    this.mostrarDiv = true;
    console.log("option", option)
    return this.selectedValues === option;
  }

  displayedColumns: string[] = ['position', 'numero'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
}

export interface PeriodicElement {
  position: string;
  numero: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 'IECM-DD01-000230/2025', numero: 1},
  {position: 'IECM-DD01-000231/2025', numero: 1},
  {position: 'IECM-DD01-000232/2025', numero: 1},
  {position: 'IECM-DD01-000233/2025', numero: 1},
  {position: 'IECM-DD01-000234/2025', numero: 1},
  {position: 'IECM-DD01-000235/2025', numero: 1}
];