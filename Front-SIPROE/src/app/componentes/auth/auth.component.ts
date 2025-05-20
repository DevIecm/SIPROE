import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatCardModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  username = "";
  password = "";

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    sessionStorage.removeItem('key');
    sessionStorage.removeItem('dir');
    sessionStorage.removeItem('tipoUsuario');
    sessionStorage.removeItem('nameUsuario');
  }

  onSubmit() {

    try {
      
      this.auth.login(this.username, this.password).subscribe({
        next: (res) => {
          sessionStorage.setItem("key", res.token);
          sessionStorage.setItem("dir", res.userData[0].distrital);
          sessionStorage.setItem("tipoUsuario", res.userData[0].tipo_usuario);
          sessionStorage.setItem("nameUsuario", res.userData[0].footer);
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          if(err.error.code === 401){
            Swal.fire({
              icon: "error",
              title: "Usuario inactivo",
              text: "Por favor contacta al Administrador del Sistema",
            });
          } else if(err.error.code === 101) {
            Swal.fire({
              icon: "error",
              title: "Usuario no encontrado",
              text: "Por favor contacta al Administrador del Sistema",
            });
          }
        } 
      });

    } catch (error) {
      console.log("Error al iniciar sesión", error);
    }
  }
}
