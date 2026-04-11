import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../Service/user';
import { Router } from '@angular/router';
import { CommandeService, Commande } from '../../Ms-Commandes/service/commande.service';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  userData: any = null;
  activeTab: 'info' | 'commandes' = 'info';

  // Modal profil
  isModalOpen = false;
  editData = { firstName: '', lastName: '', phone: '' };

  // Commandes
  mesCommandes: Commande[] = [];
  loadingCommandes = false;
  isCommandeModalOpen = false;
  commandeLoading = false;
  commandeSuccess = false;
  commandeError: string | null = null;
  nouvelleCommande: Commande = { clientId: '', produitId: '', prixSnapshot: 0, quantite: 1 };

  private readonly statutOrder = ['CREATED', 'VALIDATED', 'SHIPPED', 'DELIVERED'];

  constructor(
    private userService: User,
    private commandeService: CommandeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userData = this.userService.getUserInfo();
    if (!this.userData) {
      this.router.navigate(['/login']);
    } else {
      this.editData.firstName = this.userData.firstName || '';
      this.editData.lastName = this.userData.lastName || '';
      this.editData.phone = this.userData.phone || '';
    }
  }

  loadMesCommandes() {
    if (!this.userData?.sub) return;
    this.loadingCommandes = true;
    this.commandeService.getCommandesByClient(this.userData.sub).subscribe({
      next: (data) => {
        this.mesCommandes = data;
        this.loadingCommandes = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCommandes = false; }
    });
  }

  getStatutLabel(statut: string | undefined): string {
    const labels: Record<string, string> = {
      CREATED: 'En attente', VALIDATED: 'Validée',
      SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée'
    };
    return statut ? (labels[statut] || statut) : '';
  }

  isStepDone(currentStatut: string | undefined, step: string): boolean {
    if (!currentStatut) return false;
    const ci = this.statutOrder.indexOf(currentStatut);
    const si = this.statutOrder.indexOf(step);
    return ci >= si;
  }

  annulerCommande(id: number | undefined) {
    if (!id) return;
    this.commandeService.annulerCommande(id).subscribe({
      next: () => { this.loadMesCommandes(); },
      error: () => {}
    });
  }

  openCommandeModal() {
    this.nouvelleCommande = {
      clientId: this.userData?.sub || '',
      produitId: '', prixSnapshot: 0, quantite: 1
    };
    this.commandeSuccess = false;
    this.commandeError = null;
    this.isCommandeModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeCommandeModal(event?: Event) {
    if (event && (event.target as HTMLElement).classList.contains('modal-content')) return;
    this.isCommandeModalOpen = false;
    document.body.style.overflow = 'auto';
    if (this.commandeSuccess) this.loadMesCommandes();
  }

  passerCommande() {
    this.commandeLoading = true;
    this.commandeError = null;
    this.commandeService.creerCommande(this.nouvelleCommande).subscribe({
      next: () => {
        this.commandeLoading = false;
        this.commandeSuccess = true;
        this.cdr.detectChanges();
        setTimeout(() => this.closeCommandeModal(), 1500);
      },
      error: (err) => {
        this.commandeLoading = false;
        this.commandeError = err.error || 'Stock insuffisant ou erreur serveur.';
      }
    });
  }

  onLogout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  openModal() {
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(event?: Event) {
    if (event && (event.target as HTMLElement).classList.contains('modal-content')) return;
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  saveProfile() {
    if (!this.userData?.id) return;
    this.userService.updateUser(this.userData.id, this.editData).subscribe({
      next: (res: any) => {
        this.userService.saveToken(res.token);
        this.userData = this.userService.getUserInfo();
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: () => alert('Erreur lors de la mise à jour.')
    });
  }
}
