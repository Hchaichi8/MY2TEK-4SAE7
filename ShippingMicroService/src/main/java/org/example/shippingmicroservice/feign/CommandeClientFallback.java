package org.example.shippingmicroservice.feign;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

/**
 * Fallback — MS_Commandes unavailable.
 * Shipment creation is allowed in degraded mode (non-blocking).
 * Status sync is skipped silently.
 */
@Component
public class CommandeClientFallback implements CommandeClient {

    @Override
    public Map<String, Object> getCommandeById(Long id) {
        System.out.println("[Feign Fallback] MS_Commandes unavailable — shipment allowed in degraded mode for orderId: " + id);
        return Collections.emptyMap();
    }

    @Override
    public Map<String, Object> markCommandeDelivered(Long id) {
        System.out.println("[Feign Fallback] MS_Commandes unavailable — could not sync DELIVERED status for orderId: " + id);
        return Collections.emptyMap();
    }
}
