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

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [MatGridListModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatCardModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  username = "";
  password = "";

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    sessionStorage.removeItem('key');
  }

  onSubmit() {
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        sessionStorage.setItem("key", res.token);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        console.log(err.error.message +"fallido")
      }
    });
  }
}
