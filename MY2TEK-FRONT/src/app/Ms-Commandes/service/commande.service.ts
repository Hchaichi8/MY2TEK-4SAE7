import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Commande {
  id?: number;
  clientId: string;
  produitId: string;
  prixSnapshot: number;
  quantite: number;
  statut?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type StatutCommande = 'CREATED' | 'VALIDATED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  // Toutes les requêtes passent par la Gateway (port 8085)
  // La Gateway route vers MS-Commandes via Eureka (mscommandes)
  private apiUrl = 'http://localhost:8085/mscommandes/Commandes';

  constructor(private http: HttpClient) {}

  creerCommande(commande: Commande): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/creer`, commande);
  }

  getAllCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/all`);
  }

  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  getCommandesByClient(clientId: string): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/client`, { params: { clientId } });
  }

  updateCommande(id: number, commande: Partial<Commande>): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}`, commande);
  }

  updateStatut(id: number, statut: StatutCommande): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}/statut/${statut}`, {});
  }

  annulerCommande(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/annuler/${id}`, { responseType: 'text' });
  }
}
