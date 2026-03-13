import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { FormGeneratorService } from '../../services/form-generator.service';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api-service.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { GradingDataService } from '../../services/grading-data.service';
import { AuthService } from '../../services/auth-service.service';
import { first } from 'rxjs';

/**
 * This component handles a dynamic form. It is used to show different forms on the application based on a given set of fields with its data.
 */
@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicFormComponent implements OnInit {
  @Input() jsonConfig: any;
  dynamicForm!: FormGroup;
  originalFormTitle = '';
  currentFormTitle = '';
  listOfCategories = new Array;
  categoryCounter = 0;
  rubricCounter = 0;
  listOfPoints = new Array;
  totalPointsAtMoment = 0;
  gradeAtMoment = '';
  passwordsMatching = true;
  loading = false;

  /**
   * The constructor of the component. Here are also given all needed services to inject as parameters.
   * 
   * @param formGeneratorService Service to generate a form based on the given fields.
   * @param api Service that handles all api calls to the backend.
   * @param router Service for navigating between pages of the application.
   * @param gradingDataService Service that handles the data of the gradings the user does.
   * @param authService Service that handles the user.
   */
  constructor(private formGeneratorService: FormGeneratorService, 
    private api: ApiService, 
    public router: Router, 
    public gradingDataService: GradingDataService,
    private authService: AuthService
  ) {}

  /**
   * Function that is called when the component is created. It handles the creation of the form and in some cases some 
   * small operations to ensure other functions can work as intended.
   */
  ngOnInit(): void {
    // create the gradingForm and save the initial title of the jsonConfig
    this.dynamicForm = this.formGeneratorService.createForm(this.jsonConfig);
    this.originalFormTitle = this.jsonConfig.title;

    if (this.jsonConfig.task === 'grading') {
      // fill the listOfPoints with all point fields and the starting points of 0 and calculate Points and grade (in calc Points)
      for (let item in this.jsonConfig.fields) {
        if (this.jsonConfig.fields[item].id.includes('points')) {
          let pointElement = [this.jsonConfig.fields[item].id];
          this.jsonConfig.fields[item].value ? pointElement.push(Number(this.jsonConfig.fields[item].value)) : pointElement.push(0);
          this.listOfPoints.push(pointElement);
        }
      }
      this.calculatePoints();

      // save all changes of the grading into the localStorage using the gradingDataService
      this.dynamicForm.valueChanges.subscribe(() => {
        this.saveStatusOfForm();
        this.gradingDataService.storeGradingData(this.jsonConfig);
      })
    }
    
    // calculate sum of points for thesis template and split the template into categories
    if (this.jsonConfig.task === 'editTemplate') {
      for (let item in this.jsonConfig.fields) {
        if (this.jsonConfig.fields[item].id.endsWith('max')) {
          let pointElement = [this.jsonConfig.fields[item].id];
          this.jsonConfig.fields[item].value ? pointElement.push(Number(this.jsonConfig.fields[item].value)) : pointElement.push(0);
          this.listOfPoints.push(pointElement);
        }
      }
      this.calculatePoints();
    }
  }

  // ========== PASSWORD FIELDS ==========

  /**
   * Function to toggle the password visibility.
   * 
   * @param fieldID The ID of the password field.
   */
  changeVisibilityOfPassword(fieldID: string) {
    let passwordField = document.getElementById(fieldID) as HTMLInputElement;
    passwordField?.type === "password" ? passwordField.type = "text" : passwordField.type = "password";
  }

  /**
   * Function that sets all the password fields to required if one of them has any input and changes the labels accordingly.
   */
  setPasswortFieldsToRequired() {
    let oldPasswordLabelElement = document.getElementById('oldPasswordLabel') as HTMLElement;
    let newPasswordLabelElement = document.getElementById('newPasswordLabel') as HTMLElement;
    let confirmPasswordLabelElement = document.getElementById('confirmNewPasswordLabel') as HTMLElement;
    if (this.dynamicForm.get('oldPassword')?.getRawValue() !== '' || 
    this.dynamicForm.get('newPassword')?.getRawValue() !== '' ||
    this.dynamicForm.get('confirmNewPassword')?.getRawValue() !== '') {
      this.dynamicForm.controls['oldPassword'].addValidators(Validators.required);
      this.dynamicForm.controls['newPassword'].addValidators(Validators.required);
      this.dynamicForm.controls['confirmNewPassword'].addValidators(Validators.required);
      oldPasswordLabelElement.innerHTML = '<p class="logout-warning"><strong>Warning:</strong> When changing the password you will be logged out.</p> Old password: <span style="color:red; font-size:80%">&#42;</span>';
      newPasswordLabelElement.innerHTML = 'New password: <span style="color:red; font-size:80%">&#42;</span>';
      confirmPasswordLabelElement.innerHTML = 'Confirm new password: <span style="color:red; font-size:80%">&#42;</span>';
    }
    else {
      this.dynamicForm.controls['oldPassword'].clearValidators();
      this.dynamicForm.controls['newPassword'].clearValidators();
      this.dynamicForm.controls['confirmNewPassword'].clearValidators();
      oldPasswordLabelElement.innerHTML = 'Old password:';
      newPasswordLabelElement.innerHTML = 'New password:';
      confirmPasswordLabelElement.innerHTML = 'Confirm new password:';
    }
    this.dynamicForm.controls['oldPassword'].updateValueAndValidity();
    this.dynamicForm.controls['newPassword'].updateValueAndValidity();
    this.dynamicForm.controls['confirmNewPassword'].updateValueAndValidity();
  }

  /**
   * Function that checks if the new password and the confirmation of the new password are identical.
   */
  checkPasswordMatch() {
    if (this.dynamicForm.get('newPassword')?.getRawValue() !== this.dynamicForm.get('confirmNewPassword')?.getRawValue()) {
      this.passwordsMatching = false;
      this.dynamicForm.get('confirmNewPassword')?.setErrors({'incorrect': true});
    }
    else {
      this.passwordsMatching = true;
    }
  }

  // ========== GRADING ==========

  /**
   * This function sets the fields for points and to edit the text to visible when a rubric is choosen in a dropdown menu.
   * 
   * @param fieldID The id of the select field for a rubric.
   */
  setVisibilityAndValueForPointsAndText(fieldID: string) {
    this.dynamicForm.controls[fieldID + ' editarea'].setValue(this.dynamicForm.get(fieldID)?.getRawValue());
    for (let field of this.jsonConfig.fields) {
      if (field.id === fieldID) {
        for (let option of field.options) {
          if (option.value === this.dynamicForm.get(fieldID)?.getRawValue()) {
            this.dynamicForm.controls[fieldID + ' points'].setValue(option.points);
            this.changePoints(fieldID + ' points');
          }
        }
      }
      if (field.id === fieldID + ' points') {
        field.visible = true;
      }
      if (field.id === fieldID + ' editarea') {
        field.visible = true;
      }
    }
    this.dynamicForm.controls[fieldID + ' editarea'].updateValueAndValidity();
    this.dynamicForm.controls[fieldID + ' points'].updateValueAndValidity();
  }

  /**
   * This function changes the points in the saved array based on the input of the field and calculates the new sum of points.
   * 
   * @param fieldID The id of the points field.
   */
  changePoints(fieldID: string) {
    if (this.dynamicForm.get(fieldID)?.getRawValue().trim().match(/^\d+([.][5]){0,1}$/)) {
      for (let pointElement of this.listOfPoints) {
        if (pointElement[0] === fieldID) {
          pointElement[1] = Number(this.dynamicForm.get(fieldID)?.getRawValue());
          this.calculatePoints();
        }
      }
    }
  }

  /**
   * This function is called when the points of the fields are changed with the buttons and changes the points based on the pressed button.
   * If the field contains a range of points the operation is done to the right number and the left number will be droped.
   * 
   * @param fieldID The id of the points field.
   * @param mathFunction The mathematical operation which should be done - add or sub.
   */
  addOrSubtractPoints(fieldID: string, mathFunction: string) {
    let points = 0;

    if (this.dynamicForm.get(fieldID)?.getRawValue().trim().match(/^(-)?\d+([.][5]){0,1}$/)) {
      points = Number(this.dynamicForm.get(fieldID)?.getRawValue().trim());
    }    
    else {
      points = Number(this.dynamicForm.get(fieldID)?.getRawValue().split('-')[1].trim());
    }

    if (mathFunction === 'add') {
      points += 0.5;
    }
    else {
      points -= 0.5;
    }

    this.dynamicForm.controls[fieldID].setValue(points.toString());
    this.changePoints(fieldID);
    this.dynamicForm.controls[fieldID].updateValueAndValidity();
  }

  /**
   * Function that calculates the grade based on the sum of points.
   */
  calculateGrade() {
    if (this.totalPointsAtMoment > 95.5) {
      this.gradeAtMoment = '1.0 (sehr gut/very good)';
    }
    else if (this.totalPointsAtMoment > 91.5) {
      this.gradeAtMoment = '1,3 (sehr gut minus)';
    }
    else if (this.totalPointsAtMoment > 86.5) {
      this.gradeAtMoment = '1,7 (gut plus)';
    }
    else if (this.totalPointsAtMoment > 82.5) {
      this.gradeAtMoment = '2,0 (gut)';
    }
    else if (this.totalPointsAtMoment > 78.5) {
      this.gradeAtMoment = '2,3 (gut minus)';
    }
    else if (this.totalPointsAtMoment > 73.5) {
      this.gradeAtMoment = '2,7 (befriedigend plus)';
    }
    else if (this.totalPointsAtMoment > 69.5) {
      this.gradeAtMoment = '3,0 (befriedigend)';
    }
    else if (this.totalPointsAtMoment > 63.5) {
      this.gradeAtMoment = '3,3 (befriedigend minus)';
    }
    else if (this.totalPointsAtMoment > 58.5) {
      this.gradeAtMoment = '3,7 (ausreichend plus)';
    }
    else if (this.totalPointsAtMoment > 49.5) {
      this.gradeAtMoment = '4,0 (ausreichend)';
    }
    else {
      this.gradeAtMoment = '5,0 (nicht ausreichend)';
    }
  }

  // ========== GENERAL FUNCTIONS ==========

  /**
   * Function that calculates the sum of points based on the saved points in the array.
   */
  private calculatePoints() {
    let addedPoints = 0;

    for (let item of this.listOfPoints) {
      if (item[1].toString().match(/^\d+([.][5]){0,1}$/)) {
        addedPoints += item[1];
      }
    }

    this.totalPointsAtMoment = addedPoints;
    this.jsonConfig.task === 'grading' ? this.calculateGrade() : '';
  }

  /**
   * Function that saves the status of the form at the moment to the local variable so that no other changes get lost when something is deleted 
   * (e.g. rubrics of a thesis template).
   */
  saveStatusOfForm() {
    for (let field of this.jsonConfig.fields) {
      if ((!field.value || field.value !== this.dynamicForm.controls[field.id].getRawValue()) &&
        field.id !== 'line' && field.id !== 'addCategoryButton') 
      {
        field.value = this.dynamicForm.controls[field.id].getRawValue();
      }
    }
  }

  // ========== EDIT TEMPLATES ==========

  /**
   * Function that splits the config string into an array of categories.
   */
  splitConfigIntoCategories() {
    this.saveStatusOfForm();

    let rubric = [];
    let category = [];
    this.listOfCategories = [];
    this.currentFormTitle = this.dynamicForm.controls['thesisTypeTitle'].getRawValue();

    for (let item in this.jsonConfig.fields) {
      if (this.jsonConfig.fields[item].id.endsWith('category')) {
        if (category.length !== 0) {
          this.listOfCategories.push(category);
          category = [];
        }
        category.push([this.jsonConfig.fields[item].id, 
          this.jsonConfig.fields[item].value, 
          'Set name of the new category', 
          this.jsonConfig.fields[item].newRubricCounter]);
      }
      if (!this.jsonConfig.fields[item].id.endsWith('category') &&
        this.jsonConfig.fields[item].id !== 'line' &&
        this.jsonConfig.fields[item].id !== 'thesisTypeTitle' &&
        this.jsonConfig.fields[item].id !== 'addCategoryButton') 
      { 
        if (this.jsonConfig.fields[item].id.endsWith('name')) {
          rubric = [];
          rubric.push([this.jsonConfig.fields[item].id, this.jsonConfig.fields[item].value, 'Set name of the new rubric']);
        }
        else if (this.jsonConfig.fields[item].id.endsWith('max')) {
          rubric.push([this.jsonConfig.fields[item].id, 
            this.jsonConfig.fields[item].value, 
            this.jsonConfig.fields[item].newOptionCounter, 
            'Set max points for rubric']);
          category.push(rubric);
        }
        else if (this.jsonConfig.fields[item].id.endsWith('points')) {
          rubric.push([this.jsonConfig.fields[item].id, this.jsonConfig.fields[item].value, 'Input points for option']);
        }
        else {
          rubric.push([this.jsonConfig.fields[item].id, this.jsonConfig.fields[item].value, 'Input text for the option of the new rubric']);
        }
      }
      if (this.jsonConfig.fields[item].id === 'addCategoryButton') {
        this.listOfCategories.push(category);
        this.listOfCategories.push([this.jsonConfig.fields[item].id, this.jsonConfig.fields[item].newCategoryCounter]);
      }
    }
  }

  /**
   * Function that creates a config string from the array of categories.
   */
  createConfigFromCategories() {
    let configString = '{"title": ' + JSON.stringify(this.originalFormTitle) + ','
      + '"task": "editTemplate",'
      + '"fields": ['
      + '{"id": "thesisTypeTitle",'
      + '"type": "longtext",'
      + '"label": "Thesis type title:",'
      + '"placeholder": "Set thesis type title",'
      + '"value": ' + JSON.stringify(this.currentFormTitle) + ','
      + '"required": true},';
    for (let i=0; i < this.listOfCategories.length-1; i++) {
      for (let j=0; j < this.listOfCategories[i].length; j++) {
        if (this.listOfCategories[i][j][0].toString().endsWith('category')) {
          configString += '{ "id": "line",'
            + '"type": "line"},'
            + '{"id": ' + JSON.stringify(this.listOfCategories[i][j][0]) + ','
            + '"type": "longtext", '
            + '"newRubricCounter": ' + this.listOfCategories[i][j][3] + ','
            + '"label": ' + JSON.stringify(this.listOfCategories[i][j][0] + ':') + ','
            + '"placeholder": ' + JSON.stringify(this.listOfCategories[i][j][2]) + ','
            + '"value": ' + JSON.stringify(this.listOfCategories[i][j][1]) + ', '
            + '"required": true},';
        }
        else {
          for (let item of this.listOfCategories[i][j]) {
            if (item[0].endsWith('name')) {
              configString += '{ "id": "line",'
                + '"type": "line"},'
                + '{"id": ' + JSON.stringify(item[0]) + ','
                + '"type": "longtext",'
                + '"label": ' + JSON.stringify(item[0] + ':') + ','
                + '"placeholder": ' + JSON.stringify(item[2]) + ','
                + '"value": ' + JSON.stringify(item[1]) + ','
                + '"required": true},';
            }
            else if (item[0].endsWith('points')) {
              configString += '{"id": ' + JSON.stringify(item[0]) + ','
                + '"type": "text",'
                + '"label": ' + JSON.stringify(item[0] + ':') + ','
                + '"placeholder": ' + JSON.stringify(item[2]) + ','
                + '"required": true,'
                + '"value": ' + JSON.stringify(item[1]) + ','
                + '"pattern": "([0-9]+([.][5])?){1}([ ]*[-]{1}[ ]*[0-9]+([.][5])?)?",'
                + '"deleteOption": true},';
            }
            else if (item[0].endsWith('max')) {
              configString += '{"id": ' + JSON.stringify(item[0]) + ','
                + '"type": "text",'
                + '"label": ' + JSON.stringify(item[0] + ':') + ','
                + '"placeholder": ' + JSON.stringify(item[3]) + ','
                + '"value": ' + JSON.stringify(item[1]) + ',' 
                + '"required": true,'
                + '"pattern": "[0-9]+([.][5])?",'
                + '"newOptionCounter": ' + item[2] 
                + '},';
            }
            else {
              configString += '{"id": ' + JSON.stringify(item[0]) + ','
                + '"type": "textarea",'
                + '"label": ' + JSON.stringify(item[0] + ':') + ','
                + '"placeholder": ' + JSON.stringify(item[2]) + ','
                + '"required": true,'
                + '"value": ' + JSON.stringify(item[1]) + '},';
            }
          }
        }
      }
    }
    configString += '{ "id": "line", '
      + '"type": "line"}, '
      + '{"id": "addCategoryButton", '
      + '"type": "addCategory", '
      + '"newCategoryCounter": ' + JSON.stringify(this.listOfCategories[this.listOfCategories.length-1][1]) + '}]}';
    this.jsonConfig = JSON.parse(configString);
    this.dynamicForm = this.formGeneratorService.createForm(this.jsonConfig);    
  }

  /**
   * Function that adds a new category to the form.
   * 
   * @param newCategoryCounter The counter for new categories to ensure different identifiers.
   */
  addCategory(newCategoryCounter: number) {
    let newCategory = [];
    let newRubric = [];
    this.splitConfigIntoCategories();

    newCategory.push(['newCategory' + newCategoryCounter + ' category', '', 'Set name of the new category', 2]);
    newRubric.push(['newCategory' + newCategoryCounter + ' newRubric1 name', '', 'Set name of the new rubric']);
    newRubric.push(['newCategory' + newCategoryCounter + ' newRubric1 option1', '', 'Input text for the option of the new rubric']);
    newRubric.push(['newCategory' + newCategoryCounter + ' newRubric1 option1 points', '', 'Input points for option']);
    newRubric.push(['newCategory' + newCategoryCounter + ' newRubric1 points max', '', 2, 'Set max points for rubric']); 
    this.listOfPoints.push(['newCategory' + newCategoryCounter + ' newRubric1 points max', 0]);
    newCategory.push(newRubric);
    this.listOfCategories.splice(-1, 0, newCategory);
    this.listOfCategories[this.listOfCategories.length-1][1] += 1;

    this.createConfigFromCategories();
  }

  /**
   * Adds a new rubric to a category.
   * 
   * @param categoryID The id of the category to which the rubric should be added.
   * @param newRubricCounter Counter of how many new rubrics for the category are exist so far so that every new rubric has a different identifier.
   */
  addRubric(categoryID: string, newRubricCounter: number) {
    let newRubric = [];
    this.splitConfigIntoCategories();

    for (let i=0; i<this.listOfCategories.length-1; i++) {
      if (this.listOfCategories[i][0][0] === categoryID) { 
        newRubric.push([categoryID.replace('category', '') + 'newRubric' + newRubricCounter + ' name', '', 'Set name of the new rubric']);
        newRubric.push([categoryID.replace('category', '') + 'newRubric' + newRubricCounter + ' option1', '', 'Input text for the option of the new rubric']);
        newRubric.push([categoryID.replace('category', '') + 'newRubric' + newRubricCounter + ' option1 points', '', 'Input points for option']);
        newRubric.push([categoryID.replace('category', '') + 'newRubric' + newRubricCounter + ' points max', '', 2, 'Set max points for rubric']); 
        this.listOfPoints.push([categoryID.replace('category', '') + 'newRubric' + newRubricCounter + ' points max', 0]);
        this.listOfCategories[i].push(newRubric);
        this.listOfCategories[i][0][3] += 1;
      }

      this.createConfigFromCategories();
    }
  }

  /**
   * This functions adds a new option to an existing rubric.
   * 
   * @param fieldID The id of the rubric where a option should be added.
   * @param newOptionCounter The counter for how many new options for this rubric are already created so that every new option gets different identifiers.
   */
  addOption(fieldID: string, newOptionCounter: number) {
    let initialFieldIndex = 0;

    // Function for saving current status of the form 
    this.saveStatusOfForm();

    let newOptionTextField = {"id": fieldID.replace('points max', 'option') + newOptionCounter,
      "type": "textarea",
      "label": fieldID.replace('points max', 'option') + newOptionCounter + ':',
      "required": true,
      "placeholder": "Input text for this new option"
    };
    let newOptionPointsField = {"id": fieldID.replace('points max', 'option') + newOptionCounter + ' points',
      "type": "text",
      "label": fieldID.replace('points max', 'option') + newOptionCounter + ' points:',
      "required": true,
      "placeholder": "Set option points",
      "deleteOption": true
    };

    for (let field of this.jsonConfig.fields) {
      if (field.id === fieldID) {
        initialFieldIndex = this.jsonConfig.fields.indexOf(field);
      }
    }

    // Here there are all the generated fields from above are pushed into the form
    this.jsonConfig.fields.splice(initialFieldIndex, 0, newOptionTextField);
    this.jsonConfig.fields.splice(initialFieldIndex+1, 0, newOptionPointsField);
    this.jsonConfig.fields[initialFieldIndex+2].newOptionCounter = newOptionCounter+1;
    this.dynamicForm = this.formGeneratorService.createForm(this.jsonConfig); 
  }

  /**
   * Function for deleting a thesis template
   */
  deleteTemplate() {
    if (confirm('Please confirm to delete the thesis template.')) {
      this.api.deleteTemplate(this.originalFormTitle).subscribe(
        () => location.reload()
      )
    }
  }

  /**
   * Function that deletes a category.
   * 
   * @param categoryID The id of the category that should be deleted.
   */
  deleteCategory(categoryID: string) {
    if (confirm('Please confirm to delete the category.')) {
      this.splitConfigIntoCategories();

      for (let i=0; i<this.listOfCategories.length-1; i++) {
        if (this.listOfCategories[i][0][0] === categoryID) { 
          for (let j=0; j<this.listOfCategories[i].length; j++) {
            for (let item of this.listOfPoints) {
              if (item[0] === this.listOfCategories[i][j][this.listOfCategories[i][j].length-1][0]) {
                this.listOfPoints.splice(this.listOfPoints.indexOf(item), 1);
                this.calculatePoints();
              }
            }
          }
          this.listOfCategories.splice(i, 1);
        }
      }

      this.createConfigFromCategories();
    }
  }

  /**
   * Function that deletes a rubric.
   * 
   * @param rubricID Id of the rubric that should be deleted.
   */
  deleteRubric(rubricID: string) {
    if (confirm('Please confirm to delete the rubric.')) {
      this.splitConfigIntoCategories();

      for (let i=0; i<this.listOfCategories.length-1; i++) {
        for (let j=0; j<this.listOfCategories[i].length; j++) {
          if (this.listOfCategories[i][j][0][0] === rubricID.replace('points max', 'name')) {
            for (let item of this.listOfPoints) {
              if (item[0] === rubricID) {
                this.listOfPoints.splice(this.listOfPoints.indexOf(item), 1);
                this.calculatePoints();
              }
            }
            this.listOfCategories[i].splice(j, 1);
          }
        }
      }

      this.createConfigFromCategories();
    }
  }

  /**
   * This function handles deleting an option of a rubric.
   * 
   * @param fieldID The id of the field which should be deleted.
   */
  deleteOption(fieldID: string) {
    if (confirm('Please confirm to delete the option.')){
      let deleteIndex = 0;
      let deleteCounter = 0; 
      
      this.saveStatusOfForm();

      for (let field of this.jsonConfig.fields) {
        if (field.id.includes(fieldID.replace(' points', ''))) { 
          deleteIndex = this.jsonConfig.fields.indexOf(field);
          deleteCounter++;
        }
      }

      for (let i=0; i<deleteCounter; i++) {
        this.jsonConfig.fields.splice(deleteIndex-deleteCounter+1, 1);
      }

      this.dynamicForm = this.formGeneratorService.createForm(this.jsonConfig); 
    }
  }

  // ========== USER MANAGEMENT ==========

  /**
   * This function deletes an user.
   * 
   * @param fieldID The id of the user field that should be deleted.
   */
  deleteUser(fieldID: string) {
    if (confirm('Are you sure to delete the user?')){
      let deleteIndex = 0;

      for (let field of this.jsonConfig.fields) {
        if (field.id === fieldID) {
          deleteIndex = this.jsonConfig.fields.indexOf(field);
        }
      }

      // set to 3 so that deleted is all of the one user (the name field, the role field and the line seperator between users)
      for (let i=0; i<3; i++) {
        this.jsonConfig.fields.splice(deleteIndex, 1)
      }
      this.api.deleteUser(fieldID.replace('fullname', '')).subscribe();

      this.dynamicForm = this.formGeneratorService.createForm(this.jsonConfig);
    }
  }

  /**
   * This function changes the role of a user locally between admin and user. To save changes to the backend the form has to be submitted.
   * 
   * @param fieldID the id of the field for the user which role should be changed.
   */
  changeRole(fieldID: string) { 
    for (let field of this.jsonConfig.fields) {
      if (field.id === fieldID) {
        field.isAdmin = !field.isAdmin;
        this.api.changeUserRole(fieldID.replace('IsAdmin', '')).subscribe();
      }
    }
  }

  // ========== SUBMIT FORM ==========

  /**
   * This function submits the form based on the given task and handles all needed actions like API calls to the backend and navigating to the next 
   * needed page.
   * 
   * @param task The task the form is performing.
   */
  onSubmit(task: string) {
    let formValue = this.dynamicForm.getRawValue();

    if (this.dynamicForm.valid) {
      // This handles the grading of a thesis
      if (task === 'grading') { 
        this.loading = true;
        formValue.thesisType = this.gradingDataService.getThesisType();
        formValue.thesisDegree = this.gradingDataService.getThesisDegree();
        formValue.username = this.authService.getUsername();
        this.api.postGradingAndGeneratePDF(formValue).subscribe(
          () => {
            this.router.navigate(['./showGrading']);
          }
        );
      }
      // this handles the editing and the creation of thesis templates
      if (task === 'editTemplate') {
        formValue.originalThesisTitle = this.originalFormTitle;
        this.api.editTemplate(formValue).subscribe(
          () => {
            location.reload(); 
          }
        );
      }
      // Goes back to adminpanel if the list of users is edited
      if (task === 'changeUserList') {
        location.reload(); 
      }
      // this handles the change of the data of one specific user
      if (task === 'editUserData') {
        let passwordChanged = false;

        formValue.username = this.authService.getUsername();
        if (formValue.oldPassword !== '') {
          passwordChanged = true;
          formValue.refreshToken = this.authService.getRefreshToken();
        }
        this.api.postChangedUserData(formValue)
        .pipe(first())
        .subscribe(
          {
            next: () => {
              if (passwordChanged) {
                alert('Data updated successful! You will be logged out now.');
                this.authService.logout();
              }
              else {
                alert('Data updated successful!');
                location.reload(); 
              }
            },
            error: (err) => {
              alert(err.error.message);
            }
          }
        );
      }
    }
  }
}