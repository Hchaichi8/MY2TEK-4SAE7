package org.example.shippingmicroservice.controllers;

import jakarta.validation.Valid;
import org.example.shippingmicroservice.dto.CreateShipmentRequest;
import org.example.shippingmicroservice.dto.ReturnShipmentRequest;
import org.example.shippingmicroservice.dto.UpdateStatusRequest;
import org.example.shippingmicroservice.entities.Shipment;
import org.example.shippingmicroservice.entities.ShipmentAuditLog;
import org.example.shippingmicroservice.entities.ShipmentStatus;
import org.example.shippingmicroservice.services.ShippingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/shipments")
public class ShipmentController {

    @Autowired
    private ShippingService shippingService;

    // POST /shipments
    @PostMapping
    public ResponseEntity<?> createShipment(@Valid @RequestBody CreateShipmentRequest request) {
        try {
            return new ResponseEntity<>(shippingService.createShipment(request), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /shipments
    @GetMapping
    public ResponseEntity<List<Shipment>> getAllShipments() {
        return ResponseEntity.ok(shippingService.getAllShipments());
    }

    // GET /shipments/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getShipmentById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(shippingService.getShipmentById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /shipments/track/{trackingNumber}
    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<?> trackShipment(@PathVariable String trackingNumber) {
        try {
            return ResponseEntity.ok(shippingService.trackByTrackingNumber(trackingNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // GET /shipments/order/{orderId}
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Shipment>> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(shippingService.getShipmentsByOrder(orderId));
    }

    // GET /shipments/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getByStatus(@PathVariable ShipmentStatus status) {
        return ResponseEntity.ok(shippingService.getShipmentsByStatus(status));
    }

    // PUT /shipments/{id} — update shipment details
    @PutMapping("/{id}")
    public ResponseEntity<?> updateShipment(@PathVariable Long id,
                                             @RequestBody CreateShipmentRequest request) {
        try {
            Shipment shipment = shippingService.getShipmentById(id);
            shipment.setRecipientName(request.getRecipientName());
            shipment.setRecipientEmail(request.getRecipientEmail());
            shipment.setDestination(request.getDestination());
            shipment.setWeightKg(request.getWeightKg());
            shipment.setWidthCm(request.getWidthCm());
            shipment.setHeightCm(request.getHeightCm());
            shipment.setLengthCm(request.getLengthCm());
            return ResponseEntity.ok(shippingService.saveShipment(shipment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /shipments/{id}/status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @Valid @RequestBody UpdateStatusRequest request) {
        try {
            Shipment updated = shippingService.updateStatus(
                    id,
                    request.getStatus(),
                    request.getChangedBy(),
                    request.getNote()
            );
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /shipments/return
    @PostMapping("/return")
    public ResponseEntity<?> requestReturn(@Valid @RequestBody ReturnShipmentRequest request) {
        try {
            return ResponseEntity.ok(shippingService.requestReturn(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /shipments/{id}/history
    @GetMapping("/{id}/history")
    public ResponseEntity<List<ShipmentAuditLog>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(shippingService.getAuditLog(id));
    }

    // GET /shipments/track/{trackingNumber}/history
    @GetMapping("/track/{trackingNumber}/history")
    public ResponseEntity<List<ShipmentAuditLog>> getHistoryByTracking(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(shippingService.getAuditLogByTracking(trackingNumber));
    }

    // DELETE /shipments/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShipment(@PathVariable Long id) {
        try {
            shippingService.deleteShipment(id);
            return ResponseEntity.ok("Livraison supprimée avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
