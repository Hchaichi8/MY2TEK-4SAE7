import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Ms-User
import { Login } from './Ms-User/login/login';
import { Registre } from './Ms-User/registre/registre';
import { Profil } from './Ms-User/profil/profil';
import { ForgotPassword } from './Ms-User/forgot-password/forgot-password';
import { ResetPassword } from './Ms-User/reset-password/reset-password';
import { Useradmin } from './Ms-User/Admin/useradmin/useradmin';
import { Dashboard } from './Ms-User/Admin/dashboard/dashboard';

// Ms-Shipping
import { Track } from './Ms-Shipping/track/track';
import { ShippingAdmin } from './Ms-Shipping/Admin/shipping-admin/shipping-admin';
import { CarriersAdmin } from './Ms-Shipping/Admin/carriers-admin/carriers-admin';
import { ShippingStats } from './Ms-Shipping/Admin/shipping-stats/shipping-stats';

const routes: Routes = [
  { path: '', redirectTo: 'Register', pathMatch: 'full' },

  // Auth
  { path: 'login', component: Login },
  { path: 'Register', component: Registre },
  { path: 'Profil', component: Profil },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },

  // Admin - Users
  { path: 'user-admin', component: Useradmin },
  { path: 'dashboard-admin', component: Dashboard },

  // Shipping - Public
  { path: 'track', component: Track },
  { path: 'track/:trackingNumber', component: Track },

  // Shipping - Admin
  { path: 'admin/shipping', component: ShippingAdmin },
  { path: 'admin/carriers', component: CarriersAdmin },
  { path: 'admin/stats', component: ShippingStats },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
