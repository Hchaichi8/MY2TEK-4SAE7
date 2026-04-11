package org.example.shippingmicroservice.controllers;

import org.example.shippingmicroservice.dto.ShippingStatsDto;
import org.example.shippingmicroservice.services.DeliveryEstimationService;
import org.example.shippingmicroservice.services.ShippingService;
import org.example.shippingmicroservice.services.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/shipments")
@CrossOrigin(origins = "http://localhost:4200")

public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Autowired
    private DeliveryEstimationService deliveryEstimationService;

    @Autowired
    private ShippingService shippingService;

    /**
     * GET /shipments/stats
     * Returns aggregated statistics for the admin dashboard.
     */
    @GetMapping("/stats")
    public ResponseEntity<ShippingStatsDto> getStats() {
        return ResponseEntity.ok(statisticsService.getStats());
    }

    /**
     * GET /shipments/{id}/delivery-estimate
     * Returns estimated delivery info for a specific shipment.
     */
    @GetMapping("/{id}/delivery-estimate")
    public ResponseEntity<?> getDeliveryEstimate(@PathVariable Long id) {
        try {
            var shipment = shippingService.getShipmentById(id);
            LocalDateTime estimated = shipment.getEstimatedDeliveryDate();
            String countdown = deliveryEstimationService.getCountdownText(estimated);

            Map<String, Object> response = new HashMap<>();
            response.put("shipmentId", id);
            response.put("trackingNumber", shipment.getTrackingNumber());
            response.put("estimatedDeliveryDate", estimated);
            response.put("countdown", countdown);
            response.put("status", shipment.getStatus());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /shipments/estimate?carrier=DHL&destination=Tunis
     * Quick estimate without creating a shipment.
     */
    @GetMapping("/estimate")
    public ResponseEntity<?> quickEstimate(
            @RequestParam String carrier,
            @RequestParam String destination) {

        LocalDateTime estimated = deliveryEstimationService.calculateEstimatedDelivery(carrier, destination);
        String countdown = deliveryEstimationService.getCountdownText(estimated);

        Map<String, Object> response = new HashMap<>();
        response.put("carrier", carrier);
        response.put("destination", destination);
        response.put("estimatedDeliveryDate", estimated);
        response.put("countdown", countdown);

        return ResponseEntity.ok(response);
    }
}
