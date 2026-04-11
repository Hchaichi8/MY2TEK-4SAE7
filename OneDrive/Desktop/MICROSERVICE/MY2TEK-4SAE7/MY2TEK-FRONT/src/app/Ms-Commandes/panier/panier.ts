import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PanierItem, PanierService } from '../service/panier.service';
import { CommandeService } from '../service/commande.service';
import { User } from '../../Ms-User/Service/user';

@Component({
  selector: 'app-panier',
  standalone: false,
  templateUrl: './panier.html',
  styleUrl: './panier.css'
})
export class Panier implements OnInit {
  items: PanierItem[] = [];
  userData: any = null;
  step: 'panier' | 'confirmation' | 'succes' = 'panier';
  loading = false;
  errorMsg = '';

  constructor(
    private panierService: PanierService,
    private commandeService: CommandeService,
    private userService: User,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userData = this.userService.getUserInfo();
    this.panierService.items$.subscribe(items => {
      this.items = items;
      this.cdr.detectChanges();
    });
  }

  get total(): number { return this.panierService.total; }
  get count(): number { return this.panierService.count; }

  modifier(produitId: string, delta: number) {
    const item = this.items.find(i => i.produitId === produitId);
    if (item) this.panierService.modifier(produitId, item.quantite + delta);
  }

  supprimer(produitId: string) { this.panierService.supprimer(produitId); }

  allerConfirmation() {
    if (!this.userData) { this.router.navigate(['/login']); return; }
    this.step = 'confirmation';
  }

  confirmerCommandes() {
    if (!this.userData) return;
    this.loading = true;
    this.errorMsg = '';
    const clientId = this.userData.sub;
    let completed = 0;
    let hasError = false;

    for (const item of this.items) {
      this.commandeService.creerCommande({
        clientId,
        produitId: item.produitId,
        prixSnapshot: item.prix,
        quantite: item.quantite
      }).subscribe({
        next: () => {
          completed++;
          if (completed === this.items.length && !hasError) {
            this.panierService.vider();
            this.loading = false;
            this.step = 'succes';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          hasError = true;
          this.loading = false;
          this.errorMsg = err.error || 'Erreur lors de la commande.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  voirMesCommandes() { this.router.navigate(['/mes-commandes']); }
  continuerAchats() { this.router.navigate(['/home']); }
}
