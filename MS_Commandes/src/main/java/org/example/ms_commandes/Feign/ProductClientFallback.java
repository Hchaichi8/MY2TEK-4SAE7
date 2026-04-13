package org.example.ms_commandes.Feign;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
public class ProductClientFallback implements ProductClient {

    private static final Logger log = LoggerFactory.getLogger(ProductClientFallback.class);

    @Override
    public Map<String, Object> getProductById(Long id) {
        log.warn("[Feign Fallback] ProductMicroService indisponible — commande autorisée en mode dégradé.");
        return Collections.emptyMap();
    }
}
