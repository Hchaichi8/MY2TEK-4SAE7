import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private keycloakService: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Only intercept gateway calls
    if (!req.url.includes('localhost:8085')) {
      return next.handle(req);
    }

    const getToken = async (): Promise<string> => {
      // ✅ Check sessionStorage FIRST (manual login)
      const sessionToken = sessionStorage.getItem('kc_token');
      if (sessionToken) return sessionToken;

      // ✅ Then try Keycloak SSO (Google login)
      try {
        const loggedIn = await this.keycloakService.isLoggedIn();
        if (loggedIn) return await this.keycloakService.getToken();
      } catch {}

      return '';
    };

    return from(getToken()).pipe(
      switchMap(token => {
        const authReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;
        return next.handle(authReq);
      })
    );
  }
}