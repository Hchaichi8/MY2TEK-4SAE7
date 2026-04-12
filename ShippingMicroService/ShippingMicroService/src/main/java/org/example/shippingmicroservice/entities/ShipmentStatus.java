package org.example.shippingmicroservice.entities;

public enum ShipmentStatus {
    // Forward flow
    READY_TO_SHIP,
    SHIPPED,
    IN_TRANSIT,
    DELIVERED,

    // Return flow
    RETURN_REQUESTED,
    RETURN_SHIPPED,
    RETURNED
}
