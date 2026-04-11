import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Commande, CommandeService } from '../service/commande.service';

@Component({
  selector: 'app-creer-commande',
  standalone: false,
  templateUrl: './creer-commande.html',
  styleUrl: './creer-commande.css'
})
export class CreerCommande {
  commande: Commande = {
    clientId: '',
    produitId: '',
    prixSnapshot: 0,
    quantite: 1
  };

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  constructor(private commandeService: CommandeService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = null;
    this.isLoading = true;

    this.commandeService.creerCommande(this.commande).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Commande créée avec succès !';
        setTimeout(() => this.router.navigate(['/commandes']), 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'Erreur lors de la création.';
      }
    });
  }
}
