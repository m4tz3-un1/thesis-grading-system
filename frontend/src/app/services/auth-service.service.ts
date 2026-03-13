import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api-service.service';
import { GradingDataService } from './grading-data.service';

/**
 * This service handles the authentification of users.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject: BehaviorSubject<any>;
  public isLoggedIn: Observable<any>;

  /**
   * The constructor of the service. Here are also given all needed services to inject as parameters.
   * Also in this constructor the login subject is created.
   * 
   * @param api The service that handles the communication with the backend.
   * @param router Servcie for navigating between pages.
   * @param gradingDataService Service for handling the grading data.
   */
  constructor(
    private api: ApiService, 
    private router: Router,
    private gradingDataService: GradingDataService
  ) { 
    this.isLoggedInSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('tgsAuthToken')!) !== null);
    this.isLoggedIn = this.isLoggedInSubject.asObservable();
  }

  /**
   * Functionality to get the information if the user is logged in as subject in other components.
   * An example is in the app.component.ts where this data is used for the navbar.
   */
  public get isUserLoggedIn() {
    return this.isLoggedInSubject.value;
  }

  /**
   * The login function receives the username and password from the login form
   * and handles the login with the backend.
   * It sets an item with the received user data into the localStorage.
   * Also the function sets the value for the subject to the received data.
   * 
   * @param username The username from the input into the login form.
   * @param password The password from the input into the login form.
   * @returns The response gotten from the backend route.
   */
  login(username: string, password: string) {
    return this.api.postLogin({username, password})
      .pipe(tap((res) => {
        localStorage.setItem('tgsUsername', JSON.stringify(res.username));
        localStorage.setItem('tgsUserIsAdmin', JSON.stringify(res.isAdmin));
        localStorage.setItem('tgsAuthToken', JSON.stringify(res.authToken));
        localStorage.setItem('tgsRefreshToken', JSON.stringify(res.refreshToken));
        this.isLoggedInSubject.next(true);
        return res;
      })); 
  }

  /**
   * Function that handles the logout.
   * Here the localStorage and the user subject are cleared and it will then be navigated to the login page.
   */
  logout() {
    this.api.deleteFilesWhenLogout(this.getUsername()).subscribe();
    localStorage.removeItem('tgsUsername'); 
    localStorage.removeItem('tgsUserIsAdmin');
    localStorage.removeItem('tgsAuthToken');
    localStorage.removeItem('tgsRefreshToken');
    this.isLoggedInSubject.next(null);
    this.gradingDataService.clearStoredGeneralData();
    this.gradingDataService.clearStoredGradingData();
    this.router.navigate(['/login']);
  }

  /**
   * Function that refreshes the auth token of the user based on the existing refresh token.
   * 
   * @returns The refreshed authToken.
   */
  refreshToken() {
    return this.api.refreshAuthToken({refreshToken: this.getRefreshToken(), username: this.getUsername()})
      .pipe(tap((res: any) => {
        localStorage.setItem('tgsAuthToken', JSON.stringify(res.authToken));
        return this.getAuthToken();
      }))
  }

  /**
   * Function to get the username of the current user.
   * 
   * @returns The username.
   */
  getUsername() {
    return JSON.parse(localStorage.getItem('tgsUsername')!);
  }

  /**
   * Function to get if the current user has the role admin.
   * 
   * @returns True if the user is admin, false otherwise.
   */
  isUserAdmin() {
    return JSON.parse(localStorage.getItem('tgsUserIsAdmin')!);
  }

  /**
   * Function to get the current users auth token.
   * 
   * @returns The auth token.
   */
  getAuthToken() {
    return JSON.parse(localStorage.getItem('tgsAuthToken')!);
  }

  /**
   * Function to get the current users refresh token.
   * 
   * @returns The refresh token.
   */
  getRefreshToken() {
    return JSON.parse(localStorage.getItem('tgsRefreshToken')!);
  }
}
