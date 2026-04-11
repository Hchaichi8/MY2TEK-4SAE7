import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Commande, CommandeService, StatutCommande } from '../service/commande.service';
import { User } from '../../Ms-User/Service/user';

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
const DEFAULT_IMG = 'https://placehold.co/300x200?text=Produit';

@Component({
  selector: 'app-admin-commandes',
  standalone: false,
  templateUrl: './admin-commandes.html',
  styleUrl: './admin-commandes.css'
})
export class AdminCommandes implements OnInit {
  commandes: Commande[] = [];
  filtered: Commande[] = [];
  loading = false;
  searchTerm = '';
  filterStatut = '';
  successMsg = '';
  errorMsg = '';

  selectedCommande: Commande | null = null;
  editStatut: StatutCommande = 'CREATED';

  readonly statuts: StatutCommande[] = ['CREATED', 'VALIDATED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  readonly statutLabels: Record<string, string> = {
    CREATED: 'En attente', VALIDATED: 'Validée',
    SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée'
  };

  get stats() {
    return {
      total: this.commandes.length,
      created: this.commandes.filter(c => c.statut === 'CREATED').length,
      validated: this.commandes.filter(c => c.statut === 'VALIDATED').length,
      shipped: this.commandes.filter(c => c.statut === 'SHIPPED').length,
      delivered: this.commandes.filter(c => c.statut === 'DELIVERED').length,
      cancelled: this.commandes.filter(c => c.statut === 'CANCELLED').length,
      revenu: this.commandes.filter(c => c.statut !== 'CANCELLED')
        .reduce((s, c) => s + c.prixSnapshot * c.quantite, 0)
    };
  }

  constructor(
    private commandeService: CommandeService,
    private userService: User,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.commandeService.getAllCommandes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters() {
    const s = this.searchTerm.toLowerCase();
    this.filtered = this.commandes.filter(c => {
      const matchSearch = !s || c.clientId.toLowerCase().includes(s) ||
        c.produitId.toLowerCase().includes(s) || String(c.id).includes(s);
      const matchStatut = !this.filterStatut || c.statut === this.filterStatut;
      return matchSearch && matchStatut;
    });
  }

  getProductImage(id: string): string { return PRODUCTS[id]?.image || DEFAULT_IMG; }
  getProductName(id: string): string { return PRODUCTS[id]?.nom || id; }
  getProductCategory(id: string): string { return PRODUCTS[id]?.categorie || 'Produit'; }

  openDetail(c: Commande) {
    this.selectedCommande = { ...c };
    this.editStatut = (c.statut as StatutCommande) || 'CREATED';
  }
  closeDetail() { this.selectedCommande = null; }

  saveStatut() {
    if (!this.selectedCommande?.id) return;
    this.commandeService.updateStatut(this.selectedCommande.id, this.editStatut).subscribe({
      next: (updated) => {
        const idx = this.commandes.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.commandes[idx] = updated;
        this.applyFilters();
        this.closeDetail();
        this.showSuccess('Statut mis à jour.');
        this.cdr.detectChanges();
      },
      error: () => this.showError('Erreur mise à jour.')
    });
  }

  onStatutChange(id: number | undefined, statut: StatutCommande) {
    if (!id) return;
    this.commandeService.updateStatut(id, statut).subscribe({
      next: (updated) => {
        const idx = this.commandes.findIndex(c => c.id === id);
        if (idx !== -1) this.commandes[idx] = updated;
        this.applyFilters();
        this.showSuccess('Statut mis à jour.');
        this.cdr.detectChanges();
      },
      error: () => this.showError('Erreur mise à jour.')
    });
  }

  annuler(id: number | undefined) {
    if (!id) return;
    this.commandeService.annulerCommande(id).subscribe({
      next: () => { this.load(); this.showSuccess('Commande annulée.'); },
      error: () => this.showError('Erreur annulation.')
    });
  }

  private showSuccess(m: string) {
    this.successMsg = m; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
  }
  private showError(m: string) {
    this.errorMsg = m;
    setTimeout(() => { this.errorMsg = ''; this.cdr.detectChanges(); }, 3000);
  }

  onLogout() { this.userService.logout(); this.router.navigate(['/login']); }
}
