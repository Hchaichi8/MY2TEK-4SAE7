package org.example.ms_commandes.Feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

/**
 * Scénario Feign 2 : vérifier qu'un produit existe dans ProductMicroService
 * avant de valider la création d'une commande.
 */
@FeignClient(name = "ProductMicroService", fallback = ProductClientFallback.class)
public interface ProductClient {

    @GetMapping("/products/{id}")
    Map<String, Object> getProductById(@PathVariable("id") Long id);
}
