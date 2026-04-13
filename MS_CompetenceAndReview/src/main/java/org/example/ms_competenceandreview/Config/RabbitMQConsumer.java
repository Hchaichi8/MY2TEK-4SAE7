package org.example.ms_competenceandreview.Config;


import org.example.ms_competenceandreview.Repositories.ReviewRepo;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQConsumer {

    @Autowired
    private ReviewRepo reviewRepository;

    @RabbitListener(queues = "user.queue")
    public void onUserUpdated(String message) {
        System.out.println("📨 ReviewMicroservice received user update: " + message);

        // message format: "keycloakId:FirstName LastName"
        try {
            String[] parts = message.split(":", 2);
            if (parts.length == 2) {
                String keycloakId = parts[0];
                String newName    = parts[1].trim();

                // ✅ Update clientName in ALL reviews by this user
                var reviews = reviewRepository.findByClientId(keycloakId);
                reviews.forEach(r -> r.setClientName(newName));
                reviewRepository.saveAll(reviews);

                System.out.println("✅ Updated " + reviews.size()
                        + " reviews with new name: " + newName);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Failed to process user update: " + e.getMessage());
        }
    }
}