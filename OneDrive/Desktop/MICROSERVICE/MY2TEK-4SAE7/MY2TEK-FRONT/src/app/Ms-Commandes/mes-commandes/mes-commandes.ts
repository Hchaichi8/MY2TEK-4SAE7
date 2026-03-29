import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Commande, CommandeService } from '../service/commande.service';
import { User } from '../../Ms-User/Service/user';

// Catalogue produits statique (à remplacer par un MS Produits si disponible)
const PRODUCTS: Record<string, { nom: string; image: string; categorie: string }> = {
  'MY2-RTX4090': {
    nom: 'NVIDIA GeForce RTX 4090 Strix',
    image: 'https://files.pccasegear.com/images/1665464763-ROG-STRIX-RTX4090-O24G-GAMING-thb2.jpg',
    categorie: 'Cartes Graphiques'
  },
  'MY2-R9-7950': {
    nom: 'AMD Ryzen 9 7950X3D',
    image: 'https://file1.hkepc.net/2023/02/source/24202242-6b03f190af726e006a5b82b.jpg',
    categorie: 'Processeurs'
  },
  'MY2-RAM-64': {
    nom: 'Corsair Dominator 64GB DDR5',
    image: 'https://tse4.mm.bing.net/th/id/OIP.2CndQezDqwRuyrGyR1N1YQHaHa?w=1000&h=1000&rs=1&pid=ImgDetMain',
    categorie: 'Mémoire RAM'
  },
};

const DEFAULT_IMG = 'https://via.placeholder.com/300x200?text=Produit';

@Component({
  selector: 'app-mes-commandes',
  standalone: false,
  templateUrl: './mes-commandes.html',
  styleUrl: './mes-commandes.css'
})
export class MesCommandes implements OnInit {
  userData: any = null;
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

  private readonly statutOrder = ['CREATED', 'VALIDATED', 'SHIPPED', 'DELIVERED'];

  constructor(
    private commandeService: CommandeService,
    private userService: User,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userData = this.userService.getUserInfo();
    if (!this.userData) { this.router.navigate(['/login']); return; }
    this.loadCommandes();
  }

  loadCommandes() {
    this.loading = true;
    this.commandeService.getCommandesByClient(this.userData.sub).subscribe({
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

  // Catalogue produits
  getProductImage(produitId: string): string {
    return PRODUCTS[produitId]?.image || DEFAULT_IMG;
  }
  getProductName(produitId: string): string {
    return PRODUCTS[produitId]?.nom || produitId;
  }
  getProductCategory(produitId: string): string {
    return PRODUCTS[produitId]?.categorie || 'Produit';
  }

  getStatutLabel(s?: string): string {
    const m: Record<string, string> = {
      CREATED: 'En attente', VALIDATED: 'Validée',
      SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée'
    };
    return s ? (m[s] || s) : '';
  }

  isStepDone(current?: string, step?: string): boolean {
    if (!current || !step) return false;
    return this.statutOrder.indexOf(current) >= this.statutOrder.indexOf(step);
  }

  get totalDepense(): number {
    return this.commandes.filter(c => c.statut !== 'CANCELLED')
      .reduce((s, c) => s + c.prixSnapshot * c.quantite, 0);
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
    // Envoyer l'objet complet pour éviter les problèmes de validation backend
    const payload = {
      produitId: this.commandeEnModification.produitId,
      quantite: Number(this.commandeEnModification.quantite),
      prixSnapshot: Number(this.commandeEnModification.prixSnapshot),
      clientId: this.commandeEnModification.clientId
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

  openNouvelleCommande() {
    this.nouvelleCommande = { clientId: this.userData.sub, produitId: '', prixSnapshot: 0, quantite: 1 };
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

  onLogout() { this.userService.logout(); this.router.navigate(['/login']); }
}
