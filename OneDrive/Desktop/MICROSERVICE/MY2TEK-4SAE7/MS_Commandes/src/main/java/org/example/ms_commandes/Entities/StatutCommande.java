package org.example.ms_commandes.Entities;

/**
 * Workflow d'état d'une commande :
 * CREATED -> VALIDATED -> SHIPPED -> DELIVERED
 */
public enum StatutCommande {
    CREATED,
    VALIDATED,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
