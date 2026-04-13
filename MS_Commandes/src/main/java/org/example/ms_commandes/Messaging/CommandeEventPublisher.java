package org.example.ms_commandes.Messaging;

import org.example.ms_commandes.Entities.Commande;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "rabbitmq.enabled", havingValue = "true")
public class CommandeEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(CommandeEventPublisher.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${commandes.rabbitmq.exchange:commandes.exchange}")
    private String exchange;

    @Value("${commandes.rabbitmq.routingkey:commandes.routingkey}")
    private String routingKey;

    @Value("${commandes.rabbitmq.routingkey.cancelled:commandes.cancelled.routingkey}")
    private String routingKeyCancelled;

    /**
     * Scénario RabbitMQ 1 : commande livrée → inviter le client à laisser un avis
     * Consommé par MS_CompetenceAndReview
     */
    public void publierCommandeLivree(Commande commande) {
        Map<String, Object> event = new HashMap<>();
        event.put("commandeId", commande.getId());
        event.put("clientId", commande.getClientId());
        event.put("produitId", commande.getProduitId());
        event.put("statut", "DELIVERED");
        event.put("message", "Commande livrée — invitation à laisser un avis");
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(exchange, routingKey, event);
        log.info("[RabbitMQ] Événement DELIVERED publié pour commande #{}.", commande.getId());
    }

    /**
     * Scénario RabbitMQ 2 : commande annulée → notifier les autres services
     * (ex: ShippingMicroService peut annuler la livraison, stock peut être réapprovisionné)
     */
    public void publierCommandeAnnulee(Commande commande) {
        Map<String, Object> event = new HashMap<>();
        event.put("commandeId", commande.getId());
        event.put("clientId", commande.getClientId());
        event.put("produitId", commande.getProduitId());
        event.put("quantite", commande.getQuantite());
        event.put("statut", "CANCELLED");
        event.put("message", "Commande annulée — libération du stock et annulation livraison");
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(exchange, routingKeyCancelled, event);
        log.info("[RabbitMQ] Événement CANCELLED publié pour commande #{}.", commande.getId());
    }
}
