import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    email: string = '';
    firstName: string = '';
    lastName: string = '';
    password: string = '';
    role: string = 'author';
    passwordVisible: boolean = false;
  
    constructor(private router: Router, private authService: AuthService, private snackBar: MatSnackBar) {}
  
    register() {
      const user = { email: this.email, firstName: this.firstName, lastName: this.lastName, password: this.password, role: this.role};
  
      this.authService.register(user).subscribe(
        (response) => {
          console.log(response);
          this.router.navigate(['/verify-email/', this.email]);
        },
        (error) => {
          console.error(error);
          this.snackBar.open('Registration failed!', 'Close', { duration: 3000, verticalPosition: 'top'});
        }
      );
    }

    togglePasswordVisibility(): void {
      this.passwordVisible = !this.passwordVisible;
    }
}
