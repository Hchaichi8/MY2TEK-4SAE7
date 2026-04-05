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

    // ✅ Check sessionStorage FIRST — never trigger Keycloak refresh for manual logins
    const sessionToken = sessionStorage.getItem('kc_token');
    if (sessionToken) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${sessionToken}` }
      });
      return next.handle(authReq);
    }

    // ✅ Only call keycloakService if NO sessionStorage token exists (Google/SSO login)
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const authReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;
        return next.handle(authReq);
      })
    );
  }
}