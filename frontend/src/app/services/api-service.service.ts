import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service that handles the api communication with the backend.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  /**
   * The constructor of the service. Here are also given all needed services to inject as parameters.
   * 
   * @param http Service that handles http calls.
   */
  constructor(private http: HttpClient) { }

  // Needs to be changed based on the port/url on which the server is executed.
  BASE_URL = 'http://localhost:8000/api';

  // ===== GRADING =====

  /**
   * Receiving a thesis template based on the thesis type.
   * 
   * @param thesisType The thesis type.
   * @returns The template.
   */
  getGradingTemplate(thesisType: string): Observable<any> { 
    return this.http.get(this.BASE_URL + '/grading/getGradingTemplate/' + thesisType, { headers: { Accept: 'application/json' } });
  }

  /**
   * Posts the grading to the backend and generates the pdf from it.
   * 
   * @param gradingData The data for the grading.
   * @returns An Observable with no content.
   */
  postGradingAndGeneratePDF(gradingData: any): Observable<any> { 
    return this.http.post<any>(this.BASE_URL + '/grading/createPDF', JSON.stringify(gradingData), { headers: {'content-type': 'application/json' } });
  }

  /**
   * Receives the generated grading pdf from the backend.
   * 
   * @param username The username of the current user.
   * @returns The generated pdf.
   */
  getPDF(username: string): Observable<any> {
    return this.http.get(this.BASE_URL + '/grading/getPDF/' + username, { responseType: 'blob' });
  }

  // ===== USERS =====

  /**
   * The login of a user.
   * 
   * @param credentials The login credentials of a user.
   * @returns The data created for the logged in user, e.g. the auth token.
   */
  postLogin(credentials: any): Observable<any> {
    return this.http.post<any>(this.BASE_URL + '/users/login', JSON.stringify(credentials), { headers: {'content-type': 'application/json' } });
  }

  /**
   * Call to delete all no longer needed files of the user from the backend.
   * 
   * @param username The username of the user.
   * @returns An Observable with no content.
   */
  deleteFilesWhenLogout(username: string): Observable<any> {
    return this.http.delete(this.BASE_URL + '/users/delelteFilesWhenLogout/' + username);
  }

  /**
   * API call to register a new user in the backend.
   * 
   * @param data The data of the new user.
   * @returns An Observable with no content.
   */
  postUserRegistration(data: any): Observable<any> {
    return this.http.post<any>(this.BASE_URL + '/users/register', JSON.stringify(data), { headers: {'content-type': 'application/json' } });
  }

  /**
   * Refreshes the authToken for a user.
   * 
   * @param refreshData The refreshToken of the user.
   * @returns The new auth token for the user.
   */
  refreshAuthToken(refreshData: any): Observable<any> {
    return this.http.post<any>(this.BASE_URL + '/users/refreshToken', JSON.stringify(refreshData), { headers: {'content-type': 'application/json' } });
  }

  /**
   * Receives the form data for editing user details.
   * 
   * @param username The username of the user.
   * @returns The form fields for editing the user details.
   */
  getUserFormForEdit(username: string): Observable<any> {
    return this.http.get(this.BASE_URL + '/users/getEditForUser/' + username, { headers: { Accept: 'application/json' } });
  }

  /**
   * Deletes an user in the backend.
   * 
   * @param username The username of the user that should be deleted.
   * @returns An Observable with no content.
   */
  deleteUser(username: string): Observable<any> {
    return this.http.delete(this.BASE_URL + '/users/deleteUser/' + username);
  }

  /**
   * Changes the role of an user in the backend.
   * 
   * @param username The username of the user that should be deleted.
   * @returns An Observable with no content.
   */
  changeUserRole(username: string): Observable<any> {
    return this.http.put(this.BASE_URL + '/users/changeUserRole/' + username, '');
  }

  /**
   * Changes the data of a user.
   * 
   * @param userData The changed data for the user.
   * @returns An Observable with no content.
   */
  postChangedUserData(userData: any): Observable<any> {
    return this.http.put<any>(this.BASE_URL + '/users/saveChangedUserData', JSON.stringify(userData), { headers: {'content-type': 'application/json' } });
  }

  /**
   * Receivs the data for all users.
   * 
   * @returns The data for all users.
   */
  getListOfUsers(): Observable<any> {
    return this.http.get(this.BASE_URL + '/users/getListOfUsers', { headers: { Accept: 'application/json' } });
  }

  // ===== RUBRICS =====
  
  /**
   * Receives the form data for creating a new thesis type.
   * 
   * @returns The config for creating a new template.
   */
  getNewTemplate(): Observable<any> {
    return this.http.get(this.BASE_URL + '/rubrics/getNewTemplate', { headers: { Accept: 'application/json' } });
  }

  /**
   * Receives the form data for editing a specific thesis type.
   * 
   * @param thesisType The thesis type.
   * @returns The template for editing this thesis type.
   */
  getTemplateForEdit(thesisType: string): Observable<any> {
    return this.http.get(this.BASE_URL + '/rubrics/getTemplateForEdit/' + thesisType, { headers: { Accept: 'application/json' } });
  }

  /**
   * Receivs a list of all existing thesis types.
   * 
   * @returns The collection of all existing thesis types.
   */
  getTemplateCollection(): Observable<any> {
    return this.http.get(this.BASE_URL + '/rubrics/getTemplateCollection', { headers: { Accept: 'application/json' } });
  }

  /**
   * Changes the template in the backend.
   * 
   * @param data The data of a thesis type template.
   * @returns An Observable with no content.
   */
  editTemplate(data: any): Observable<any> {
    return this.http.post<any>(this.BASE_URL + '/rubrics/saveEditedTemplate', JSON.stringify(data), { headers: {'content-type': 'application/json' } });
  }

  /**
   * Deletes a template for an existing thesis type.
   * 
   * @param templateTitle The title of the template that should be deleted.
   * @returns An Observable with no content.
   */
  deleteTemplate(templateTitle: string): Observable<any> {
    return this.http.delete(this.BASE_URL + '/rubrics/deleteTemplate/' + templateTitle);
  }

}