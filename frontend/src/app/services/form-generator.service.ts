import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

/**
 * Service that handles the generation of a form from a received field configuration.
 */
@Injectable({
  providedIn: 'root',
})
export class FormGeneratorService {

  /**
   * Constructor of the service.
   */
  constructor() {}

  /**
   * Function that creates a form from a received field config.
   * 
   * @param jsonConfig The config of the fields that should be created in the form.
   * @returns The created form from the config.
   */
  createForm(jsonConfig: any): FormGroup {
    const formGroup = new FormGroup({});
    jsonConfig.fields.forEach((field: any) => {
      formGroup.addControl(
        field.id,
        new FormControl(field.value || '', this.getValidators(field)) 
      );
    });
    return formGroup;
  }

  /**
   * Function that handles the creation of validators of a field.
   * 
   * @param field - a field of the jsonConfig
   * @returns The validators for the given field
   */
  private getValidators(field: any) {
    const validators = [];
    if (field.required) {
      validators.push(Validators.required);
    }
    if (field.min) {
      validators.push(Validators.min(field.min));
    }
    if (field.max) {
      validators.push(Validators.max(field.max));
    }
    if (field.pattern) {
      validators.push(Validators.pattern(field.pattern));
    }
    if (field.emailValidator) {
      validators.push(Validators.email);
    }
    return validators;
  }
}