package org.example.shippingmicroservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Queue name — where messages are stored
    public static final String SHIPMENT_QUEUE = "shipment.delivered.queue";

    // Exchange name — the router that receives messages and sends to queues
    public static final String SHIPMENT_EXCHANGE = "shipment.exchange";

    // Routing key — links the exchange to the queue
    public static final String SHIPMENT_ROUTING_KEY = "shipment.delivered";

    // Declare the queue (durable = survives RabbitMQ restart)
    @Bean
    public Queue shipmentQueue() {
        return new Queue(SHIPMENT_QUEUE, true);
    }

    // Declare a Topic Exchange (allows pattern-based routing)
    @Bean
    public TopicExchange shipmentExchange() {
        return new TopicExchange(SHIPMENT_EXCHANGE);
    }

    // Bind the queue to the exchange with the routing key
    @Bean
    public Binding shipmentBinding(Queue shipmentQueue, TopicExchange shipmentExchange) {
        return BindingBuilder
                .bind(shipmentQueue)
                .to(shipmentExchange)
                .with(SHIPMENT_ROUTING_KEY);
    }

    // Use JSON converter so messages are readable in RabbitMQ management UI
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // Configure RabbitTemplate to use JSON converter
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
