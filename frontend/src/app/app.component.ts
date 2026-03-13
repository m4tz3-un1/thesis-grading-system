import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterOutlet} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth-service.service';
import { GradingDataService } from './services/grading-data.service';

/**
 * Component that is the startpoint of the application. Inside it the navigation is handled.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],  
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  user: any;
  isLoggedIn = false;

  /**
   * The constructor of the component. Here are also given all needed services to inject as parameters.
   * Also it is subscribe to the loggedin subject.
   * 
   * @param authService Service that handles the user
   * @param router Service to navigate between pages.
   * @param gradingDataService Service that handles the grading data.
   */
  constructor(public authService: AuthService, 
    public router: Router, 
    private gradingDataService: GradingDataService
  ) {
    this.authService.isLoggedIn.subscribe(x => this.isLoggedIn = x)
  }

  /**
   * Function that navigates to the home page.
   */
  navigateToHome() {
    if (this.router.url === '/generalDataInput') {
      location.reload();
    }
    else {
      this.router.navigate(['/generalDataInput']);
    }
  }

  /**
   * Function that clears the local storage from existing thesis data and navigates the the home page.
   */
  gradeNewThesis() {
    if (confirm('Do you want to grading a new thesis? The existing data will be deleted!')) {
      this.gradingDataService.clearStoredGeneralData();
      this.gradingDataService.clearStoredGradingData();
      this.navigateToHome();
    }
  }

  /**
   * Function that navigates to the admin panel.
   */
  navigateToAdmin() {
    if (this.router.url === '/adminPanel') {
      location.reload();
    }
    else {
      this.router.navigate(['/adminPanel']);
    }
  }

  /**
   * Function for calling the account page to edit the user details.
   */
  editUserData() {
    if (this.router.url === '/editAccount') {
      location.reload();
    }
    else {
      this.router.navigate(['/editAccount']);
    }
  }

  /**
   * Function to handle the logout.
   */
  logout() {
    if (confirm('Do you want to logout?')){
      this.authService.logout();
    }
  }
}