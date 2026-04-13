package org.example.usermicroservice.Config;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQConsumer {

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void onReviewCreated(String message) {
        System.out.println("📨 UserMicroService received: " + message);
    }
}