package org.example.ms_commandes.Feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Client OpenFeign pour communiquer avec le MS Stock/Produit.
 * "MSSTOCK" = spring.application.name du microservice stock enregistré dans Eureka.
 *
 * Scénario 1 (OpenFeign) :
 * Avant de valider une commande, on vérifie que le stock est suffisant.
 */
@FeignClient(name = "MSSTOCK", fallback = StockClientFallback.class)
public interface StockClient {

    /**
     * Vérifie si la quantité demandée est disponible pour un produit donné.
     * @param produitId  l'ID du produit
     * @param quantite   la quantité demandée
     * @return true si stock suffisant, false sinon
     */
    @GetMapping("/Stock/disponible/{produitId}/{quantite}")
    Boolean verifierDisponibilite(@PathVariable("produitId") String produitId,
                                  @PathVariable("quantite") int quantite);
}
