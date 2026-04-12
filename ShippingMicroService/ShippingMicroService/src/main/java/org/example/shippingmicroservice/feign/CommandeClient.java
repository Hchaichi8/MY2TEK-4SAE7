package org.example.shippingmicroservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Map;

/**
 * OpenFeign client — ShippingMicroService → MS_Commandes
 *
 * Scenario 1 (on shipment creation):
 *   Verify the linked order exists and is in VALIDATED status
 *   before accepting the shipment request.
 *
 * Scenario 2 (on shipment DELIVERED):
 *   Automatically update the order status to DELIVERED
 *   so both microservices stay in sync without manual intervention.
 */
@FeignClient(
        name = "MSCOMMANDES",
        fallback = CommandeClientFallback.class
)
public interface CommandeClient {

    // Scenario 1 — get order details to validate status before creating shipment
    @GetMapping("/Commandes/{id}")
    Map<String, Object> getCommandeById(@PathVariable("id") Long id);

    // Scenario 2 — update order status to DELIVERED when shipment is delivered
    @PutMapping("/Commandes/{id}/statut/DELIVERED")
    Map<String, Object> markCommandeDelivered(@PathVariable("id") Long id);
}
