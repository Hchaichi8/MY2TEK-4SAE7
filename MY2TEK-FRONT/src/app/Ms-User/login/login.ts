import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginData = { email: '', password: '' };
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  private readonly GATEWAY = 'http://localhost:8085';
  private readonly KEYCLOAK = 'http://localhost:8100/realms/MY2TEK-realm';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private keycloakService: KeycloakService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    if (isLoggedIn) this.router.navigate(['/Profil']);
  }

  onLogin() {
    this.errorMessage = null;
    this.isLoading = true;

    if (this.loginData.email === 'admin' && this.loginData.password === 'my2tekadmin88') {
      this.isLoading = false;
      this.successMessage = 'Accès Admin autorisé...';
      this.cdr.detectChanges();
      setTimeout(() => this.router.navigate(['user-admin']), 1000);
      return;
    }

    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', 'MY2TEK-public')
      .set('username', this.loginData.email)
      .set('password', this.loginData.password)
      .set('scope', 'openid profile email');

    this.http.post<any>(
      `${this.KEYCLOAK}/protocol/openid-connect/token`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
    ).subscribe({
      next: (res) => {
        // Store tokens
        sessionStorage.setItem('kc_token', res.access_token);
        sessionStorage.setItem('kc_refresh_token', res.refresh_token);
        sessionStorage.setItem('kc_id_token', res.id_token ?? '');

        // Inject into Keycloak instance so guards work
        const kc = this.keycloakService.getKeycloakInstance();
        kc.token = res.access_token;
        kc.refreshToken = res.refresh_token;
        kc.idToken = res.id_token;
        kc.authenticated = true;
        kc.tokenParsed = this.parseJwt(res.access_token);
        kc.refreshTokenParsed = this.parseJwt(res.refresh_token);
        kc.idTokenParsed = this.parseJwt(res.id_token);

        // Sync user to local DB through Gateway
        this.http.post(`${this.GATEWAY}/users/sync`, {}, {
          headers: { Authorization: `Bearer ${res.access_token}` }
        }).subscribe({ error: (e) => console.warn('Sync failed:', e) });

        this.isLoading = false;
        this.successMessage = 'Connexion réussie ! Redirection...';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/Profil']), 1000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.status === 0
          ? 'Impossible de contacter le serveur Keycloak.'
          : 'Email ou mot de passe incorrect.';
        this.cdr.detectChanges();
      }
    });
  }

  private parseJwt(token: string): any {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch { return null; }
  }

  loginWithGoogle() {
    this.keycloakService.login({
      idpHint: 'google',
      redirectUri: window.location.origin + '/Profil'
    });
  }
}