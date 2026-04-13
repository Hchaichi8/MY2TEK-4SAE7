import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PanierItem, PanierService } from '../service/panier.service';
import { CommandeService } from '../service/commande.service';
import { KeycloakService } from 'keycloak-angular';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-panier',
  standalone: false,
  templateUrl: './panier.html',
  styleUrl: './panier.css'
})
export class Panier implements OnInit {
  items: PanierItem[] = [];
  userData: any = null;
  clientId: string = '';
  step: 'panier' | 'confirmation' | 'succes' = 'panier';
  loading = false;
  errorMsg = '';

  constructor(
    private panierService: PanierService,
    private commandeService: CommandeService,
    private keycloakService: KeycloakService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Subscribe to cart items
    this.panierService.items$.subscribe(items => {
      this.items = items;
      this.cdr.detectChanges();
    });

    // Load user using the same pattern as your other components
    await this.loadUser();
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
        const profile  = await this.keycloakService.loadUserProfile();
        const kc       = this.keycloakService.getKeycloakInstance();
        this.clientId  = (kc.tokenParsed as any)?.sub ?? '';
        this.userData  = {
          firstName: profile.firstName,
          lastName:  profile.lastName,
          email:     profile.email,
          sub:       this.clientId
        };

      } else if (sessionToken) {
        const parsed   = this.parseJwt(sessionToken);
        this.clientId  = parsed?.sub ?? '';
        this.userData  = {
          firstName: parsed?.given_name  ?? '',
          lastName:  parsed?.family_name ?? '',
          email:     parsed?.email       ?? '',
          sub:       this.clientId
        };

      } else {
        // Not logged in — redirect to login when they try to checkout
        this.userData = null;
        this.clientId = '';
      }

      this.cdr.detectChanges();
    } catch (err) {
      console.error('Auth error:', err);
      this.userData = null;
    }
  }

  get total(): number { return this.panierService.total; }
  get count(): number { return this.panierService.count; }

  modifier(produitId: string, delta: number) {
    const item = this.items.find(i => i.produitId === produitId);
    if (item) this.panierService.modifier(produitId, item.quantite + delta);
  }

  supprimer(produitId: string) { this.panierService.supprimer(produitId); }

  allerConfirmation() {
    if (!this.clientId) { this.router.navigate(['/login']); return; }
    this.step = 'confirmation';
  }

  confirmerCommandes() {
    if (!this.clientId) { this.router.navigate(['/login']); return; }
    if (this.loading) return;

    this.loading = true;
    this.errorMsg = '';

    // Use forkJoin to send all orders in parallel and wait for ALL to complete
    const requests = this.items.map(item =>
      this.commandeService.creerCommande({
        clientId:     this.clientId,
        produitId:    item.produitId,
        prixSnapshot: item.prix,
        quantite:     item.quantite
      })
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.panierService.vider();
        this.loading = false;
        this.step = 'succes';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.error || 'Erreur lors de la commande. Veuillez réessayer.';
        this.cdr.detectChanges();
      }
    });
  }

  voirMesCommandes() { this.router.navigate(['/mes-commandes']); }
  continuerAchats()  { this.router.navigate(['/home']); }
}