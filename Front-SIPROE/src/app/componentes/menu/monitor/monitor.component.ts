import { MonitorService } from '../../../services/monitorService/monitor-service.service';
import { AuthService } from '../../../services/auth.service';
import { Component } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-monitor',
  imports: [
    MatPaginatorModule, 
    MatTableModule, 
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent {
  
  displayedColumns: string[] = ['direccion', 'ut', 'sorteos', 'avance'];
  tokenSesion = sessionStorage.getItem('key') || '0';
  dataSource: any[] = [];
  loading = false;

  subscription!: Subscription;

  constructor(
    private serviceMonitor: MonitorService, 
    private servicea: AuthService
  ) {}

  ngOnInit(): void{
    this.getMonitor();

    this.subscription = interval(50000).subscribe(() => {
      this.getMonitor();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getMonitor() {
    this.loading = true;

    this.serviceMonitor.getMonitorData(this.tokenSesion).subscribe({
      next: (data) => {
        this.dataSource = data.registrosMonitor;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.code === 160) {
          this.servicea.cerrarSesionByToken();
        }
      }
    });
  }
}
