package org.example.ms_commandes.Messaging;

import org.example.ms_commandes.Entities.Commande;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "rabbitmq.enabled", havingValue = "true")
public class CommandeEventPublisher {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${commandes.rabbitmq.exchange:commandes.exchange}")
    private String exchange;

    @Value("${commandes.rabbitmq.routingkey:commandes.routingkey}")
    private String routingKey;

    public void publierCommandeValidee(Commande commande) {
        Map<String, Object> event = new HashMap<>();
        event.put("commandeId", commande.getId());
        event.put("clientId", commande.getClientId());
        event.put("produitId", commande.getProduitId());
        event.put("quantite", commande.getQuantite());
        event.put("prixSnapshot", commande.getPrixSnapshot());
        event.put("statut", commande.getStatut().name());
        event.put("timestamp", commande.getUpdatedAt().toString());

        rabbitTemplate.convertAndSend(exchange, routingKey, event);
        System.out.println("[RabbitMQ] Événement publié pour commande ID: " + commande.getId());
    }
}
