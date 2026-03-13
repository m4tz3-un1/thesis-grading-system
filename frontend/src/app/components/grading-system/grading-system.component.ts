import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { GradingDataService } from '../../services/grading-data.service';
import { ApiService } from '../../services/api-service.service';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';

/**
 * Component that handles the grading of the thesis. For this it includes the general data from the GeneralDataComponent.
 */
@Component({
  selector: 'app-grading-system',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent], 
  templateUrl: './grading-system.component.html',
  styleUrl: './grading-system.component.scss'
})
export class GradingSystemComponent {
  formJsonConfig!: JSON;

  /**
   * The constructor of the component. Here are also given all needed services to inject as parameters.
   * 
   * @param api Service that handles the api communication with the backend.
   * @param router Service for navigating between pages.
   * @param gradingDataService Service that handles everything regarding the grading data.
   */
  constructor(
    private api: ApiService, 
    public router: Router, 
    private gradingDataService: GradingDataService
  ) {}

  /**
   * Is called when the component is created. It checks if data for the form are existing and if so then the form will be created from this data. 
   * Otherwise the form will be generated from the template of the given thesis type.
   */
  ngOnInit() {
    if (!this.gradingDataService.isGradingDataExisting()) {
      this.api
        .getGradingTemplate(this.gradingDataService.getThesisType())
        .subscribe((formconfigJson) => {
          // adds the fields for the student data to the received template for the rubrics - so that both parts can be set/edited together
          formconfigJson.fields.unshift({"id": "thesisInfo", 
            "heading": "Thesis data:", 
            "type": "info", 
            "infotext": "With the rubrics below you can grade the thesis. Please choose for each rubric the text which fits best and then you can "
            + "edit this text and the proposed points."});
          if (this.gradingDataService.isOberseminarSet()) {
            formconfigJson.fields.unshift({"id": "oberseminarTime", 
              "label": "Oberseminar time:", 
              "type": "time", 
              "required": true, 
              "value": this.gradingDataService.getOberseminarTime()});
            formconfigJson.fields.unshift({"id": "oberseminarDate", 
              "label": "Oberseminar date:", 
              "type": "date", 
              "required": true, 
              "value": this.gradingDataService.getOberseminarDate()});
          }
          formconfigJson.fields.unshift({"id": "thesisTitle", 
            "label": "Thesis title:", 
            "type": "textarea", 
            "required": true, 
            "pattern": '^([A-Za-z0-9ÄäÖöÜüß.:,;!?()\\{\\}\\[\\]"\'%&/ -])+$',
            "value": this.gradingDataService.getThesisTitle()}); 
          formconfigJson.fields.unshift({"id": "matriculationNumber", 
            "label": "Matriculation Number:", 
            "type": "number", 
            "required": true, 
            "value": this.gradingDataService.getMatriculationNumber()});
          formconfigJson.fields.unshift({"id": "studentLastName", 
            "label": "Lastname:", 
            "type": "text", 
            "required": true, 
            "value": this.gradingDataService.getStudentLastName()});
          formconfigJson.fields.unshift({"id": "studentFirstName", 
            "label": "Firstname:", 
            "type": "text", 
            "required": true, 
            "value": this.gradingDataService.getStudentFirstName()});
          formconfigJson.fields.unshift({"id": "thesisInfo", 
            "heading": "Student data:", 
            "type": "info", 
            "infotext": "Here you can edit the student data you put in earlier if necessary."});
          this.formJsonConfig = formconfigJson;
          this.gradingDataService.storeGradingData(this.formJsonConfig);
      }); 
    }
    else {
      this.formJsonConfig = this.gradingDataService.getGradingData();
    }
  }
}