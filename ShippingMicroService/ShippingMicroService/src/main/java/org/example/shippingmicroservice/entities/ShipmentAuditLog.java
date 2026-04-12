package org.example.shippingmicroservice.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_audit_log")
public class ShipmentAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long shipmentId;

    @Column(nullable = false)
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus toStatus;

    @Column(nullable = false)
    private String changedBy;

    @Column(length = 500)
    private String note;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    public ShipmentAuditLog() {}

    public ShipmentAuditLog(Long shipmentId, String trackingNumber,
                             ShipmentStatus fromStatus, ShipmentStatus toStatus,
                             String changedBy, String note) {
        this.shipmentId = shipmentId;
        this.trackingNumber = trackingNumber;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedBy = changedBy;
        this.note = note;
        this.changedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public ShipmentStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(ShipmentStatus fromStatus) { this.fromStatus = fromStatus; }
    public ShipmentStatus getToStatus() { return toStatus; }
    public void setToStatus(ShipmentStatus toStatus) { this.toStatus = toStatus; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
