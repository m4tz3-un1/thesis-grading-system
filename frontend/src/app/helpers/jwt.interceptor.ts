import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service.service';

/**
 * This interceptor intercepts all requests to the backend and adds the jwt token of the user to the request header.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    /**
     * The constructor of the interceptor. Here are also given all needed services to inject as parameters.
     * 
     * @param authService The service that handles the user.
     */
    constructor(private authService: AuthService) { }

    /**
     * This functions handels the interception. The function adds the jwt token
     * of the user saved in the localStorage to the request header.
     * 
     * @param request The request to the backend.
     * @param next Function that calls the next function.
     * @returns The handle of the next function.
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isLoggedIn = this.authService.isUserLoggedIn;
        if (isLoggedIn) {
            request = this.addToken(request, this.authService.getAuthToken());
        }

        return next.handle(request).pipe(
            catchError(err => {
                if (err instanceof HttpErrorResponse && err.status === 403) {
                    return this.handleForbiddenError(request, next);
                }
                else {
                    return throwError(err);
                }
            })
        );
    }

    /**
     * This function adds the token to the request header.
     * 
     * @param request The request without a token added.
     * @param token The token of the user.
     * @returns The header of the request with the added token.
     */
    addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    /**
     * If the request with the existing auth token fails the token will be refreshed and the request will be sent with a new auth token.
     * 
     * @param request The request to the backend.
     * @param next A function to call the next function.
     * @returns The request with an updated auth token or an error.
     */
    handleForbiddenError(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
                switchMap((authData: any) => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(authData.authToken);
                    return next.handle(this.addToken(request, authData.authToken));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    alert('A problem with authentication occured and you are logged out. Please try again. '
                        +'If the problem occurs again please contact the admin team.')
                    return throwError(err);
                })
            );
        }
        else {
            return this.refreshTokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(authToken => {
                    return next.handle(this.addToken(request, authToken));
                })
            )
        }
    }
}