package org.example.ms_commandes.Services.Impl;

import org.example.ms_commandes.Entities.Commande;
import org.example.ms_commandes.Entities.StatutCommande;
import org.example.ms_commandes.Feign.StockClient;
import org.example.ms_commandes.Messaging.CommandeEventPublisher;
import org.example.ms_commandes.Repositories.CommandeRepo;
import org.example.ms_commandes.Services.Interface.CommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommandeServiceImpl implements CommandeService {

    private final CommandeRepo commandeRepo;
    private final StockClient stockClient;

    // Optionnel : seulement présent si rabbitmq.enabled=true
    @Autowired(required = false)
    private CommandeEventPublisher eventPublisher;

    public CommandeServiceImpl(CommandeRepo commandeRepo, StockClient stockClient) {
        this.commandeRepo = commandeRepo;
        this.stockClient = stockClient;
    }

    @Override
    public Commande creerCommande(Commande commande) {
        // MSSTOCK non disponible dans ce projet — vérification stock ignorée
        commande.setStatut(StatutCommande.CREATED);
        return commandeRepo.save(commande);
    }

    @Override
    public Commande getCommandeById(Long id) {
        return commandeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable: " + id));
    }

    @Override
    public List<Commande> getAllCommandes() {
        return commandeRepo.findAll();
    }

    @Override
    public List<Commande> getCommandesByClient(String clientId) {
        return commandeRepo.findByClientId(clientId);
    }

    @Override
    public List<Commande> getCommandesByStatut(StatutCommande statut) {
        return commandeRepo.findByStatut(statut);
    }

    @Override
    public Commande updateCommande(Commande commande) {
        return commandeRepo.save(commande);
    }

    @Override
    public Commande updateStatut(Long id, StatutCommande statut) {
        Commande commande = getCommandeById(id);
        commande.setStatut(statut);
        Commande saved = commandeRepo.save(commande);
        if (statut == StatutCommande.VALIDATED && eventPublisher != null) {
            try {
                eventPublisher.publierCommandeValidee(saved);
            } catch (Exception e) {
                System.out.println("[RabbitMQ] Événement ignoré: " + e.getMessage());
            }
        }
        return saved;
    }

    @Override
    public void annulerCommande(Long id) {
        Commande commande = getCommandeById(id);
        commande.setStatut(StatutCommande.CANCELLED);
        commandeRepo.save(commande);
    }
}
