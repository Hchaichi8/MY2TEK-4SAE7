import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// Ms-User
import { Login } from './Ms-User/login/login';
import { Registre } from './Ms-User/registre/registre';
import { Profil } from './Ms-User/profil/profil';
import { ForgotPassword } from './Ms-User/forgot-password/forgot-password';
import { ResetPassword } from './Ms-User/reset-password/reset-password';
import { Dashboard } from './Ms-User/Admin/dashboard/dashboard';
import { Useradmin } from './Ms-User/Admin/useradmin/useradmin';

// Ms-Shipping
import { Track } from './Ms-Shipping/track/track';
import { ShippingAdmin } from './Ms-Shipping/Admin/shipping-admin/shipping-admin';
import { CarriersAdmin } from './Ms-Shipping/Admin/carriers-admin/carriers-admin';
import { ShippingStats } from './Ms-Shipping/Admin/shipping-stats/shipping-stats';
import { StatusCountPipe } from './Ms-Shipping/pipes/status-count.pipe';


import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  GoogleSigninButtonDirective,
  SOCIAL_AUTH_CONFIG,
} from '@abacritt/angularx-social-login';

@NgModule({
  declarations: [
    App,
    // Ms-User
    Login,
    Registre,
    Profil,
    ForgotPassword,
    ResetPassword,
    Dashboard,
    Useradmin,
    // Ms-Shipping
    Track,
    ShippingAdmin,
    CarriersAdmin,
    ShippingStats,
    StatusCountPipe,
  ],
  imports: [
    BrowserModule,
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
