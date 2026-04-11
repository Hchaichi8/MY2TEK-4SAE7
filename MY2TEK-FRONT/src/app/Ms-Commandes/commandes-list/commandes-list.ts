import { Component, OnInit } from '@angular/core';
import { Commande, CommandeService, StatutCommande } from '../service/commande.service';

@Component({
  selector: 'app-commandes-list',
  standalone: false,
  templateUrl: './commandes-list.html',
  styleUrl: './commandes-list.css'
})
export class CommandesList implements OnInit {
  commandes: Commande[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;

  statuts: StatutCommande[] = ['CREATED', 'VALIDATED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(private commandeService: CommandeService) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.commandeService.getAllCommandes().subscribe({
      next: (data) => this.commandes = data,
      error: () => this.errorMessage = 'Erreur lors du chargement des commandes.'
    });
  }

  updateStatut(id: number, statut: StatutCommande): void {
    this.commandeService.updateStatut(id, statut).subscribe({
      next: (updated) => {
        const idx = this.commandes.findIndex(c => c.id === id);
        if (idx !== -1) this.commandes[idx] = updated;
        this.successMessage = 'Statut mis à jour.';
      },
      error: () => this.errorMessage = 'Erreur lors de la mise à jour.'
    });
  }

  annuler(id: number): void {
    this.commandeService.annulerCommande(id).subscribe({
      next: () => {
        this.commandes = this.commandes.filter(c => c.id !== id);
        this.successMessage = 'Commande annulée.';
      },
      error: () => this.errorMessage = 'Erreur lors de l\'annulation.'
    });
  }
}
