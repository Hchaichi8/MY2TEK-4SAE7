package org.example.usermicroservice.messaging;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * CONSUMER — UserMicroService listens to RabbitMQ.
 *
 * When ShippingMicroService marks a shipment as DELIVERED,
 * it publishes an event to RabbitMQ.
 * This consumer picks it up asynchronously and processes it.
 *
 * This demonstrates async communication between microservices.
 */
@Service
public class ShipmentDeliveredConsumer {

    @RabbitListener(queues = "shipment.delivered.queue")
    public void handleShipmentDelivered(Map<String, Object> event) {
        System.out.println("==============================================");
        System.out.println("[RabbitMQ Consumer] Received shipment delivered event!");
        System.out.println("[RabbitMQ Consumer] Shipment ID    : " + event.get("shipmentId"));
        System.out.println("[RabbitMQ Consumer] Tracking Number: " + event.get("trackingNumber"));
        System.out.println("[RabbitMQ Consumer] Recipient Email: " + event.get("recipientEmail"));
        System.out.println("[RabbitMQ Consumer] Recipient Name : " + event.get("recipientName"));
        System.out.println("[RabbitMQ Consumer] Destination    : " + event.get("destination"));
        System.out.println("[RabbitMQ Consumer] Delivered At   : " + event.get("deliveredAt"));
        System.out.println("==============================================");

        // Here you could:
        // 1. Update user's order status in the database
        // 2. Send a push notification
        // 3. Update loyalty points
        // 4. Trigger a review request email
    }
}
