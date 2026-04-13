package org.example.usermicroservice.Config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.support.converter.SimpleMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE       = "review.queue";
    public static final String EXCHANGE    = "review.exchange";
    public static final String ROUTING_KEY = "review.created";

    public static final String USER_QUEUE       = "user.queue";
    public static final String USER_EXCHANGE    = "user.exchange";
    public static final String USER_ROUTING_KEY = "user.updated";

    // ✅ Declare queue here too — creates it if doesn't exist
    @Bean
    public Queue reviewQueue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public TopicExchange reviewExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Binding binding(Queue reviewQueue, TopicExchange reviewExchange) {
        return BindingBuilder
                .bind(reviewQueue)
                .to(reviewExchange)
                .with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new SimpleMessageConverter();
    }



    @Bean
    public Queue userQueue() {
        return new Queue(USER_QUEUE, true);
    }

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public Binding userBinding(Queue userQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userQueue).to(userExchange).with(USER_ROUTING_KEY);
    }
}
