package org.example.ms_commandes.Services.Impl;

import org.example.ms_commandes.Entities.Commande;
import org.example.ms_commandes.Entities.StatutCommande;
import org.example.ms_commandes.Feign.ProductClient;
import org.example.ms_commandes.Feign.UserClient;
import org.example.ms_commandes.Messaging.CommandeEventPublisher;
import org.example.ms_commandes.Repositories.CommandeRepo;
import org.example.ms_commandes.Services.Interface.CommandeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CommandeServiceImpl implements CommandeService {

    private static final Logger log = LoggerFactory.getLogger(CommandeServiceImpl.class);

    private final CommandeRepo commandeRepo;
    private final UserClient userClient;
    private final ProductClient productClient;

    @Autowired(required = false)
    private CommandeEventPublisher eventPublisher;

    public CommandeServiceImpl(CommandeRepo commandeRepo, UserClient userClient, ProductClient productClient) {
        this.commandeRepo = commandeRepo;
        this.userClient = userClient;
        this.productClient = productClient;
    }

    @Override
    public Commande creerCommande(Commande commande) {

        // --- Scénario Feign 1 : vérifier que le client existe dans UserMicroService ---
        try {
            // Appel direct par keycloakId (sub UUID) — endpoint /users/feign/{keycloakId}
            Map<String, Object> user = userClient.getUserByKeycloakId(commande.getClientId());
            if (user == null || user.isEmpty()) {
                log.warn("[Feign-1 Fallback] UserMicroService indisponible — commande autorisée en mode dégradé.");
            } else {
                log.info("[Feign-1] Client '{}' vérifié dans UserMicroService : {} {}",
                    commande.getClientId(), user.get("firstName"), user.get("lastName"));
            }
        } catch (RuntimeException e) {
            log.warn("[Feign-1 Fallback] Erreur UserMicroService : {}", e.getMessage());
        }

        // --- Scénario Feign 2 : vérifier que le produit existe dans ProductMicroService ---
        try {
            Long produitIdLong = Long.parseLong(commande.getProduitId());
            Map<String, Object> produit = productClient.getProductById(produitIdLong);
            if (produit == null || produit.isEmpty()) {
                log.warn("[Feign-2 Fallback] ProductMicroService indisponible — commande autorisée en mode dégradé.");
            } else {
                log.info("[Feign-2] Produit '{}' vérifié dans ProductMicroService : {}", commande.getProduitId(), produit.get("name"));
            }
        } catch (NumberFormatException e) {
            log.warn("[Feign-2] produitId '{}' n'est pas un Long — vérification produit ignorée.", commande.getProduitId());
        } catch (RuntimeException e) {
            log.warn("[Feign-2 Fallback] Erreur ProductMicroService : {}", e.getMessage());
        }

        commande.setStatut(StatutCommande.CREATED);
        Commande saved = commandeRepo.save(commande);
        log.info("[Commande] Commande #{} créée pour client '{}'.", saved.getId(), saved.getClientId());
        return saved;
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
    public Commande updateCommande(Long id, Commande updated) {
        Commande existing = getCommandeById(id);
        // Règle métier : modification uniquement si statut CREATED (logique dans le Service)
        if (existing.getStatut() != StatutCommande.CREATED) {
            throw new RuntimeException("Modification impossible : commande déjà traitée (statut=" + existing.getStatut() + ").");
        }
        existing.setProduitId(updated.getProduitId());
        existing.setQuantite(updated.getQuantite());
        existing.setPrixSnapshot(updated.getPrixSnapshot());
        Commande saved = commandeRepo.save(existing);
        log.info("[Commande] Commande #{} modifiée.", id);
        return saved;
    }

    @Override
    public Commande updateStatut(Long id, StatutCommande statut) {
        Commande commande = getCommandeById(id);
        commande.setStatut(statut);
        Commande saved = commandeRepo.save(commande);
        log.info("[Commande] Statut commande #{} mis à jour : {}", id, statut);

        // --- Scénario RabbitMQ 1 : publier quand la commande est livrée ---
        if (statut == StatutCommande.DELIVERED && eventPublisher != null) {
            try {
                eventPublisher.publierCommandeLivree(saved);
            } catch (Exception e) {
                log.warn("[RabbitMQ] Événement DELIVERED ignoré : {}", e.getMessage());
            }
        }
        return saved;
    }

    @Override
    public void annulerCommande(Long id) {
        Commande commande = getCommandeById(id);
        commande.setStatut(StatutCommande.CANCELLED);
        Commande saved = commandeRepo.save(commande);
        log.info("[Commande] Commande #{} annulée.", id);

        // --- Scénario RabbitMQ 2 : publier quand la commande est annulée ---
        if (eventPublisher != null) {
            try {
                eventPublisher.publierCommandeAnnulee(saved);
            } catch (Exception e) {
                log.warn("[RabbitMQ] Événement CANCELLED ignoré : {}", e.getMessage());
            }
        }
    }

    @Override
    public void supprimerCommande(Long id) {
        // Vérifie que la commande existe avant de supprimer
        getCommandeById(id);
        commandeRepo.deleteById(id);
        log.info("[Commande] Commande #{} supprimée définitivement.", id);
    }
}
