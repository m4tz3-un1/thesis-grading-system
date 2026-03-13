import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GradingDataService } from '../../services/grading-data.service';
import { ApiService } from '../../services/api-service.service';

/**
 * This is the component for the input of the general thesis data. It is also the home route which is shown after login.
 */
@Component({
  selector: 'app-general-data-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],  
  templateUrl: './general-data-input.component.html',
  styleUrl: './general-data-input.component.scss'
})
export class GeneralDataInputComponent {
  thesisTypeList: any;
  differentData = false; // Added 
  oberseminarSet = false; // Added

  oberseminarDateLabelElement!: HTMLElement;
  oberseminarTimeLabelElement!: HTMLElement;

  // construction of the form for the input of the general data
  generalDataInput = this.formBuilder.group({
    studentFirstName: ['', Validators.required],
    studentLastName: ['', Validators.required],
    matriculationNumber: ['', Validators.required], 
    thesisDegree: ['', Validators.required],
    thesisTitle: ['', [Validators.required, Validators.pattern('^([A-Za-z0-9ÄäÖöÜüß.:,;!?()\\{\\}\\[\\]"\'%&/ -])+$')]],
    thesisType: ['', Validators.required],
    oberseminarDate: '',
    oberseminarTime: ''
  });

  /**
   * The constructor of the component. Here are also given all needed services to inject as parameters.
   * 
   * @param formBuilder The service to create forms.
   * @param router Service for navigating between pages.
   * @param gradingDataService Service that handles everything about the grading data.
   * @param api Service that handles the api communication with the backend.
   */
  constructor(
    private formBuilder: FormBuilder, 
    public router: Router, 
    public gradingDataService: GradingDataService, 
    private api: ApiService
  ) {}

  /**
   * Function that is executed when the component is created.
   * 
   * It handles subscription to changes so that all changes can saved to the local storage later on and filles the form with data if they already 
   * exist in the local storage.
   */
  ngOnInit() {
    this.oberseminarDateLabelElement = document.getElementById('oberseminarDateLabel') as HTMLElement;
    this.oberseminarTimeLabelElement = document.getElementById('oberseminarTimeLabel') as HTMLElement;

    this.api.getTemplateCollection().subscribe(data => {
      this.thesisTypeList = data;
    })

    // Added begin
    if (this.gradingDataService.isGradingDataExisting()) {
      let gradingData = this.gradingDataService.getGradingData();
        
      for (let item in gradingData.fields) {
        if (gradingData.fields[item].id === 'studentFirstName') {
          this.generalDataInput.controls['studentFirstName'].setValue(gradingData.fields[item].value);
          this.generalDataInput.controls['studentFirstName'].updateValueAndValidity();
        }
        if (gradingData.fields[item].id === 'studentLastName') {
          this.generalDataInput.controls['studentLastName'].setValue(gradingData.fields[item].value);
          this.generalDataInput.controls['studentLastName'].updateValueAndValidity();
        }
        if (gradingData.fields[item].id === 'matriculationNumber') {
          this.generalDataInput.controls['matriculationNumber'].setValue(gradingData.fields[item].value);
          this.generalDataInput.controls['matriculationNumber'].updateValueAndValidity();
        }
        if (gradingData.fields[item].id === 'thesisTitle') {
          this.generalDataInput.controls['thesisTitle'].setValue(gradingData.fields[item].value);
          this.generalDataInput.controls['thesisTitle'].updateValueAndValidity();
        }
        if (gradingData.fields[item].id === 'oberseminarDate') {
          this.generalDataInput.controls['oberseminarDate'].setValue(gradingData.fields[item].value);
          this.generalDataInput.controls['oberseminarDate'].updateValueAndValidity();
        }
        if (gradingData.fields[item].id === 'oberseminarTime') {
          this.generalDataInput.controls['oberseminarTime'].setValue(gradingData.fields[item].value);
          this.generalDataInput.controls['oberseminarTime'].updateValueAndValidity();
        }
      }

      this.generalDataInput.controls['thesisDegree'].setValue(this.gradingDataService.getThesisDegree());
      this.generalDataInput.controls['thesisDegree'].updateValueAndValidity();
      this.generalDataInput.controls['thesisType'].setValue(this.gradingDataService.getThesisType());
      this.generalDataInput.controls['thesisType'].updateValueAndValidity();
      this.gradingDataService.storeGeneralData(this.generalDataInput.getRawValue());
    }
    // Added end

    // Changed if to else if
    else if (this.gradingDataService.isGeneralDataExisting()) {
      this.generalDataInput.controls['studentFirstName'].setValue(this.gradingDataService.getStudentFirstName());
      this.generalDataInput.controls['studentLastName'].setValue(this.gradingDataService.getStudentLastName());
      this.generalDataInput.controls['matriculationNumber'].setValue(this.gradingDataService.getMatriculationNumber());
      this.generalDataInput.controls['thesisDegree'].setValue(this.gradingDataService.getThesisDegree());
      this.generalDataInput.controls['thesisType'].setValue(this.gradingDataService.getThesisType());
      this.generalDataInput.controls['thesisTitle'].setValue(this.gradingDataService.getThesisTitle());
      this.generalDataInput.controls['oberseminarDate'].setValue(this.gradingDataService.getOberseminarDate());
      this.generalDataInput.controls['oberseminarTime'].setValue(this.gradingDataService.getOberseminarTime());
      this.generalDataInput.controls['studentFirstName'].updateValueAndValidity();
      this.generalDataInput.controls['studentLastName'].updateValueAndValidity();
      this.generalDataInput.controls['matriculationNumber'].updateValueAndValidity();
      this.generalDataInput.controls['thesisDegree'].updateValueAndValidity();
      this.generalDataInput.controls['thesisType'].updateValueAndValidity();
      this.generalDataInput.controls['thesisTitle'].updateValueAndValidity();
      this.generalDataInput.controls['oberseminarDate'].updateValueAndValidity();
      this.generalDataInput.controls['oberseminarTime'].updateValueAndValidity();
    }

    this.generalDataInput.valueChanges.subscribe(() => {
      this.gradingDataService.storeGeneralData(this.generalDataInput.getRawValue());
    })
  }

  /**
   * Sets the oberseminar date and time to required if one of the fields has input or the degree is set to bachelor.
   */
  setOberseminarValidators() {
    if (this.generalDataInput.getRawValue().thesisDegree === "bachelor's thesis" ||
    this.generalDataInput.getRawValue().oberseminarDate !== "" ||
    this.generalDataInput.getRawValue().oberseminarTime !== "") {
      this.generalDataInput.controls['oberseminarDate'].addValidators(Validators.required);
      this.generalDataInput.controls['oberseminarTime'].addValidators(Validators.required);
      this.oberseminarDateLabelElement.innerHTML = 'Oberseminar date: <span style="color:red; font-size:80%">&#42;</span>';
      this.oberseminarTimeLabelElement.innerHTML = 'Oberseminar time: <span style="color:red; font-size:80%">&#42;</span>';
    }
    else {
      this.generalDataInput.controls['oberseminarDate'].clearValidators();
      this.generalDataInput.controls['oberseminarTime'].clearValidators();
      this.oberseminarDateLabelElement.innerHTML = 'Oberseminar date:';
      this.oberseminarTimeLabelElement.innerHTML = 'Oberseminar time:';
    }
    this.generalDataInput.controls['oberseminarDate'].updateValueAndValidity();
    this.generalDataInput.controls['oberseminarTime'].updateValueAndValidity();
  }

  // Added function
  /**
   * Function to update the data of the existing evaluation and continue to the grading system.
   */
  updateGradingData() {
    let gradingData = this.gradingDataService.getGradingData();

    if (this.oberseminarSet) {
      gradingData.fields.splice(0, 7);
    }
    else {
      gradingData.fields.splice(0, 5);
    }
    
    if (this.gradingDataService.isOberseminarSet()) {
      gradingData.fields.unshift({"id": "oberseminarTime", 
        "label": "Oberseminar time:", 
        "type": "time", 
        "required": true, 
        "value": this.gradingDataService.getOberseminarTime()});
      gradingData.fields.unshift({"id": "oberseminarDate", 
        "label": "Oberseminar date:", 
        "type": "date", 
        "required": true, 
        "value": this.gradingDataService.getOberseminarDate()});
    }
    gradingData.fields.unshift({"id": "thesisTitle", 
      "label": "Thesis title:", 
      "type": "textarea", 
      "required": true, 
      "pattern": '^([A-Za-z0-9ÄäÖöÜüß.:,;!?()\\{\\}\\[\\]"\'%&/ -])+$',
      "value": this.gradingDataService.getThesisTitle()}); 
    gradingData.fields.unshift({"id": "matriculationNumber", 
      "label": "Matriculation Number:", 
      "type": "number", 
      "required": true, 
      "value": this.gradingDataService.getMatriculationNumber()});
    gradingData.fields.unshift({"id": "studentLastName", 
      "label": "Lastname:", 
      "type": "text", 
      "required": true, 
      "value": this.gradingDataService.getStudentLastName()});
    gradingData.fields.unshift({"id": "studentFirstName", 
      "label": "Firstname:", 
      "type": "text", 
      "required": true, 
      "value": this.gradingDataService.getStudentFirstName()});
    gradingData.fields.unshift({"id": "thesisInfo", 
      "heading": "Student data:", 
      "type": "info", 
      "infotext": "Here you can edit the student data you put in earlier if necessary."});

    this.gradingDataService.storeGradingData(gradingData);
    this.gradingDataService.storeGeneralData(this.generalDataInput.value);
    this.router.navigate(['./gradingSystem']);
  }
  
  // Changed complete function - replacing old function is required
  /**
   * Submits the form.
   */
  onSubmit() {
    if (this.generalDataInput.valid) {
      if (this.gradingDataService.isGradingDataExisting()) {
        this.differentData = false;
        this.oberseminarSet = false;
        let gradingData = this.gradingDataService.getGradingData();
        
        for (let item in gradingData.fields) {
          if (gradingData.fields[item].id === 'studentFirstName' && 
            gradingData.fields[item].value !== this.gradingDataService.getStudentFirstName()) 
          {
            this.differentData = true;
          }
          if (gradingData.fields[item].id === 'studentLastName' && 
            gradingData.fields[item].value !== this.gradingDataService.getStudentLastName()) 
          {
            this.differentData = true;
          }
          if (gradingData.fields[item].id === 'matriculationNumber' && 
            gradingData.fields[item].value !== this.gradingDataService.getMatriculationNumber()) 
          {
            this.differentData = true;
          }
          if (gradingData.fields[item].id === 'thesisTitle' && 
            gradingData.fields[item].value !== this.gradingDataService.getThesisTitle()) 
          {
            this.differentData = true;
          }
          if (gradingData.fields[item].id === 'oberseminarDate' || gradingData.fields[item].id === 'oberseminarTime') 
          {
            this.oberseminarSet = true;
            if (gradingData.fields[item].id === 'oberseminarDate' && 
              gradingData.fields[item].value !== this.gradingDataService.getOberseminarDate()) 
            {
              this.differentData = true;
            }
            if (gradingData.fields[item].id === 'oberseminarTime' && 
              gradingData.fields[item].value !== this.gradingDataService.getOberseminarTime()) 
            {
              this.differentData = true;
            }
          }
        }

        if (this.differentData === true || (this.oberseminarSet === false && this.gradingDataService.isOberseminarSet())) {
          console.log('The data is different or the Oberseminar not existing right now.'); 
          this.updateGradingData();
        } 
        else {
          this.gradingDataService.storeGeneralData(this.generalDataInput.value);
          this.router.navigate(['./gradingSystem']);
        }
      }
      else {
        this.gradingDataService.storeGeneralData(this.generalDataInput.value);
        this.router.navigate(['./gradingSystem']);
      }
    }
  }
}