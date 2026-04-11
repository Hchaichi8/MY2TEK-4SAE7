import { Pipe, PipeTransform } from '@angular/core';
import { Commande } from '../service/commande.service';

@Pipe({ name: 'commandesByStatut', standalone: false })
export class CommandesByStatutPipe implements PipeTransform {
  transform(commandes: Commande[], statut: string): number {
    return commandes.filter(c => c.statut === statut).length;
  }
}
