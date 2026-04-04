import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-registre',
  standalone: false,
  templateUrl: './registre.html',
  styleUrl: './registre.css',
})
export class Registre {
  regData = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private readonly KEYCLOAK_URL  = 'http://localhost:8100';
  private readonly REALM         = 'MY2TEK-realm';
  private readonly CLIENT_ID     = 'MY2TEK';
  private readonly CLIENT_SECRET = 'mrSs2wJD3nWOgSSbT8Hzoaz7i3ZwNd15';
  private readonly GATEWAY       = 'http://localhost:8085';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onRegister() {
    this.errorMessage = null;

    // ✅ Frontend validation first
    if (!this.regData.username.trim() || !this.regData.email.trim() || !this.regData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (this.regData.password !== this.regData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.regData.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    this.isLoading = true;
    this.getAdminToken();
  }

  // Step 1 — get admin token from Keycloak (confidential client)
  private getAdminToken() {
    const body = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set('client_id', this.CLIENT_ID)
      .set('client_secret', this.CLIENT_SECRET);

    this.http.post<any>(
      `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
    ).subscribe({
      next: (res) => this.createKeycloakUser(res.access_token),
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erreur d\'authentification client. Vérifiez la config Keycloak.';
        this.cdr.detectChanges();
      }
    });
  }

  // Step 2 — create user in Keycloak via Admin API
  private createKeycloakUser(adminToken: string) {
    const newUser = {
      username:   this.regData.username.trim(),
      email:      this.regData.email.trim(),
      firstName:  this.regData.firstName.trim(),
      lastName:   this.regData.lastName.trim(),
      enabled:    true,
      emailVerified: true,
      credentials: [{
        type: 'password',
        value: this.regData.password,
        temporary: false
      }]
    };

    this.http.post(
      `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users`,
      newUser,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }),
        observe: 'response' // ✅ get full response to check status 201
      }
    ).subscribe({
      next: () => {
        // Step 3 — after Keycloak user created, get a user token to sync to DB
        this.syncToUserMicroservice();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'Un compte avec cet email ou ce nom d\'utilisateur existe déjà.';
        } else if (err.status === 400) {
          this.errorMessage = 'Données invalides. Vérifiez les champs.';
        } else if (err.status === 403) {
          this.errorMessage = 'Accès refusé. Vérifiez les permissions du client Keycloak.';
        } else {
          this.errorMessage = `Erreur (${err.status}). Réessayez.`;
        }
        this.cdr.detectChanges();
      }
    });
  }

  // Step 3 — login with new credentials to get a token, then sync to UserMicroservice
  private syncToUserMicroservice() {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', 'MY2TEK-public')
      .set('username', this.regData.username.trim())
      .set('password', this.regData.password)
      .set('scope', 'openid profile email');

    this.http.post<any>(
      `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
    ).subscribe({
      next: (res) => {
        // ✅ Call /users/sync through gateway with the new user's token
        this.http.post(`${this.GATEWAY}/users/sync`, {}, {
          headers: { Authorization: `Bearer ${res.access_token}` }
        }).subscribe({
          next: () => console.log('User synced to local DB'),
          error: (e) => console.warn('Sync warning (non-blocking):', e)
        });

        // ✅ Show success regardless of sync result
        this.isLoading = false;
        this.successMessage = '🎉 Compte créé avec succès ! Redirection...';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: () => {
        // Keycloak user was created — sync failed but that's ok
        // Sync will happen on first login anyway
        this.isLoading = false;
        this.successMessage = '🎉 Compte créé avec succès ! Redirection...';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 2500);
      }
    });
  }
}