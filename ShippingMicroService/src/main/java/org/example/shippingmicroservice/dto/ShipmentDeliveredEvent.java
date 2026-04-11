package org.example.shippingmicroservice.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Message sent to RabbitMQ when a shipment is delivered.
 * UserMicroService will consume this event.
 */
public class ShipmentDeliveredEvent implements Serializable {

    private Long shipmentId;
    private String trackingNumber;
    private String recipientEmail;
    private String recipientName;
    private String destination;
    private LocalDateTime deliveredAt;

    public ShipmentDeliveredEvent() {}

    public ShipmentDeliveredEvent(Long shipmentId, String trackingNumber,
                                   String recipientEmail, String recipientName,
                                   String destination) {
        this.shipmentId = shipmentId;
        this.trackingNumber = trackingNumber;
        this.recipientEmail = recipientEmail;
        this.recipientName = recipientName;
        this.destination = destination;
        this.deliveredAt = LocalDateTime.now();
    }

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    @Override
    public String toString() {
        return "ShipmentDeliveredEvent{" +
                "shipmentId=" + shipmentId +
                ", trackingNumber='" + trackingNumber + '\'' +
                ", recipientEmail='" + recipientEmail + '\'' +
                ", deliveredAt=" + deliveredAt +
                '}';
    }
}
