import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { ProductService } from '../../Ms-Product/Service/product'; // adjust path if needed

@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  userData: KeycloakProfile | null = null;
  isLoggedIn: boolean | null = null;
  userInitials = '';
  products: any[] = [];
  isLoadingProducts = true;

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private productService: ProductService
  ) {}

  async ngOnInit() {
    // Load products immediately, don't wait for auth
    this.loadFeaturedProducts();

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
          id:        parsed?.sub ?? '',
          username:  parsed?.preferred_username ?? '',
          email:     parsed?.email ?? '',
          firstName: parsed?.given_name ?? '',
          lastName:  parsed?.family_name ?? '',
        } as KeycloakProfile;
      } else {
        this.isLoggedIn = false;
      }

      if (this.isLoggedIn && this.userData) {
        const first = this.userData.firstName?.charAt(0) ?? '';
        const last  = this.userData.lastName?.charAt(0) ?? '';
        this.userInitials = (first + last).toUpperCase() ||
                             this.userData.username?.charAt(0).toUpperCase() || '?';
      }

      this.cdr.detectChanges();
    } catch {
      this.isLoggedIn = false;
      this.cdr.detectChanges();
    }
  }

  loadFeaturedProducts() {
    this.isLoadingProducts = true;
    // Fetch first 6 products sorted by newest
    this.productService.getAllProducts(0, 6, 'createdAt,desc').subscribe({
      next: (data) => {
        this.products = data.content;
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToDetail(id: number) {
    this.router.navigate(['/detail-product', id]);
  }

  private parseJwt(token: string): any {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch { return null; }
  }

  goToProfile() { this.router.navigate(['/Profil']); }

  onLogout() {
    sessionStorage.clear();
    this.keycloakService.logout(window.location.origin + '/login');
  }

  onLogin() { this.router.navigate(['/login']); }
}