import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api-service.service';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs';

/**
 * This component manages the registration of new users.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  /**
   * The constructor of the component. Here are also given all needed services to inject as parameters.
   * 
   * @param formBuilder Service to create forms.
   * @param router Service for navigation between pages.
   * @param api Service that handles the communication with the backend.
   */
  constructor(
    private formBuilder: FormBuilder, 
    public router: Router, 
    private api: ApiService
  ) {}

  // Creation of the form for creating new users
  createUserForm = this.formBuilder.group({
    academicTitle: '',
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    website: '',
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern('^(?=.*?[A-ZÄÖÜ])(?=.*?[a-zäöüß])(?=.*?[0-9])(?=.*?[#@\.:,;$+=!?()"\'%&/_-])[A-ZÄÖÜa-zäöüß0-9#@\.:,;$+=!?()"\'%&/_-]{8,}$')]],
    isAdmin: ['', Validators.required]
  });

  /**
   * Function to switch the visibility of the apssword field between visible and censored.
   */
  changeVisibilityOfPassword() {
    let passwordField = document.getElementById("password") as HTMLInputElement;
    passwordField?.type === "password" ? passwordField.type = "text" : passwordField.type = "password";
  }

  /**
   * Function that creates the user with the data received from the form.
   */
  CreateUser() {
    if (this.createUserForm.valid) {
      this.api.postUserRegistration(this.createUserForm.value)
        .pipe(first())
        .subscribe({
          next: () => {
            alert('User created successful!') 
            this.router.navigate(['./adminPanel']);
          },
          error: (err) => {
            alert(err.error.message);
          }
        })
    }
  }
}
