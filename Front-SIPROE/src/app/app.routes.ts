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
        { path: 'calendario', loadComponent: () => import('./componentes/menu/invitacion/invitacion.component').then(m => m.InvitacionComponent), canActivate: [AuthGuard] },
        { path: 'sorteo', loadComponent: () => import('./componentes/menu/sorteo/sorteo.component').then(m => m.SorteoComponent), canActivate: [AuthGuard] },
        { path: 'asignacion', loadComponent: () => import('./componentes/menu/asignacion/asignacion.component').then(m => m.AsignacionComponent),canActivate: [AuthGuard] },
        { path: 'reasignacion', loadComponent: () => import('./componentes/menu/reasignacion/reasignacion.component').then(m => m.ReasignacionComponent),canActivate: [AuthGuard] },
        { path: 'resultados', loadComponent: () => import('./componentes/menu/resultados/resultados.component').then(m => m.ResultadosComponent),canActivate: [AuthGuard] },
        { path: 'reportes', loadComponent: () => import('./componentes/menu/reportes/reportes.component').then(m => m.ReportesComponent),canActivate: [AuthGuard] },
        { path: 'monitor', loadComponent: () => import('./componentes/menu/monitor/monitor.component').then(m => MonitorComponent), canActivate: [AuthGuard]}
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
