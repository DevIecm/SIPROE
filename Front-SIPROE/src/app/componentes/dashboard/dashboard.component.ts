import { Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatNavList } from '@angular/material/list';
import { MatSidenavContent } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatSidenav, RouterModule, MatToolbarModule, MatIcon, MatSidenavContainer, MatNavList, MatSidenavContent ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  idDistrital = sessionStorage.getItem('dir');

  constructor( private router: Router ) {}

  cerrarSesion() {
    this.router.navigate(['']);
  }
}
