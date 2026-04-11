package org.example.shippingmicroservice.repositories;

import org.example.shippingmicroservice.entities.ShipmentAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentAuditLogRepository extends JpaRepository<ShipmentAuditLog, Long> {
    List<ShipmentAuditLog> findByShipmentIdOrderByChangedAtAsc(Long shipmentId);
    List<ShipmentAuditLog> findByTrackingNumberOrderByChangedAtAsc(String trackingNumber);
}
