import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Commande, CommandeService } from '../service/commande.service';
import { KeycloakService } from 'keycloak-angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mes-commandes',
  standalone: false,
  templateUrl: './mes-commandes.html',
  styleUrl: './mes-commandes.css'
})
export class MesCommandes implements OnInit {
  userData: any = null;
  clientId: string = '';
  commandes: Commande[] = [];
  filtered: Commande[] = [];
  loading = false;
  activeTab: 'liste' | 'nouvelle' = 'liste';
  searchTerm = '';
  filterStatut = '';

  nouvelleCommande: Commande = { clientId: '', produitId: '', prixSnapshot: 0, quantite: 1 };
  submitLoading = false;
  successMsg = '';
  errorMsg = '';

  selectedCommande: Commande | null = null;
  commandeEnModification: Commande | null = null;
  modifLoading = false;
  modifSuccess = false;
  modifError = '';

  // ── Livraison modal ────────────────────────────────────────────────────────
  livraisonCommande: Commande | null = null;
  livraisonLoading = false;
  livraisonSuccess = false;
  livraisonError = '';
  livraisonTracking = '';
  livraisonForm = {
    recipientName: '',
    recipientEmail: '',
    destination: '',
    weightKg: 1,
    widthCm: 20,
    heightCm: 15,
    lengthCm: 30
  };

  private readonly SHIPPING_API = 'http://localhost:8082';
  private readonly statutOrder = ['CREATED', 'VALIDATED', 'SHIPPED', 'DELIVERED'];

  constructor(
    private commandeService: CommandeService,
    private keycloakService: KeycloakService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    await this.loadUser();
    if (!this.clientId) { this.router.navigate(['/login']); return; }
    this.loadCommandes();
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
        const profile = await this.keycloakService.loadUserProfile();
        const kc      = this.keycloakService.getKeycloakInstance();
        this.clientId = (kc.tokenParsed as any)?.sub ?? '';
        this.userData = {
          firstName: profile.firstName,
          lastName:  profile.lastName,
          email:     profile.email,
          sub:       this.clientId
        };
      } else if (sessionToken) {
        const parsed  = this.parseJwt(sessionToken);
        this.clientId = parsed?.sub ?? '';
        this.userData = {
          firstName: parsed?.given_name  ?? '',
          lastName:  parsed?.family_name ?? '',
          email:     parsed?.email       ?? '',
          sub:       this.clientId
        };
      } else {
        this.clientId = '';
        this.userData = null;
      }
      this.cdr.detectChanges();
    } catch {
      this.clientId = '';
      this.userData = null;
    }
  }

  loadCommandes() {
    this.loading = true;
    this.commandeService.getCommandesByClient(this.clientId).subscribe({
      next: (data) => {
        this.commandes = data;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter() {
    this.filtered = this.commandes.filter(c => {
      const matchSearch = !this.searchTerm ||
        c.produitId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        String(c.id).includes(this.searchTerm);
      const matchStatut = !this.filterStatut || c.statut === this.filterStatut;
      return matchSearch && matchStatut;
    });
  }

  countByStatut(s: string): number {
    return this.commandes.filter(c => c.statut === s).length;
  }

  get totalDepense(): number {
    return this.commandes.filter(c => c.statut !== 'CANCELLED')
      .reduce((sum, c) => sum + c.prixSnapshot * c.quantite, 0);
  }

  getProductImage(produitId: string): string {
    return 'https://via.placeholder.com/300x200?text=Produit+' + produitId;
  }
  getProductName(produitId: string): string { return 'Produit #' + produitId; }
  getProductCategory(produitId: string): string { return 'Catégorie'; }

  getStatutLabel(s?: string): string {
    const m: Record<string, string> = {
      CREATED: 'En attente', VALIDATED: 'Validée',
      SHIPPED: 'Expédiée',  DELIVERED: 'Livrée', CANCELLED: 'Annulée'
    };
    return s ? (m[s] || s) : '';
  }

  isStepDone(current?: string, step?: string): boolean {
    if (!current || !step) return false;
    return this.statutOrder.indexOf(current) >= this.statutOrder.indexOf(step);
  }

  canRequestLivraison(c: Commande): boolean {
    return c.statut === 'VALIDATED';
  }

  voirDetail(c: Commande) { this.selectedCommande = { ...c }; }
  fermerDetail() { this.selectedCommande = null; }

  ouvrirModification(c: Commande) {
    this.commandeEnModification = { ...c };
    this.modifSuccess = false;
    this.modifError = '';
  }

  fermerModification() {
    this.commandeEnModification = null;
    if (this.modifSuccess) this.loadCommandes();
  }

  sauvegarderModification() {
    if (!this.commandeEnModification?.id) return;
    this.modifLoading = true;
    this.modifError = '';
    const payload = {
      produitId:    this.commandeEnModification.produitId,
      quantite:     Number(this.commandeEnModification.quantite),
      prixSnapshot: Number(this.commandeEnModification.prixSnapshot),
      clientId:     this.commandeEnModification.clientId
    };
    this.commandeService.updateCommande(this.commandeEnModification.id, payload).subscribe({
      next: (updated) => {
        this.modifLoading = false;
        this.modifSuccess = true;
        const idx = this.commandes.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.commandes[idx] = updated;
        this.applyFilter();
        this.cdr.detectChanges();
        setTimeout(() => this.fermerModification(), 1500);
      },
      error: (err) => {
        this.modifLoading = false;
        this.modifError = err.error || 'Erreur lors de la modification.';
      }
    });
  }

  annuler(id: number | undefined) {
    if (!id) return;
    this.commandeService.annulerCommande(id).subscribe({
      next: () => { this.loadCommandes(); this.fermerDetail(); },
      error: () => {}
    });
  }

  // ── Livraison ──────────────────────────────────────────────────────────────

  ouvrirLivraison(c: Commande) {
    this.livraisonCommande = c;
    this.livraisonSuccess = false;
    this.livraisonError = '';
    this.livraisonTracking = '';
    this.livraisonForm = {
      recipientName:  `${this.userData?.firstName || ''} ${this.userData?.lastName || ''}`.trim(),
      recipientEmail: this.userData?.email || '',
      destination: '',
      weightKg: 1,
      widthCm: 20,
      heightCm: 15,
      lengthCm: 30
    };
  }

  fermerLivraison() {
    this.livraisonCommande = null;
    if (this.livraisonSuccess) this.loadCommandes();
  }

  confirmerLivraison() {
    if (!this.livraisonCommande?.id) return;
    this.livraisonLoading = true;
    this.livraisonError = '';

    const payload = {
      orderId:        this.livraisonCommande.id,
      recipientName:  this.livraisonForm.recipientName,
      recipientEmail: this.livraisonForm.recipientEmail,
      destination:    this.livraisonForm.destination,
      weightKg:       this.livraisonForm.weightKg,
      widthCm:        this.livraisonForm.widthCm,
      heightCm:       this.livraisonForm.heightCm,
      lengthCm:       this.livraisonForm.lengthCm
    };

    this.http.post<any>(`${this.SHIPPING_API}/shipments`, payload).subscribe({
      next: (shipment) => {
        this.livraisonTracking = shipment.trackingNumber;
        // Update order status to SHIPPED
        this.commandeService.updateStatut(this.livraisonCommande!.id!, 'SHIPPED').subscribe({
          next: (updated) => {
            const idx = this.commandes.findIndex(c => c.id === updated.id);
            if (idx !== -1) this.commandes[idx] = updated;
            this.applyFilter();
          },
          error: () => {}
        });
        this.livraisonLoading = false;
        this.livraisonSuccess = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.livraisonLoading = false;
        this.livraisonError = err.error || 'Erreur lors de la création de la livraison.';
        this.cdr.detectChanges();
      }
    });
  }

  trackLivraison() {
    this.router.navigate(['/track', this.livraisonTracking]);
    this.fermerLivraison();
  }

  // ── Nouvelle commande ──────────────────────────────────────────────────────

  openNouvelleCommande() {
    this.nouvelleCommande = { clientId: this.clientId, produitId: '', prixSnapshot: 0, quantite: 1 };
    this.successMsg = '';
    this.errorMsg = '';
    this.activeTab = 'nouvelle';
  }

  closeNouvelleCommande(event?: Event) {
    if (event && (event.target as HTMLElement).classList.contains('modal-form')) return;
    this.activeTab = 'liste';
  }

  passerCommande() {
    this.submitLoading = true;
    this.errorMsg = '';
    this.commandeService.creerCommande(this.nouvelleCommande).subscribe({
      next: () => {
        this.submitLoading = false;
        this.successMsg = 'Commande passée avec succès !';
        this.cdr.detectChanges();
        setTimeout(() => { this.activeTab = 'liste'; this.loadCommandes(); }, 1500);
      },
      error: (err) => {
        this.submitLoading = false;
        this.errorMsg = err.error || 'Erreur lors de la commande.';
      }
    });
  }

  onLogout() {
    sessionStorage.clear();
    this.keycloakService.logout(window.location.origin + '/login');
  }
}