import { MonitorService } from '../../../services/monitorService/monitor-service.service';
import { AuthService } from '../../../services/auth.service';
import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-monitor',
  imports: [MatPaginatorModule, MatTableModule],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent {
  displayedColumns: string[] = ['direccion', 'ut', 'sorteos', 'avance'];
  tokenSesion = sessionStorage.getItem('key') || '0';
  dataSource: any[] = [];

  constructor(private serviceMonitor: MonitorService, private servicea: AuthService) {}

  ngOnInit(): void{
    console.log(this.tokenSesion)
    this.serviceMonitor.getMonitorData(this.tokenSesion).subscribe({
          next: (data) => {
            this.dataSource = data.registrosMonitor;
            console.log(data)
          }, error: (err) => {
            console.error(err)
          }
        });
  }

}
