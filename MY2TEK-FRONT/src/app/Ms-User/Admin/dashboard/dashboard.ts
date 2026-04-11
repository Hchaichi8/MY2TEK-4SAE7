import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../../Service/user';
import { Router } from '@angular/router';
import { CommandeService, Commande, StatutCommande } from '../../../Ms-Commandes/service/commande.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  users: any[] = [];
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  loadingCommandes = false;
  activeSection: 'dashboard' | 'commandes' = 'dashboard';

  searchTerm = '';
  filterStatut = '';
  successMsg = '';
  errorMsg = '';

  statutStats = [
    { label: 'En attente', key: 'CREATED', color: '#0369a1', count: 0 },
    { label: 'Validées', key: 'VALIDATED', color: '#15803d', count: 0 },
    { label: 'Expédiées', key: 'SHIPPED', color: '#c2410c', count: 0 },
    { label: 'Livrées', key: 'DELIVERED', color: '#166534', count: 0 },
    { label: 'Annulées', key: 'CANCELLED', color: '#991b1b', count: 0 },
  ];

  get commandesEnAttente(): number {
    return this.commandes.filter(c => c.statut === 'CREATED').length;
  }

  get totalRevenu(): number {
    return this.commandes
      .filter(c => c.statut !== 'CANCELLED')
      .reduce((sum, c) => sum + (c.prixSnapshot * c.quantite), 0);
  }

  constructor(
    private userService: User,
    private commandeService: CommandeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadCommandes();
  }

  loadData() {
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
      this.cdr.detectChanges();
    });
  }

  loadCommandes() {
    this.loadingCommandes = true;
    this.commandeService.getAllCommandes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.applyFilters();
        this.updateStatutStats();
        this.loadingCommandes = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCommandes = false; }
    });
  }

  switchToCommandes() {
    this.activeSection = 'commandes';
    this.loadCommandes();
  }

  applyFilters() {
    this.filteredCommandes = this.commandes.filter(c => {
      const matchSearch = !this.searchTerm ||
        c.clientId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.produitId.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatut = !this.filterStatut || c.statut === this.filterStatut;
      return matchSearch && matchStatut;
    });
  }

  updateStatutStats() {
    this.statutStats.forEach(s => {
      s.count = this.commandes.filter(c => c.statut === s.key).length;
    });
  }

  onStatutChange(id: number | undefined, statut: StatutCommande) {
    if (!id) return;
    this.commandeService.updateStatut(id, statut).subscribe({
      next: (updated) => {
        const idx = this.commandes.findIndex(c => c.id === id);
        if (idx !== -1) this.commandes[idx] = updated;
        this.applyFilters();
        this.updateStatutStats();
        this.showSuccess('Statut mis à jour avec succès.');
        this.cdr.detectChanges();
      },
      error: () => this.showError('Erreur lors de la mise à jour du statut.')
    });
  }

  annulerCommande(id: number | undefined) {
    if (!id) return;
    this.commandeService.annulerCommande(id).subscribe({
      next: () => {
        this.loadCommandes();
        this.showSuccess('Commande annulée.');
      },
      error: () => this.showError('Erreur lors de l\'annulation.')
    });
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
  }

  private showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => { this.errorMsg = ''; this.cdr.detectChanges(); }, 3000);
  }

  onLogout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
