import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  private readonly KEYCLOAK_URL = 'http://localhost:8100';
  private readonly REALM        = 'MY2TEK-realm';
  private readonly CLIENT_ID    = 'MY2TEK';
  private readonly CLIENT_SECRET = 'mrSs2wJD3nWOgSSbT8Hzoaz7i3ZwNd15';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.email.trim()) {
      this.errorMessage = 'Veuillez entrer votre adresse email.';
      return;
    }

    this.isLoading = true;

    // Step 1 — get admin token
    this.getAdminToken().then(token => {
      if (!token) {
        this.isLoading = false;
        this.errorMessage = 'Erreur de connexion au serveur.';
        this.cdr.detectChanges();
        return;
      }

      // Step 2 — find user by email
      this.getUserByEmail(token, this.email).then(userId => {
        if (!userId) {
          this.isLoading = false;
          // ✅ Don't reveal if email exists or not — security best practice
          this.successMessage = 'Si cet email existe, un lien de réinitialisation a été envoyé.';
          this.email = '';
          this.cdr.detectChanges();
          return;
        }

        // Step 3 — send reset password email
        this.sendResetEmail(token, userId).then(() => {
          this.isLoading = false;
          this.successMessage = 'Si cet email existe, un lien de réinitialisation a été envoyé.';
          this.email = '';
          this.cdr.detectChanges();
        }).catch(() => {
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de l\'envoi de l\'email.';
          this.cdr.detectChanges();
        });
      });
    });
  }

  // ✅ Get admin token via client_credentials
  private getAdminToken(): Promise<string> {
    const body = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set('client_id', this.CLIENT_ID)
      .set('client_secret', this.CLIENT_SECRET);

    return this.http.post<any>(
      `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
    ).toPromise()
      .then(res => res?.access_token ?? '')
      .catch(() => '');
  }

  // ✅ Find user by email in Keycloak
  private getUserByEmail(token: string, email: string): Promise<string | null> {
    return this.http.get<any[]>(
      `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users?email=${encodeURIComponent(email)}&exact=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).toPromise()
      .then(users => users && users.length > 0 ? users[0].id : null)
      .catch(() => null);
  }

private sendResetEmail(token: string, userId: string): Promise<void> {
  const params = `?redirect_uri=${encodeURIComponent('http://localhost:4200/login')}&client_id=MY2TEK`;

  return this.http.put(
    `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users/${userId}/execute-actions-email${params}`,
    ['UPDATE_PASSWORD'],
    {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    }
  ).toPromise()
    .then(() => {
      console.log('✅ Reset email sent successfully');
    })
    .catch((err) => {
      console.error('❌ Reset email error:', err.status, err.error);
      throw err;
    });
}
}