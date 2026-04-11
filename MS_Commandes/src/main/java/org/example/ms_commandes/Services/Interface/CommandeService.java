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
    Commande updateCommande(Commande commande);
    Commande updateStatut(Long id, StatutCommande statut);
    void annulerCommande(Long id);
}
