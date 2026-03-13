import { Routes } from '@angular/router';
import { GeneralDataInputComponent } from './components/general-data-input/general-data-input.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { GradingSystemComponent } from './components/grading-system/grading-system.component';
import { ShowGradingComponent } from './components/show-grading/show-grading.component';
import { LoginComponent } from './user/login/login.component';
import { AuthGuard } from './helpers/auth.guard';
import { RegisterComponent } from './user/register/register.component';
import { EditAccountComponent } from './user/edit-account/edit-account.component';

/**
 * File that handles the routes of the application.
 */
export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login page'
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: 'Create new user',
        canActivate: [AuthGuard],
        data: {roles: 'admin'}
    },
    {
        path: 'editAccount',
        component: EditAccountComponent,
        title: 'Edit Account',
        canActivate: [AuthGuard]
    },
    {
        path: 'adminPanel',
        component: AdminPanelComponent,
        title: 'Admin panel',
        canActivate: [AuthGuard],
        data: {roles: 'admin'}
    },
    {
        path: 'gradingSystem',
        component: GradingSystemComponent,
        title: 'Grading system',
        canActivate: [AuthGuard]
    },
    {
        path: 'showGrading',
        component: ShowGradingComponent,
        title: 'Show grading',
        canActivate: [AuthGuard]
    },
    {
        path: 'generalDataInput',
        component: GeneralDataInputComponent,
        title: 'General data input',
        canActivate: [AuthGuard]
    },
    {
        path: '',
        component: GeneralDataInputComponent,
        title: 'General data input',
        canActivate: [AuthGuard]
    },
    // not existing urls will be redirected to the general data page
    {
        path: '**',
        redirectTo: 'generalDataInput'
    }
];
