package org.example.shippingmicroservice.messaging;

import org.example.shippingmicroservice.config.RabbitMQConfig;
import org.example.shippingmicroservice.dto.ShipmentDeliveredEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * PRODUCER — ShippingMicroService sends messages to RabbitMQ.
 *
 * When a shipment is marked as DELIVERED, this producer
 * publishes an event to the exchange with the routing key.
 * RabbitMQ routes it to the correct queue.
 * UserMicroService (consumer) picks it up asynchronously.
 */
@Service
public class ShipmentEventProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void publishDeliveredEvent(ShipmentDeliveredEvent event) {
        System.out.println("[RabbitMQ Producer] Publishing event: " + event);

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.SHIPMENT_EXCHANGE,   // send to this exchange
                RabbitMQConfig.SHIPMENT_ROUTING_KEY, // with this routing key
                event                                // the message (JSON)
        );

        System.out.println("[RabbitMQ Producer] Event published to queue: "
                + RabbitMQConfig.SHIPMENT_QUEUE);
    }
}
