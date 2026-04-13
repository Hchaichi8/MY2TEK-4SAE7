package org.example.ms_commandes.Services.Interface;

import org.example.ms_commandes.Entities.Commande;
import org.example.ms_commandes.Entities.StatutCommande;

import java.util.List;

public interface CommandeService {
    Commande creerCommande(Commande commande);
    Commande getCommandeById(Long id);
    List<Commande> getAllCommandes();
    List<Commande> getCommandesByClient(String clientId);
    List<Commande> getCommandesByStatut(StatutCommande statut);
    Commande updateCommande(Long id, Commande commande);   // id en paramètre — logique dans le service
    Commande updateStatut(Long id, StatutCommande statut);
    void annulerCommande(Long id);
    void supprimerCommande(Long id);                       // DELETE physique pour CRUD complet
}
