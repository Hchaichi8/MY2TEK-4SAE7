package org.example.shippingmicroservice.services;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Business logic for estimating delivery dates.
 *
 * Rules:
 * - Base delivery days depend on the carrier speed
 * - Destination zone adds extra days (local = 0, national = 1, remote = 2)
 * - Weekends are skipped (no delivery on Saturday/Sunday)
 */
@Service
public class DeliveryEstimationService {

    /**
     * Calculates estimated delivery date based on carrier name and destination.
     *
     * @param carrierName  name of the carrier (DHL, Aramex, Rapid Poste...)
     * @param destination  delivery destination city/region
     * @return estimated delivery LocalDateTime
     */
    public LocalDateTime calculateEstimatedDelivery(String carrierName, String destination) {
        int baseDays = getCarrierBaseDays(carrierName);
        int zoneDays = getDestinationZoneDays(destination);
        int totalDays = baseDays + zoneDays;

        LocalDateTime estimated = LocalDateTime.now();
        int addedDays = 0;

        // Skip weekends when counting delivery days
        while (addedDays < totalDays) {
            estimated = estimated.plusDays(1);
            int dayOfWeek = estimated.getDayOfWeek().getValue(); // 1=Mon, 7=Sun
            if (dayOfWeek < 6) { // Monday to Friday only
                addedDays++;
            }
        }

        return estimated.withHour(18).withMinute(0).withSecond(0);
    }

    /**
     * Returns base delivery days per carrier.
     * DHL is fastest (1 day), Rapid Poste is slowest (3 days).
     */
    private int getCarrierBaseDays(String carrierName) {
        if (carrierName == null) return 3;
        return switch (carrierName.toUpperCase()) {
            case "DHL"         -> 1;
            case "ARAMEX"      -> 2;
            case "RAPID POSTE" -> 3;
            default            -> 2;
        };
    }

    /**
     * Returns extra days based on destination zone.
     * Tunis/Ariana = local (0 extra days)
     * Other major cities = national (1 extra day)
     * Remote areas = 2 extra days
     */
    private int getDestinationZoneDays(String destination) {
        if (destination == null) return 1;
        String dest = destination.toLowerCase();

        // Local zone — Tunis metropolitan area
        if (dest.contains("tunis") || dest.contains("ariana") ||
            dest.contains("ben arous") || dest.contains("manouba")) {
            return 0;
        }

        // National zone — major cities
        if (dest.contains("sfax") || dest.contains("sousse") ||
            dest.contains("monastir") || dest.contains("nabeul") ||
            dest.contains("bizerte") || dest.contains("gabes")) {
            return 1;
        }

        // Remote zone — southern/western regions
        return 2;
    }

    /**
     * Returns a human-readable countdown string.
     * Used by the tracking page to show "Arrives in X days"
     */
    public String getCountdownText(LocalDateTime estimatedDate) {
        if (estimatedDate == null) return "Date inconnue";

        LocalDateTime now = LocalDateTime.now();
        if (estimatedDate.isBefore(now)) return "Livraison en retard";

        long days = java.time.temporal.ChronoUnit.DAYS.between(now, estimatedDate);
        long hours = java.time.temporal.ChronoUnit.HOURS.between(now, estimatedDate) % 24;

        if (days == 0) return "Livraison aujourd'hui avant " + estimatedDate.getHour() + "h";
        if (days == 1) return "Livraison demain";
        return "Livraison dans " + days + " jour" + (days > 1 ? "s" : "");
    }
}
