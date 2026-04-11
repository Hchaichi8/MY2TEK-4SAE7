package org.example.ms_commandes.Messaging;

import org.example.ms_commandes.Entities.Commande;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Scénario 2 — RabbitMQ (communication asynchrone)
 * Quand une commande est DELIVERED, on publie un événement.
 * Review Service peut consommer ce message pour inviter le client à laisser un avis.
 */
@Component
@ConditionalOnProperty(name = "rabbitmq.enabled", havingValue = "true")
public class CommandeEventPublisher {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${commandes.rabbitmq.exchange:commandes.exchange}")
    private String exchange;

    @Value("${commandes.rabbitmq.routingkey:commandes.routingkey}")
    private String routingKey;

    /**
     * Publie un événement quand la commande est livrée (DELIVERED).
     * Review Service consomme ce message pour inviter le client à laisser un avis.
     */
    public void publierCommandeLivree(Commande commande) {
        Map<String, Object> event = new HashMap<>();
        event.put("commandeId", commande.getId());
        event.put("clientId", commande.getClientId());
        event.put("produitId", commande.getProduitId());
        event.put("statut", "DELIVERED");
        event.put("message", "Commande livrée :invitation à laisser un avis");
        event.put("timestamp", commande.getUpdatedAt().toString());

        rabbitTemplate.convertAndSend(exchange, routingKey, event);
        System.out.println("[RabbitMQ] Événement DELIVERED publié pour commande ID: " + commande.getId());
    }
}
