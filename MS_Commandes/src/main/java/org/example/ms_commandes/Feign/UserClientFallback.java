package org.example.ms_commandes.Feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class UserClientFallback implements UserClient {

    private static final Logger log = LoggerFactory.getLogger(UserClientFallback.class);

    @Override
    public List<Map<String, Object>> getAllUsers() {
        log.warn("[Feign Fallback] UserMicroService indisponible — commande autorisée en mode dégradé.");
        return Collections.emptyList();
    }

    @Override
    public Map<String, Object> getUserByKeycloakId(String keycloakId) {
        log.warn("[Feign Fallback] UserMicroService indisponible — user '{}' non vérifié.", keycloakId);
        return Collections.emptyMap();
    }
}
