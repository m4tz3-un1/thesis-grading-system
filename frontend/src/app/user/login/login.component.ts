import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service.service';
import { first } from 'rxjs';

/**
 * Component that handles the login of users.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule, ReactiveFormsModule, CommonModule],  
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  /**
   * The constructor of the component. Here are also given all needed services to inject as parameters.
   * 
   * @param formBuilder Service to create forms.
   * @param router Possibility to navigate between pages.
   * @param authService Service for the user authentication.
   */
  constructor(
    private formBuilder: FormBuilder, 
    public router: Router, 
    private authService: AuthService
  ) {}

  // Generation of the login form
  loginInput = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  /**
   * Function to switch the visibility of the apssword field between visible and censored.
   */
  changeVisibilityOfPassword() {
    let passwordField = document.getElementById("password") as HTMLInputElement;
    passwordField?.type === "password" ? passwordField.type = "text" : passwordField.type = "password";
  }

  /**
   * Function that is called with the login button and handles the login process.
   */
  Login() {
    if (this.loginInput.valid) {
      this.authService.login(this.loginInput.controls['username'].value!, this.loginInput.controls['password'].value!)
        .pipe(first())
        .subscribe({
          next: () => {
            this.router.navigate(['./generalDataInput']);
          },
          error: () => {
            alert('Username or password incorrect.');
          }
        })
    }
  }
}
