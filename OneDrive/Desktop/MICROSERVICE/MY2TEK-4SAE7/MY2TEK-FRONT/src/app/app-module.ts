import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './Ms-User/login/login';
import { Registre } from './Ms-User/registre/registre';
import { Profil } from './Ms-User/profil/profil';
import { ForgotPassword } from './Ms-User/forgot-password/forgot-password';
import { ResetPassword } from './Ms-User/reset-password/reset-password';

import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  GoogleSigninButtonDirective,
  SOCIAL_AUTH_CONFIG,
} from '@abacritt/angularx-social-login';
import { Dashboard } from './Ms-User/Admin/dashboard/dashboard';
import { Useradmin } from './Ms-User/Admin/useradmin/useradmin';
import { HomePage } from './Ms-Review/home-page/home-page';
import { DetailProductPage } from './Ms-Review/detail-product-page/detail-product-page';
import { CommandesList } from './Ms-Commandes/commandes-list/commandes-list';
import { CreerCommande } from './Ms-Commandes/creer-commande/creer-commande';
import { MesCommandes } from './Ms-Commandes/mes-commandes/mes-commandes';
import { AdminCommandes } from './Ms-Commandes/admin-commandes/admin-commandes';
import { CommandesByStatutPipe } from './Ms-Commandes/pipes/commandes-by-statut.pipe';
import { Panier } from './Ms-Commandes/panier/panier';

@NgModule({
  declarations: [
    App,
    Login,
    Registre,
    Profil,
    ForgotPassword,
    ResetPassword,
    Dashboard,
    Useradmin,
    HomePage,
    DetailProductPage,
    CommandesList,
    CreerCommande,
    MesCommandes,
    AdminCommandes,
    CommandesByStatutPipe,
    Panier,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SocialLoginModule,
    GoogleSigninButtonDirective,
  ],
  providers: [
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '1082853601475-srb651krqb3hrofil6or420qsuhi03o8.apps.googleusercontent.com',
            ),
          },
        ],
        onError: (err: any) => {
          console.error('SocialAuth Error:', err);
        },
      } as SocialAuthServiceConfig,
    },
  ],
  bootstrap: [App],
})
export class AppModule {}
