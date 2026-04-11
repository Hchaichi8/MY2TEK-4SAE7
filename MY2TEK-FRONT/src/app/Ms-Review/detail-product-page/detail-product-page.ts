import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { ActivatedRoute, Router } from '@angular/router';
import { PanierService } from '../../Ms-Commandes/service/panier.service'; // adjust path

@Component({
  selector: 'app-detail-product-page',
  standalone: false,
  templateUrl: './detail-product-page.html',
  styleUrl: './detail-product-page.css',
})
export class DetailProductPage implements OnInit {

  productId: string = '';
  product: any = null;
  isLoadingProduct = true;
  addedToCart = false;  // ← for feedback animation

  clientId: string = '';
  isLoggedIn: boolean | null = null;
  userData: KeycloakProfile | null = null;
  userInitials = '';
  userDisplayName = '';

  newReview = { description: '', rating: 5, productId: '', clientId: '', clientName: '' };
  reviews: any[] = [];
  isEnhancing = false;
  showForm = false;
  isSubmitting = false;
  quantity = 1;

  private readonly GATEWAY = 'http://localhost:8085';
  private readonly PRODUCT_API = 'http://localhost:8086/products';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private panierService: PanierService  // ← inject
  ) {}

  async ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id') ?? '';
    this.newReview.productId = this.productId;
    this.loadProduct();
    this.loadReviews();
    await this.loadUserFromKeycloak();
  }

  loadProduct() {
    this.isLoadingProduct = true;
    this.http.get<any>(`${this.PRODUCT_API}/${this.productId}`).subscribe({
      next: (data) => { this.product = data; this.isLoadingProduct = false; this.cdr.detectChanges(); },
      error: () => { this.isLoadingProduct = false; this.cdr.detectChanges(); }
    });
  }

  // ── Cart ────────────────────────────────────────────────────────────────────

 ajouterAuPanier() {
  if (!this.product || this.product.stockQuantity === 0) return;

  this.panierService.ajouter(
    {
      produitId: String(this.product.id),
      nom:       this.product.name,
      prix:      this.product.price,
      image:     this.product.imageUrl || '',
      categorie: this.product.category || ''
      
    },
    this.quantity 
  );

  this.addedToCart = true;
  setTimeout(() => { this.addedToCart = false; this.cdr.detectChanges(); }, 2000);
  this.cdr.detectChanges();
}

  get cartCount(): number { return this.panierService.count; }

  goToPanier() { this.router.navigate(['/panier']); }

  incrementQty() {
    if (this.product && this.quantity < this.product.stockQuantity) this.quantity++;
  }
  decrementQty() { if (this.quantity > 1) this.quantity--; }

  // ── Auth (unchanged) ────────────────────────────────────────────────────────

  private getToken(): string {
    const session = sessionStorage.getItem('kc_token');
    if (session) return session;
    return this.keycloakService.getKeycloakInstance().token ?? '';
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` });
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
        const kc = this.keycloakService.getKeycloakInstance();
        if (!kc.authenticated) {
          kc.token = sessionToken; kc.authenticated = true;
          kc.tokenParsed = this.parseJwt(sessionToken);
          const refresh = sessionStorage.getItem('kc_refresh_token');
          const idTok   = sessionStorage.getItem('kc_id_token');
          if (refresh) { kc.refreshToken = refresh; kc.refreshTokenParsed = this.parseJwt(refresh); }
          if (idTok)   { kc.idToken = idTok; kc.idTokenParsed = this.parseJwt(idTok); }
        }
        const parsed = kc.tokenParsed as any;
        this.userData = {
          id: parsed?.sub ?? '', username: parsed?.preferred_username ?? '',
          email: parsed?.email ?? '', firstName: parsed?.given_name ?? '',
          lastName: parsed?.family_name ?? '',
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
    } catch {
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
    if (!this.isLoggedIn) { this.keycloakService.login({ redirectUri: window.location.href }); return; }
    this.showForm = !this.showForm;
  }

  enhanceWithAI() {
    if (!this.newReview.description.trim()) return;
    this.isEnhancing = true;
    this.http.post<any>(`${this.GATEWAY}/Review/enhance`,
      { text: this.newReview.description, rating: this.newReview.rating },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => { this.newReview.description = res.enhancedText; this.isEnhancing = false; this.cdr.detectChanges(); },
      error: () => { this.isEnhancing = false; this.cdr.detectChanges(); }
    });
  }

  submitReview() {
    if (!this.newReview.description.trim()) { alert('Veuillez écrire un commentaire.'); return; }
    if (!this.isLoggedIn) { this.keycloakService.login({ redirectUri: window.location.href }); return; }
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const token = this.getToken();
    if (!token) { alert('Session expirée.'); sessionStorage.clear(); this.router.navigate(['/login']); return; }

    const payload = { description: this.newReview.description.trim(), rating: this.newReview.rating,
      productId: this.productId, clientId: this.clientId, clientName: this.userDisplayName };

    this.http.post(`${this.GATEWAY}/Review/AjouterReview`, payload,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: () => {
        this.newReview.description = ''; this.newReview.rating = 5;
        this.showForm = false; this.isSubmitting = false;
        this.loadReviews(); this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) { sessionStorage.clear(); this.router.navigate(['/login']); }
        else { alert(`Erreur ${err.status}.`); }
        this.isSubmitting = false; this.cdr.detectChanges();
      }
    });
  }

  loadReviews() {
    this.http.get<any[]>(`${this.GATEWAY}/Review/GetAllReview`).subscribe({
      next: (data) => { this.reviews = data.filter(r => String(r.productId) === this.productId); this.cdr.detectChanges(); },
      error: (err) => console.error('Load reviews error:', err)
    });
  }

  getStars(rating: number): number[] { return Array(rating).fill(0); }
}