import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './Ms-User/login/login';
import { Registre } from './Ms-User/registre/registre';
import { Profil } from './Ms-User/profil/profil';
import { ForgotPassword } from './Ms-User/forgot-password/forgot-password';
import { ResetPassword } from './Ms-User/reset-password/reset-password';

// Keycloak Imports
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

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

// 1. Keycloak Initialization Function
function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8100',  
        realm: 'MY2TEK-realm',      
        clientId: 'MY2TEK-public'     
      },
      initOptions: {
        onLoad: 'check-sso',              
        silentCheckSsoRedirectUri:
           window.location.origin + '/silent-check-sso.html'      },
      enableBearerInterceptor: true,       
      bearerPrefix: 'Bearer',
    });
}

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SocialLoginModule,
    GoogleSigninButtonDirective,
    KeycloakAngularModule, 
  ],
  providers: [
    
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
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