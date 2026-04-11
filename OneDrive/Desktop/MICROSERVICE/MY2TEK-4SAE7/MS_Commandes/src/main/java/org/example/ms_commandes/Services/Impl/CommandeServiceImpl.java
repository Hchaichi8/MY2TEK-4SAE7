package org.example.ms_commandes.Services.Impl;

import org.example.ms_commandes.Entities.Commande;
import org.example.ms_commandes.Entities.StatutCommande;
import org.example.ms_commandes.Feign.UserClient;
import org.example.ms_commandes.Messaging.CommandeEventPublisher;
import org.example.ms_commandes.Repositories.CommandeRepo;
import org.example.ms_commandes.Services.Interface.CommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CommandeServiceImpl implements CommandeService {

    private final CommandeRepo commandeRepo;

    /**
     * Scénario 1 — OpenFeign (communication synchrone)
     * Avant de créer une commande, MS_Commandes appelle UserMicroService
     * via Feign pour vérifier que le client existe.
     */
    private final UserClient userClient;

    /**
     * Scénario 2 — RabbitMQ (communication asynchrone)
     * Quand une commande passe à DELIVERED, MS_Commandes publie un message
     * dans commandes.queue. MS_CompetenceAndReview peut consommer ce message
     * pour inviter le client à laisser un avis.
     */
    @Autowired(required = false)
    private CommandeEventPublisher eventPublisher;

    public CommandeServiceImpl(CommandeRepo commandeRepo, UserClient userClient) {
        this.commandeRepo = commandeRepo;
        this.userClient = userClient;
    }

    @Override
    public Commande creerCommande(Commande commande) {
        // --- Scénario 1 : OpenFeign ---
        // Appel synchrone vers UserMicroService pour vérifier que le client existe
        try {
            List<Map<String, Object>> users = userClient.getAllUsers();
            if (!users.isEmpty()) {
                boolean clientExiste = users.stream()
                        .anyMatch(u -> commande.getClientId().equals(u.get("email")));
                if (!clientExiste) {
                    throw new RuntimeException("Client introuvable dans UserMicroService : " + commande.getClientId());
                }
                System.out.println("[Feign] Client '" + commande.getClientId() + "' vérifié dans UserMicroService.");
            } else {
                // Fallback actif — UserMicroService indisponible
                System.out.println("[Feign Fallback] UserMicroService indisponible — commande autorisée en mode dégradé.");
            }
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("Client introuvable")) {
                throw e;
            }
            System.out.println("[Feign Fallback] Erreur communication UserMicroService — mode dégradé: " + e.getMessage());
        }

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

        // --- Scénario 2 : RabbitMQ ---
        // Quand la commande est livrée (DELIVERED), publier un événement
        // MS_CompetenceAndReview consomme ce message pour inviter à laisser un avis
        if (statut == StatutCommande.DELIVERED && eventPublisher != null) {
            try {
                eventPublisher.publierCommandeLivree(saved);
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
