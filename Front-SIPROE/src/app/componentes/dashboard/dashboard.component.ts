import { Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatNavList } from '@angular/material/list';
import { MatSidenavContent } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatSidenav, CommonModule, RouterModule, MatToolbarModule, MatIcon, MatSidenavContainer, MatNavList, MatSidenavContent ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  idDistrital = sessionStorage.getItem('dir');
  tipoUsuario = sessionStorage.getItem('tipoUsuario');
  nameUsuario = sessionStorage.getItem('nameUsuario');
  mostrarMenu!: boolean; 
  
  ngOnInit(): void{
    if(this.tipoUsuario === "2"){
      this.mostrarMenu = true;
    } else {
      this.mostrarMenu = false
    }
  }

  constructor( private router: Router ) {}

  cerrarSesion() {
    this.router.navigate(['']);
  }
}
