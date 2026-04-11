import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PanierItem {
  produitId: string;
  nom: string;
  prix: number;
  image: string;
  categorie: string;
  quantite: number;
}

@Injectable({ providedIn: 'root' })
export class PanierService {
  private items: PanierItem[] = [];
  private itemsSubject = new BehaviorSubject<PanierItem[]>([]);

  items$ = this.itemsSubject.asObservable();

  get count(): number {
    return this.items.reduce((s, i) => s + i.quantite, 0);
  }

  get total(): number {
    return this.items.reduce((s, i) => s + i.prix * i.quantite, 0);
  }

  ajouter(item: Omit<PanierItem, 'quantite'>, quantite = 1) {
    const existing = this.items.find(i => i.produitId === item.produitId);
    if (existing) {
      existing.quantite += quantite;
    } else {
      this.items.push({ ...item, quantite });
    }
    this.itemsSubject.next([...this.items]);
  }

  modifier(produitId: string, quantite: number) {
    const item = this.items.find(i => i.produitId === produitId);
    if (item) {
      item.quantite = quantite;
      if (item.quantite <= 0) this.supprimer(produitId);
      else this.itemsSubject.next([...this.items]);
    }
  }

  supprimer(produitId: string) {
    this.items = this.items.filter(i => i.produitId !== produitId);
    this.itemsSubject.next([...this.items]);
  }

  vider() {
    this.items = [];
    this.itemsSubject.next([]);
  }

  getItems(): PanierItem[] {
    return [...this.items];
  }
}
