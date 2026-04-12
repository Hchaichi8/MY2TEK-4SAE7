package org.example.ms_commandes.Services.Impl;

import org.example.ms_commandes.Entities.Commande;
import org.example.ms_commandes.Entities.StatutCommande;
import org.example.ms_commandes.Feign.UserClient;
import org.example.ms_commandes.Feign.ProductClient;
import org.example.ms_commandes.Messaging.CommandeEventPublisher;
import org.example.ms_commandes.Config.CommandeRabbitConfig;
import org.example.ms_commandes.Config.StockEvent;
import org.example.ms_commandes.Repositories.CommandeRepo;
import org.example.ms_commandes.Services.Interface.CommandeService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CommandeServiceImpl implements CommandeService {

    private final CommandeRepo commandeRepo;
    private final UserClient userClient;
    private final ProductClient productClient;     // ← NEW
    private final RabbitTemplate rabbitTemplate;   // ← NEW

    @Autowired(required = false)
    private CommandeEventPublisher eventPublisher;

    public CommandeServiceImpl(CommandeRepo commandeRepo,
                               UserClient userClient,
                               ProductClient productClient,
                               RabbitTemplate rabbitTemplate) {
        this.commandeRepo   = commandeRepo;
        this.userClient     = userClient;
        this.productClient  = productClient;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public Commande creerCommande(Commande commande) {

        // ── Feign 1: Verify client exists ─────────────────────────────────────
        try {
            List<Map<String, Object>> users = userClient.getAllUsers();
            if (!users.isEmpty()) {
                boolean clientExiste = users.stream()
                        .anyMatch(u -> commande.getClientId().equals(u.get("keycloakId"))
                                || commande.getClientId().equals(u.get("email")));
                if (!clientExiste) {
                    System.out.println("[Feign] Client non trouvé — mode dégradé autorisé.");
                }
            }
        } catch (Exception e) {
            System.out.println("[Feign Fallback] UserMicroService indisponible: " + e.getMessage());
        }

        // ── Feign 2: Verify product exists and has enough stock ───────────────
        try {
            Long productId = Long.parseLong(commande.getProduitId());
            Map<String, Object> product = productClient.getProduct(productId);

            if (product.isEmpty()) {
                System.out.println("[Feign Fallback] ProductMicroService indisponible — mode dégradé.");
            } else {
                int stock = ((Number) product.get("stockQuantity")).intValue();
                String productName = (String) product.get("name");

                if (stock < commande.getQuantite()) {
                    throw new RuntimeException("Stock insuffisant pour '"
                            + productName + "' (disponible: " + stock
                            + ", demandé: " + commande.getQuantite() + ")");
                }
                System.out.println("[Feign] Produit '" + productName
                        + "' vérifié — stock OK (" + stock + " disponibles)");
            }
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("Stock insuffisant")) {
                throw e; // propagate stock error to user
            }
            System.out.println("[Feign Fallback] ProductMicroService erreur: " + e.getMessage());
        }

        // ── Save commande ─────────────────────────────────────────────────────
        commande.setStatut(StatutCommande.CREATED);
        Commande saved = commandeRepo.save(commande);

        // ── RabbitMQ: Decrease stock in ProductMicroService ───────────────────
        try {
            StockEvent event = new StockEvent(saved.getProduitId(), saved.getQuantite());
            rabbitTemplate.convertAndSend(
                    CommandeRabbitConfig.STOCK_EXCHANGE,
                    CommandeRabbitConfig.STOCK_KEY,
                    event
            );
            System.out.println("✅ [RabbitMQ] Stock decrease event published for product: "
                    + saved.getProduitId());
        } catch (Exception e) {
            System.out.println("⚠️ [RabbitMQ] Failed to publish stock event: " + e.getMessage());
        }

        return saved;
    }

    // ── rest of methods unchanged ─────────────────────────────────────────────

    @Override
    public Commande getCommandeById(Long id) {
        return commandeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable: " + id));
    }

    @Override
    public List<Commande> getAllCommandes() { return commandeRepo.findAll(); }

    @Override
    public List<Commande> getCommandesByClient(String clientId) {
        return commandeRepo.findByClientId(clientId);
    }

    @Override
    public List<Commande> getCommandesByStatut(StatutCommande statut) {
        return commandeRepo.findByStatut(statut);
    }

    @Override
    public Commande updateCommande(Commande commande) { return commandeRepo.save(commande); }

    @Override
    public Commande updateStatut(Long id, StatutCommande statut) {
        Commande commande = getCommandeById(id);
        commande.setStatut(statut);
        Commande saved = commandeRepo.save(commande);

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