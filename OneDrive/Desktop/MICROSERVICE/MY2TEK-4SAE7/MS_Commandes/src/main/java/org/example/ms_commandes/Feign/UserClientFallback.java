package org.example.ms_commandes.Feign;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Circuit Breaker : si UserMicroService est indisponible,
 * on retourne une liste vide → commande autorisée en mode dégradé.
 */
@Component
public class UserClientFallback implements UserClient {

    @Override
    public List<Map<String, Object>> getAllUsers() {
        System.out.println("[Feign Fallback] UserMicroService indisponible — commande autorisée par défaut.");
        return Collections.emptyList(); // mode dégradé
    }
}
