package org.example.shippingmicroservice.services;

import org.example.shippingmicroservice.dto.ShippingStatsDto;
import org.example.shippingmicroservice.entities.Shipment;
import org.example.shippingmicroservice.entities.ShipmentStatus;
import org.example.shippingmicroservice.repositories.ShipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    public ShippingStatsDto getStats() {
        List<Shipment> all = shipmentRepository.findAll();
        ShippingStatsDto stats = new ShippingStatsDto();

        long total = all.size();
        stats.setTotalShipments(total);

        // Count by status
        long delivered = all.stream().filter(s -> s.getStatus() == ShipmentStatus.DELIVERED).count();
        long inTransit = all.stream().filter(s -> s.getStatus() == ShipmentStatus.IN_TRANSIT).count();
        long ready    = all.stream().filter(s -> s.getStatus() == ShipmentStatus.READY_TO_SHIP).count();
        long returns  = all.stream().filter(s ->
                s.getStatus() == ShipmentStatus.RETURN_REQUESTED ||
                s.getStatus() == ShipmentStatus.RETURN_SHIPPED ||
                s.getStatus() == ShipmentStatus.RETURNED).count();

        stats.setDeliveredCount(delivered);
        stats.setInTransitCount(inTransit);
        stats.setReadyToShipCount(ready);
        stats.setReturnCount(returns);

        // Rates
        stats.setDeliverySuccessRate(total > 0 ? Math.round((delivered * 100.0 / total) * 10.0) / 10.0 : 0);
        stats.setReturnRate(total > 0 ? Math.round((returns * 100.0 / total) * 10.0) / 10.0 : 0);

        // Average shipping cost
        double avgCost = all.stream()
                .mapToDouble(Shipment::getShippingCost)
                .average()
                .orElse(0);
        stats.setAverageShippingCost(Math.round(avgCost * 100.0) / 100.0);

        // Shipments per carrier
        Map<String, Long> byCarrier = all.stream()
                .filter(s -> s.getCarrier() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getCarrier().getName(),
                        Collectors.counting()
                ));
        stats.setShipmentsByCarrier(byCarrier);

        // Shipments per status
        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getStatus().name(),
                        Collectors.counting()
                ));
        stats.setShipmentsByStatus(byStatus);

        return stats;
    }
}
