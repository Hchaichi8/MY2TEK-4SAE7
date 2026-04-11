import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './Ms-User/login/login';
import { Registre } from './Ms-User/registre/registre';
import { Profil } from './Ms-User/profil/profil';
import { ForgotPassword } from './Ms-User/forgot-password/forgot-password';
import { ResetPassword } from './Ms-User/reset-password/reset-password';
import { Useradmin } from './Ms-User/Admin/useradmin/useradmin';
import { Dashboard } from './Ms-User/Admin/dashboard/dashboard';
import { DetailProductPage } from './Ms-Review/detail-product-page/detail-product-page';
import { HomePage } from './Ms-Review/home-page/home-page';
import { CommandesList } from './Ms-Commandes/commandes-list/commandes-list';
import { CreerCommande } from './Ms-Commandes/creer-commande/creer-commande';
import { MesCommandes } from './Ms-Commandes/mes-commandes/mes-commandes';
import { AdminCommandes } from './Ms-Commandes/admin-commandes/admin-commandes';
import { Panier } from './Ms-Commandes/panier/panier';

const routes: Routes = [
  { path: '', redirectTo: 'Register', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'Register', component: Registre },
  { path: 'Profil', component: Profil },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'detail-product', component: DetailProductPage },
  { path: 'home', component: HomePage },
  { path: 'panier', component: Panier },
  { path: 'commandes', component: CommandesList },
  { path: 'commandes/creer', component: CreerCommande },
  { path: 'mes-commandes', component: MesCommandes },
  { path: 'admin/commandes', component: AdminCommandes },
  { path: 'user-admin', component: Useradmin },
  { path: 'dashboard-admin', component: Dashboard }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
