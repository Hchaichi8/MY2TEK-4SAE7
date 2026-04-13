  package org.example.ms_commandes.Config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "rabbitmq.enabled", havingValue = "true")
public class RabbitMQConfig {

    @Value("${commandes.rabbitmq.queue:commandes.queue}")
    private String queue;

    @Value("${commandes.rabbitmq.exchange:commandes.exchange}")
    private String exchange;

    @Value("${commandes.rabbitmq.routingkey:commandes.routingkey}")
    private String routingKey;

    // Scénario 2 : commande annulée
    @Value("${commandes.rabbitmq.queue.cancelled:commandes.cancelled.queue}")
    private String queueCancelled;

    @Value("${commandes.rabbitmq.routingkey.cancelled:commandes.cancelled.routingkey}")
    private String routingKeyCancelled;

    // --- Scénario 1 : DELIVERED ---
    @Bean
    public Queue commandesQueue() {
        return new Queue(queue, true);
    }

    // --- Scénario 2 : CANCELLED ---
    @Bean
    public Queue commandesCancelledQueue() {
        return new Queue(queueCancelled, true);
    }

    @Bean
    public TopicExchange commandesExchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Binding bindingDelivered(Queue commandesQueue, TopicExchange commandesExchange) {
        return BindingBuilder.bind(commandesQueue).to(commandesExchange).with(routingKey);
    }

    @Bean
    public Binding bindingCancelled(Queue commandesCancelledQueue, TopicExchange commandesExchange) {
        return BindingBuilder.bind(commandesCancelledQueue).to(commandesExchange).with(routingKeyCancelled);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
