import { Injectable } from '@angular/core';

/**
 * Service that handles everything regaring the grading and general data of the thesis.
 */
@Injectable({
  providedIn: 'root'
})
export class GradingDataService {

  /**
   * Constructor of the service.
   */
  constructor() { }

  // ===== Setting Data =====

  /**
   * Saves the general data to local storage.
   * 
   * @param generalData The general data of the thesis like the title and the student information.
   */
  storeGeneralData(generalData: any) {
    // done in for loop because the format is predefined and the same every time 
    for (let item in generalData) {
      localStorage.setItem(item, JSON.stringify(generalData[item]));
    }
  }

  /**
   * Save the grading data into local storage.
   * 
   * @param gradingData The grading data. It consists of some of the general data and the grading - the rubrics with points.
   */
  storeGradingData(gradingData: any) {
    localStorage.setItem('gradingData', JSON.stringify(gradingData));
  }

  // ===== Clear Data =====

  /**
   * Clears the local storage for the general data.
   */
  clearStoredGeneralData() {
    localStorage.removeItem('studentFirstName');
    localStorage.removeItem('studentLastName');
    localStorage.removeItem('matriculationNumber');
    localStorage.removeItem('thesisDegree');
    localStorage.removeItem('thesisTitle');
    localStorage.removeItem('thesisType');
    localStorage.removeItem('oberseminarDate');
    localStorage.removeItem('oberseminarTime');
  }

  /**
   * Clears the the grading data from the local storage.
   */
  clearStoredGradingData() {
    localStorage.removeItem('gradingData');
  }

  // ===== Checks if something exists/is set =====

  /**
   * Checks if the local storage contains the general data.
   * 
   * @returns If general data exists in the local storage.
   */
  isGeneralDataExisting() {
    return JSON.parse(localStorage.getItem('thesisType')!) !== null;
  }

  /**
   * Checks if data for the oberseminar are given.
   * 
   * @returns If the oberseminar has data in it.
   */
  isOberseminarSet() {
    return JSON.parse(localStorage.getItem('oberseminarDate')!) !== '';
  }

  /**
   * Chekcs if data for the grading are set to local storage.
   * 
   * @returns If data for the grading data exist.
   */
  isGradingDataExisting() {
    return JSON.parse(localStorage.getItem('gradingData')!) !== null;
  }

  // ===== Getters =====

  /**
   * Gets the students firstname.
   * 
   * @returns The firstname of the student.
   */
  getStudentFirstName() {
    return JSON.parse(localStorage.getItem('studentFirstName')!);
  }

  /**
   * Gets the students lastname.
   * 
   * @returns The lastname of the student.
   */
  getStudentLastName() {
    return JSON.parse(localStorage.getItem('studentLastName')!);
  }

  /**
   * Gets the students matriculation number.
   * 
   * @returns The matriculation number of the student.
   */
  getMatriculationNumber() {
    return JSON.parse(localStorage.getItem('matriculationNumber')!);
  }

  /**
   * Gets the thesis degree.
   * 
   * @returns The degree of the thesis.
   */
  getThesisDegree() {
    return JSON.parse(localStorage.getItem('thesisDegree')!);
  }

  /**
   * Gets the thesis title.
   * 
   * @returns The title of the thesis.
   */
  getThesisTitle() {
    return JSON.parse(localStorage.getItem('thesisTitle')!);
  }

  /**
   * Gets the thesis type.
   * 
   * @returns The type of the thesis.
   */
  getThesisType() {
    return JSON.parse(localStorage.getItem('thesisType')!);
  }

  /**
   * Gets the oberseminar date.
   * 
   * @returns The date of the oberseminar.
   */
  getOberseminarDate() {
    return JSON.parse(localStorage.getItem('oberseminarDate')!);
  }

  /**
   * Gets the oberseminar time.
   * 
   * @returns The time of the oberseminar.
   */
  getOberseminarTime() {
    return JSON.parse(localStorage.getItem('oberseminarTime')!);
  }

  /**
   * Gets the grading data.
   * 
   * @returns The data of the grading.
   */
  getGradingData() {
    return JSON.parse(localStorage.getItem('gradingData')!);
  }
}
