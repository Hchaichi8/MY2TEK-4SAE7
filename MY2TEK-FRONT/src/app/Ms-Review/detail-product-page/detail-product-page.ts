import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail-product-page',
  standalone: false,
  templateUrl: './detail-product-page.html',
  styleUrl: './detail-product-page.css',
})
export class DetailProductPage implements OnInit {

  productId: string = '5';
  clientId: string = '';
  isLoggedIn: boolean | null = null;
  userData: KeycloakProfile | null = null;
  userInitials = '';
  userDisplayName = '';

  newReview = {
    description: '',
    rating: 5,
    productId: this.productId,
    clientId: '',
    clientName: ''
  };

  reviews: any[] = [];
  isEnhancing = false;
  showForm = false;
  isSubmitting = false;

  private readonly GATEWAY = 'http://localhost:8085';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserFromKeycloak();
    this.loadReviews();
  }

  // ✅ Returns token from sessionStorage OR Keycloak instance — never calls updateToken
  private getToken(): string {
    const session = sessionStorage.getItem('kc_token');
    if (session) return session;
    return this.keycloakService.getKeycloakInstance().token ?? '';
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  async loadUserFromKeycloak() {
    try {
      const kcLoggedIn   = await this.keycloakService.isLoggedIn();
      const sessionToken = sessionStorage.getItem('kc_token');

      if (kcLoggedIn) {
        this.isLoggedIn = true;
        this.userData   = await this.keycloakService.loadUserProfile();

      } else if (sessionToken) {
        this.isLoggedIn = true;
        const kc        = this.keycloakService.getKeycloakInstance();

        if (!kc.authenticated) {
          kc.token         = sessionToken;
          kc.authenticated = true;
          kc.tokenParsed   = this.parseJwt(sessionToken);
          const refresh    = sessionStorage.getItem('kc_refresh_token');
          const idTok      = sessionStorage.getItem('kc_id_token');
          if (refresh) { kc.refreshToken = refresh; kc.refreshTokenParsed = this.parseJwt(refresh); }
          if (idTok)   { kc.idToken = idTok;        kc.idTokenParsed      = this.parseJwt(idTok); }
        }

        const parsed  = kc.tokenParsed as any;
        this.userData = {
          id:        parsed?.sub                ?? '',
          username:  parsed?.preferred_username ?? '',
          email:     parsed?.email              ?? '',
          firstName: parsed?.given_name         ?? '',
          lastName:  parsed?.family_name        ?? '',
        } as KeycloakProfile;

      } else {
        this.isLoggedIn      = false;
        this.clientId        = 'Guest';
        this.userDisplayName = 'Guest';
      }

      if (this.isLoggedIn && this.userData) {
        const kc         = this.keycloakService.getKeycloakInstance();
        this.clientId    = (kc.tokenParsed as any)?.sub ?? this.userData.id ?? 'Unknown';
        const first      = this.userData.firstName ?? '';
        const last       = this.userData.lastName  ?? '';
        this.userDisplayName = `${first} ${last}`.trim() || this.userData.username || 'Utilisateur';
        this.userInitials    = ((first.charAt(0)) + (last.charAt(0))).toUpperCase()
                             || this.userData.username?.charAt(0).toUpperCase() || '?';
      }

      this.newReview.clientId   = this.clientId;
      this.newReview.clientName = this.userDisplayName;
      this.cdr.detectChanges();

    } catch (err) {
      console.error('Error loading user:', err);
      this.isLoggedIn = false;
      this.cdr.detectChanges();
    }
  }

  private parseJwt(token: string): any {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch { return null; }
  }

  toggleReviewForm() {
    if (!this.isLoggedIn) {
      this.keycloakService.login({ redirectUri: window.location.href });
      return;
    }
    this.showForm = !this.showForm;
  }

  enhanceWithAI() {
    if (!this.newReview.description.trim()) return;
    this.isEnhancing = true;

    // ✅ Explicit header — no interceptor dependency
    this.http.post<any>(
      `${this.GATEWAY}/Review/enhance`,
      { text: this.newReview.description, rating: this.newReview.rating },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        this.newReview.description = res.enhancedText;
        this.isEnhancing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur IA:', err);
        this.isEnhancing = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitReview() {
    if (!this.newReview.description.trim()) {
      alert('Veuillez écrire un commentaire.');
      return;
    }
    if (!this.isLoggedIn) {
      this.keycloakService.login({ redirectUri: window.location.href });
      return;
    }
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const token = this.getToken();
    console.log('Submitting with token:', token ? token.substring(0, 60) + '...' : 'NO TOKEN');

    if (!token) {
      alert('Session expirée. Veuillez vous reconnecter.');
      sessionStorage.clear();
      this.isSubmitting = false;
      this.router.navigate(['/login']);
      return;
    }

    const payload = {
      description: this.newReview.description.trim(),
      rating:      this.newReview.rating,
      productId:   this.productId,
      clientId:    this.clientId,
      clientName:  this.userDisplayName
    };

    // ✅ Token sent directly — does NOT go through interceptor's keycloakService.getToken()
    this.http.post(
      `${this.GATEWAY}/Review/AjouterReview`,
      payload,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: () => {
        this.newReview.description = '';
        this.newReview.rating      = 5;
        this.showForm              = false;
        this.isSubmitting          = false;
        this.loadReviews();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err.status, err.error);
        if (err.status === 401) {
          alert('Session expirée. Reconnectez-vous.');
          sessionStorage.clear();
          this.router.navigate(['/login']);
        } else {
          alert(`Erreur ${err.status}.`);
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadReviews() {
    this.http.get<any[]>(`${this.GATEWAY}/Review/GetAllReview`).subscribe({
      next: (data) => {
        this.reviews = data.filter(r => String(r.productId) === this.productId);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Load reviews error:', err)
    });
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}