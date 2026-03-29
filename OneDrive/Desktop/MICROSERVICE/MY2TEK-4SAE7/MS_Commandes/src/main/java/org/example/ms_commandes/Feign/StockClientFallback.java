package org.example.ms_commandes.Feign;

import org.springframework.stereotype.Component;

/**
 * Fallback : si le MS Stock est indisponible, on retourne false par sécurité.
 */
@Component
public class StockClientFallback implements StockClient {

    @Override
    public Boolean verifierDisponibilite(String produitId, int quantite) {
        // MS Stock indisponible -> on autorise par défaut (mode dégradé)
        System.out.println("[Feign Fallback] MS Stock indisponible, commande autorisée par défaut.");
        return true;
    }
}
