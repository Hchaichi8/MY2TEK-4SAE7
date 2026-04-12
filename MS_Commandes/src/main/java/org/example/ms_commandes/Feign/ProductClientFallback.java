package org.example.ms_commandes.Feign;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public Map<String, Object> getProduct(Long id) {
        System.out.println("[Feign Fallback] ProductMicroService indisponible — mode dégradé");
        return Map.of();
    }
}
