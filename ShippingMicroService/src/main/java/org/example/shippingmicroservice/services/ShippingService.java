package org.example.shippingmicroservice.services;

import org.example.shippingmicroservice.dto.CreateShipmentRequest;
import org.example.shippingmicroservice.dto.ReturnShipmentRequest;
import org.example.shippingmicroservice.entities.Carrier;
import org.example.shippingmicroservice.entities.Shipment;
import org.example.shippingmicroservice.entities.ShipmentAuditLog;
import org.example.shippingmicroservice.entities.ShipmentStatus;
import org.example.shippingmicroservice.repositories.ShipmentAuditLogRepository;
import org.example.shippingmicroservice.repositories.ShipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class ShippingService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private CarrierService carrierService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ShipmentAuditLogRepository auditLogRepository;

    @Autowired
    private org.example.shippingmicroservice.feign.UserServiceClient userServiceClient;

    @Autowired
    private org.example.shippingmicroservice.messaging.ShipmentEventProducer eventProducer;

    @Autowired
    private DeliveryEstimationService deliveryEstimationService;

    // ─── CREATE ──────────────────────────────────────────────────────────────

    public Shipment createShipment(CreateShipmentRequest req) {
        // Scenario 1 — Feign: verify recipient email exists in UserMicroService
        try {
            userServiceClient.getUserByEmail(req.getRecipientEmail());
        } catch (Exception e) {
            // User not found or UserMicroService unavailable — log and continue
            System.out.println("[Feign] Could not verify user email via UserMicroService: " + e.getMessage());
        }
        Carrier carrier = (req.getCarrierId() != null)
                ? carrierService.getCarrierById(req.getCarrierId())
                : carrierService.selectBestCarrier(req.getWeightKg());

        double cost = calculateCost(carrier, req.getWeightKg(), req.getWidthCm(), req.getHeightCm(), req.getLengthCm());
        String trackingNumber = generateTrackingNumber();
        String label = generateLabel(trackingNumber, req.getRecipientName(), req.getDestination(), carrier.getName());

        Shipment shipment = new Shipment();
        shipment.setOrderId(req.getOrderId());
        shipment.setTrackingNumber(trackingNumber);
        shipment.setWeightKg(req.getWeightKg());
        shipment.setWidthCm(req.getWidthCm());
        shipment.setHeightCm(req.getHeightCm());
        shipment.setLengthCm(req.getLengthCm());
        shipment.setDestination(req.getDestination());
        shipment.setRecipientEmail(req.getRecipientEmail());
        shipment.setRecipientName(req.getRecipientName());
        shipment.setCarrier(carrier);
        shipment.setShippingCost(cost);
        shipment.setLabelData(label);
        shipment.setStatus(ShipmentStatus.READY_TO_SHIP);

        // Calculate estimated delivery date
        LocalDateTime estimatedDate = deliveryEstimationService.calculateEstimatedDelivery(
                carrier.getName(), req.getDestination()
        );
        shipment.setEstimatedDeliveryDate(estimatedDate);

        Shipment saved = shipmentRepository.save(shipment);

        // Audit log: creation
        auditLogRepository.save(new ShipmentAuditLog(
                saved.getId(), saved.getTrackingNumber(),
                null, ShipmentStatus.READY_TO_SHIP,
                "system", "Livraison créée"
        ));

        notificationService.sendShipmentCreatedEmail(saved);
        return saved;
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Livraison introuvable avec l'id: " + id));
    }

    public Shipment trackByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Aucune livraison trouvée pour le numéro: " + trackingNumber));
    }

    public List<Shipment> getShipmentsByOrder(Long orderId) {
        return shipmentRepository.findByOrderId(orderId);
    }

    public List<Shipment> getShipmentsByStatus(ShipmentStatus status) {
        return shipmentRepository.findByStatus(status);
    }

    // ─── UPDATE STATUS ────────────────────────────────────────────────────────

    public Shipment updateStatus(Long id, ShipmentStatus newStatus, String changedBy, String note) {
        Shipment shipment = getShipmentById(id);
        ShipmentStatus oldStatus = shipment.getStatus();

        validateStatusTransition(oldStatus, newStatus);

        shipment.setStatus(newStatus);
        Shipment updated = shipmentRepository.save(shipment);

        // Audit log
        auditLogRepository.save(new ShipmentAuditLog(
                updated.getId(), updated.getTrackingNumber(),
                oldStatus, newStatus,
                changedBy != null ? changedBy : "admin",
                note
        ));

        notificationService.sendStatusUpdateEmail(updated, oldStatus);

        // RabbitMQ: publish event when shipment is DELIVERED
        if (newStatus == ShipmentStatus.DELIVERED) {
            org.example.shippingmicroservice.dto.ShipmentDeliveredEvent event =
                new org.example.shippingmicroservice.dto.ShipmentDeliveredEvent(
                    updated.getId(),
                    updated.getTrackingNumber(),
                    updated.getRecipientEmail(),
                    updated.getRecipientName(),
                    updated.getDestination()
                );
            eventProducer.publishDeliveredEvent(event);
        }

        return updated;
    }

    // ─── RETURN FLOW ──────────────────────────────────────────────────────────

    public Shipment requestReturn(ReturnShipmentRequest req) {
        Shipment shipment = getShipmentById(req.getShipmentId());

        if (shipment.getStatus() != ShipmentStatus.DELIVERED) {
            throw new RuntimeException("Un retour ne peut être demandé que pour une livraison avec le statut DELIVERED.");
        }

        ShipmentStatus oldStatus = shipment.getStatus();
        shipment.setStatus(ShipmentStatus.RETURN_REQUESTED);
        Shipment updated = shipmentRepository.save(shipment);

        auditLogRepository.save(new ShipmentAuditLog(
                updated.getId(), updated.getTrackingNumber(),
                oldStatus, ShipmentStatus.RETURN_REQUESTED,
                req.getRequestedBy() != null ? req.getRequestedBy() : "client",
                "Retour demandé: " + req.getReason()
        ));

        return updated;
    }

    // ─── AUDIT LOG ────────────────────────────────────────────────────────────

    public List<ShipmentAuditLog> getAuditLog(Long shipmentId) {
        return auditLogRepository.findByShipmentIdOrderByChangedAtAsc(shipmentId);
    }

    public List<ShipmentAuditLog> getAuditLogByTracking(String trackingNumber) {
        return auditLogRepository.findByTrackingNumberOrderByChangedAtAsc(trackingNumber);
    }

    public Shipment saveShipment(Shipment shipment) {
        return shipmentRepository.save(shipment);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    public void deleteShipment(Long id) {        if (!shipmentRepository.existsById(id)) {
            throw new RuntimeException("Livraison introuvable.");
        }
        shipmentRepository.deleteById(id);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private double calculateCost(Carrier carrier, double weightKg,
                                  double widthCm, double heightCm, double lengthCm) {
        double volumetricWeight = (lengthCm * widthCm * heightCm) / 5000.0;
        double billableWeight = Math.max(weightKg, volumetricWeight);
        return carrier.getBasePrice() + (carrier.getPricePerKg() * billableWeight);
    }

    private String generateTrackingNumber() {
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        return "MY2TEK-" + uuid;
    }

    private String generateLabel(String trackingNumber, String recipientName,
                                  String destination, String carrierName) {
        return "=== MY2TEK SHIPPING LABEL ===\n" +
               "Tracking  : " + trackingNumber + "\n" +
               "Recipient : " + recipientName + "\n" +
               "To        : " + destination + "\n" +
               "Carrier   : " + carrierName + "\n" +
               "============================";
    }

    private void validateStatusTransition(ShipmentStatus current, ShipmentStatus next) {
        boolean valid = switch (current) {
            case READY_TO_SHIP    -> next == ShipmentStatus.SHIPPED;
            case SHIPPED          -> next == ShipmentStatus.IN_TRANSIT;
            case IN_TRANSIT       -> next == ShipmentStatus.DELIVERED;
            case DELIVERED        -> next == ShipmentStatus.RETURN_REQUESTED;
            case RETURN_REQUESTED -> next == ShipmentStatus.RETURN_SHIPPED;
            case RETURN_SHIPPED   -> next == ShipmentStatus.RETURNED;
            case RETURNED         -> false;
        };
        if (!valid) {
            throw new RuntimeException("Transition de statut invalide: " + current + " → " + next);
        }
    }
}
