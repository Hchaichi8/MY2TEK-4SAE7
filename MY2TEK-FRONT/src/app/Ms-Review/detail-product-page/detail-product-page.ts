import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-detail-product-page',
  standalone: false,
  templateUrl: './detail-product-page.html',
  styleUrl: './detail-product-page.css',
})
export class DetailProductPage implements OnInit {

  productId: string = '5';
  clientId: string = '';

  // ✅ Start as null (loading state) instead of false
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

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadUserFromKeycloak();
    this.loadReviews();
  }

 async loadUserFromKeycloak() {
  try {
    const kcLoggedIn = await this.keycloakService.isLoggedIn();
    const sessionToken = sessionStorage.getItem('kc_token');

    if (kcLoggedIn) {
      this.isLoggedIn = true;
      this.userData = await this.keycloakService.loadUserProfile();

    } else if (sessionToken) {
      this.isLoggedIn = true;

      const kc = this.keycloakService.getKeycloakInstance();
      if (!kc.authenticated) {
        kc.token = sessionToken;
        kc.authenticated = true;
        kc.tokenParsed = this.parseJwt(sessionToken);

        const refreshToken = sessionStorage.getItem('kc_refresh_token');
        const idToken = sessionStorage.getItem('kc_id_token');
        if (refreshToken) { kc.refreshToken = refreshToken; kc.refreshTokenParsed = this.parseJwt(refreshToken); }
        if (idToken) { kc.idToken = idToken; kc.idTokenParsed = this.parseJwt(idToken); }
      }

      const parsed = kc.tokenParsed as any;
      this.userData = {
        id:        parsed?.sub                 ?? '',
        username:  parsed?.preferred_username  ?? '',
        email:     parsed?.email               ?? '',
        firstName: parsed?.given_name          ?? '',
        lastName:  parsed?.family_name         ?? '',
      } as KeycloakProfile;

    } else {
      this.isLoggedIn = false;
      this.clientId = 'Guest';
      this.userDisplayName = 'Guest';
    }

    if (this.isLoggedIn && this.userData) {
      const kc = this.keycloakService.getKeycloakInstance();
      this.clientId = (kc.tokenParsed as any)?.sub ?? this.userData.id ?? 'Unknown';

      const first = this.userData.firstName ?? '';
      const last  = this.userData.lastName  ?? '';
      this.userDisplayName = `${first} ${last}`.trim() || this.userData.username || 'Utilisateur';
      this.userInitials = ((first.charAt(0)) + (last.charAt(0))).toUpperCase()
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
    if (!this.newReview.description) return;
    this.isEnhancing = true;

    this.http.post('http://localhost:8085/Review/enhance', {
      text: this.newReview.description,
      rating: this.newReview.rating
    }).subscribe({
      next: (res: any) => {
        this.newReview.description = res.enhancedText;
        this.isEnhancing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur IA:', err);
        this.isEnhancing = false;
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

    // ✅ Prevent double submission
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    // Always ensure IDs are fresh
    this.newReview.productId  = this.productId;
    this.newReview.clientId   = this.clientId;
    this.newReview.clientName = this.userDisplayName;

    this.http.post('http://localhost:8085/Review/AjouterReview', this.newReview).subscribe({
      next: () => {
        this.loadReviews();
        this.newReview.description = '';
        this.newReview.rating = 5;
        this.showForm = false;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors de la publication:', err);
        alert('Erreur de publication. Vérifie la console.');
        this.isSubmitting = false;
      }
    });
  }

  loadReviews() {
    this.http.get<any[]>('http://localhost:8085/Review/GetAllReview').subscribe({
      next: (data) => {
        this.reviews = data.filter(r => String(r.productId) === this.productId);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur de chargement des avis:', err)
    });
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}