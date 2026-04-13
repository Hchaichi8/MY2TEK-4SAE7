import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShippingService } from '../Service/shipping';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-track',
  standalone: false,
  templateUrl: './track.html',
  styleUrl: './track.css',
})
export class Track implements OnInit {
  trackingNumber: string = '';
  inputTracking: string = '';
  shipment: any = null;
  errorMessage: string | null = null;
  isLoading = false;

  // Auth
  isLoggedIn: boolean | null = null;
  userData: KeycloakProfile | null = null;
  userInitials = '';

  steps = ['READY_TO_SHIP', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shippingService: ShippingService,
    private keycloakService: KeycloakService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadUser();

    const tn = this.route.snapshot.paramMap.get('trackingNumber');
    if (tn) {
      this.inputTracking = tn;
      this.search();
    }
  }

  private parseJwt(token: string): any {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch { return null; }
  }

  async loadUser() {
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
      }

      if (this.isLoggedIn && this.userData) {
        const first = this.userData.firstName ?? '';
        const last  = this.userData.lastName  ?? '';
        this.userInitials = ((first.charAt(0)) + (last.charAt(0))).toUpperCase()
                          || this.userData.username?.charAt(0).toUpperCase() || '?';
      }

      this.cdr.detectChanges();
    } catch {
      this.isLoggedIn = false;
      this.cdr.detectChanges();
    }
  }

  onLogin()  { this.router.navigate(['/login']); }
  onLogout() { sessionStorage.clear(); this.keycloakService.logout(window.location.origin + '/login'); }
  goToProfile() { this.router.navigate(['/Profil']); }

  search() {
    if (!this.inputTracking.trim()) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.shipment = null;

    this.shippingService.trackShipment(this.inputTracking.trim()).subscribe({
      next: (data) => { this.shipment = data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => {
        this.errorMessage = 'Aucun colis trouvé pour ce numéro de suivi.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStepIndex(): number { return this.steps.indexOf(this.shipment?.status); }

  getStepLabel(step: string): string {
    const labels: any = {
      READY_TO_SHIP: 'Prêt à expédier', SHIPPED: 'Expédié',
      IN_TRANSIT: 'En transit', DELIVERED: 'Livré'
    };
    return labels[step] || step;
  }

  stepIcon(step: string): string {
    const icons: any = {
      READY_TO_SHIP: 'fa-box', SHIPPED: 'fa-shipping-fast',
      IN_TRANSIT: 'fa-truck', DELIVERED: 'fa-check-circle'
    };
    return icons[step] || 'fa-circle';
  }
}