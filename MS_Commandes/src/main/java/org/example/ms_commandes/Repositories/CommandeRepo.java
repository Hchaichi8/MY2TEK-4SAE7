package org.example.ms_commandes.Repositories;

import org.example.ms_commandes.Entities.Commande;
import org.example.ms_commandes.Entities.StatutCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeRepo extends JpaRepository<Commande, Long> {

    List<Commande> findByClientId(String clientId);

    List<Commande> findByStatut(StatutCommande statut);

    List<Commande> findByProduitId(String produitId);
}
