import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AuthGuard } from './guards/auth.guard';
import { MonitorComponent } from './componentes/menu/monitor/monitor.component';

export const routes: Routes = [
    {
      path: '',
      loadComponent: () => import('./componentes/auth/auth.component').then(m => m.AuthComponent)
    },
    {  //se usan childs para poder hacer la carga de los componentes dentro de dashboard
      path: 'dashboard',
      loadComponent: () => import('./componentes/dashboard/dashboard.component').then(m => m.DashboardComponent),
      canActivate: [AuthGuard],
      children: [
        { path: '', loadComponent: () => import('./componentes/menu/inicio/inicio.component').then(m => m.InicioComponent), canActivate: [AuthGuard] },
        { title: 'SIPROE Aleatorio | Calendario', path: 'calendario', loadComponent: () => import('./componentes/menu/invitacion/invitacion.component').then(m => m.InvitacionComponent), canActivate: [AuthGuard] },
        { title: 'SIPROE Aleatorio | Sorteo', path: 'sorteo', loadComponent: () => import('./componentes/menu/sorteo/sorteo.component').then(m => m.SorteoComponent), canActivate: [AuthGuard] },
        { title: 'SIPROE Aleatorio | Asignación', path: 'asignacion', loadComponent: () => import('./componentes/menu/asignacion/asignacion.component').then(m => m.AsignacionComponent),canActivate: [AuthGuard] },
        { title: 'SIPROE Aleatorio | Reasignación', path: 'reasignacion', loadComponent: () => import('./componentes/menu/reasignacion/reasignacion.component').then(m => m.ReasignacionComponent),canActivate: [AuthGuard] },
        { title: 'SIPROE Aleatorio | Resultados', path: 'resultados', loadComponent: () => import('./componentes/menu/resultados/resultados.component').then(m => m.ResultadosComponent),canActivate: [AuthGuard] },
        { title: 'SIPROE Aleatorio | Reportes', path: 'reportes', loadComponent: () => import('./componentes/menu/reportes/reportes.component').then(m => m.ReportesComponent),canActivate: [AuthGuard] },
        { title: 'SIPROE Aleatorio | Monitor', path: 'monitor', loadComponent: () => import('./componentes/menu/monitor/monitor.component').then(m => MonitorComponent), canActivate: [AuthGuard]}
      ]
    }
];
  
@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        RouterModule.forRoot(routes, { useHash: true})], 
    exports: [RouterModule]
})

export class AppRoutingModule {}
