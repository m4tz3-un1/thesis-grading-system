import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth-service.service';

/**
 * This guard protects the routes where this is necessary.
 * Routes that are flagged with the canActivate flag will only accessed if all 
 * requirements are fulfilled. This is for most routes a loggedin user.
 * Some routes are additional only accessible for users with admin privileges.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    /**
     * The constructor of the guard. Here are also given all needed services to inject as parameters.
     * 
     * @param router Service that enables navigation between pages.
     * @param authService The service for handling the user and its authentication.
     */
    constructor(
        private router: Router, 
        private authService: AuthService
    ) { }

    /**
     * This functions checks if protected routes are allowed to accessed by the user.
     * Depending on the outcome the user will be navigated to the requested route,
     * the home route (in this case the generalDataInput) or the login page.
     * 
     * @param route The route which should be accessed.
     * @returns True if the route is allowed to be accessed by the user and false otherwise.
     */
    canActivate(route: ActivatedRouteSnapshot) {
        const isLoggedIn = this.authService.isUserLoggedIn;
        if (isLoggedIn) {
            if (route.data['roles'] === 'admin' && !this.authService.isUserAdmin()) {
                this.router.navigate(['/']);
                return false;
            }
            return true;
        }

        // Not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }
}