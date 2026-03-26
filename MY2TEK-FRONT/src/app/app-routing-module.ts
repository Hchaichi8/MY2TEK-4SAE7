import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './Ms-User/login/login';
import { Registre } from './Ms-User/registre/registre';
import { Profil } from './Ms-User/profil/profil';
import { ForgotPassword } from './Ms-User/forgot-password/forgot-password';
import { ResetPassword } from './Ms-User/reset-password/reset-password';
import { Useradmin } from './Ms-User/Admin/useradmin/useradmin';
import { Dashboard } from './Ms-User/Admin/dashboard/dashboard';

const routes: Routes = [

{ path: '', redirectTo: 'Register', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'Register', component: Registre },
  { path: 'Profil', component: Profil },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },


  { path: 'user-admin', component: Useradmin },
    { path: 'dashboard-admin', component: Dashboard }

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
