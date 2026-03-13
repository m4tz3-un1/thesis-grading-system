import { Component } from '@angular/core';
import { DynamicFormComponent } from '../../components/dynamic-form/dynamic-form.component';
import { AuthService } from '../../services/auth-service.service';
import { ApiService } from '../../services/api-service.service';
import { CommonModule } from '@angular/common';

/**
 * The component that handles the editing of user details.
 */
@Component({
  selector: 'app-edit-account',
  standalone: true,
  imports: [DynamicFormComponent, CommonModule],
  templateUrl: './edit-account.component.html'
})
export class EditAccountComponent {
  formJsonConfig!: JSON;

  /**
   * The constructor of the component. Here are also given all needed services to inject as parameters.
   * 
   * @param authService Service that handles the user.
   * @param api Service for communication with the backend.
   */
  constructor(private authService: AuthService, 
    private api: ApiService
  ) {}

  /**
   * Function that is called when the component is created. It receives the edit form data from the backend to use in the component.
   */
  ngOnInit() {
    this.api.getUserFormForEdit(this.authService.getUsername()).subscribe(
      (formconfigJson) => {
        this.formJsonConfig = formconfigJson; 
      }
    )
  }

}
