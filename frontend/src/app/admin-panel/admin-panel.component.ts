import { Component } from '@angular/core';
import { Router, RouterLink} from '@angular/router';
import { ApiService } from '../services/api-service.service';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '../components/dynamic-form/dynamic-form.component';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

/**
 * Component that contains the admin panel. Inside the admin panel the users can be administrated and also everything to do with the rubrics can be 
 * managed here.
 */
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [RouterLink, CommonModule, DynamicFormComponent, ReactiveFormsModule, MatSelectModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {
  thesisTypeList: any;
  formJsonConfig!: any;

  chooseTemplateTypeForm = this.formBuilder.group({
    thesisTypeSelect: ['', Validators.required]
  });

  /**
   * The constructor of the component. Here are also given all needed services to inject as parameters.
   * 
   * @param api Service to communicate with the backend.
   * @param router Service for naviagte between pages.
   * @param formBuilder Servcie that handles the creation of forms from a given field config.
   */
  constructor(private api: ApiService, public router: Router, private formBuilder: FormBuilder) { }

  /**
   * Function to get the form config for the list of users from the backend.
   */
  getUserList() {
    this.api.getListOfUsers()
      .subscribe(jsonConfig => {
        this.formJsonConfig = jsonConfig;
      });
  }

  /**
   * Function to create template for new thesis type.
   */
  newThesisType() {
    this.api.getNewTemplate()
      .subscribe(jsonConfig => {
        this.formJsonConfig = jsonConfig;
      });
  }

  /**
   * Function that is called by a button click and gets the list of thesis types from the backend.
   */
  chooseThesisType() {
    this.api.getTemplateCollection()
      .subscribe(data => {
        this.thesisTypeList = data;
      });
  }

  /**
   * This function gets called when a thesis type is selected. It sends an API call with the selected thesis type 
   * to the backend and receives the template for this thesis type for editing.
   */
  getTemplateFromBackend() {
    if (this.chooseTemplateTypeForm.valid) {
      this.api.getTemplateForEdit(this.chooseTemplateTypeForm.get('thesisTypeSelect')!.value!) 
        .subscribe(jsonConfig => {
          this.formJsonConfig = jsonConfig;
        });
    }
  }

}