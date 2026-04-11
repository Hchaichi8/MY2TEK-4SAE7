package org.example.ms_competenceandreview.Controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.ms_competenceandreview.Config.RabbitMQConfig;
import org.example.ms_competenceandreview.Entities.Review;
import org.example.ms_competenceandreview.OpenFeign.UserClient;
import org.example.ms_competenceandreview.Services.Interface.ReviewService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/Review")
@CrossOrigin(origins = "http://localhost:4200")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserClient userClient;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/enhance")
    public Map<String, String> enhanceReview(@RequestBody Map<String, Object> payload) {
        String text    = (String) payload.get("text");
        Integer rating = Integer.parseInt(payload.get("rating").toString());
        String enhanced = reviewService.generateEnhancedText(text, rating);
        return Collections.singletonMap("enhancedText", enhanced);
    }

    @PostMapping("/AjouterReview")
    public Review AjouterReview(@RequestBody Review review) {
        if (review.getCreatedAt() == null)
            review.setCreatedAt(java.time.LocalDateTime.now());

        if (review.getClientId() != null && !review.getClientId().isEmpty()) {
            try {
                String response  = userClient.getUserByKeycloakId(review.getClientId());
                JsonNode node    = objectMapper.readTree(response);
                String firstName = node.path("firstName").asText("");
                String lastName  = node.path("lastName").asText("");
                String username  = node.path("username").asText("");
                String fullName  = (firstName + " " + lastName).trim();
                review.setClientName(fullName.isEmpty() ? username : fullName);
                System.out.println("✅ OpenFeign success: " + review.getClientName());
            } catch (Exception e) {
                System.out.println("⚠️ OpenFeign failed: " + e.getMessage());
            }
        }

        Review saved = reviewService.AjouterReview(review);

        // ✅ RabbitMQ — publish event
        try {
            String message = "Review #" + saved.getId()
                    + " by " + saved.getClientName()
                    + " on product " + saved.getProductId()
                    + " | Rating: " + saved.getRating() + "/5";

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.ROUTING_KEY,
                    message
            );
            System.out.println("✅ RabbitMQ published: " + message);
        } catch (Exception e) {
            System.out.println("⚠️ RabbitMQ failed: " + e.getMessage());
        }

        return saved;
    }

    @PutMapping("/UpdateMyReview/{id}")
    public Review updateMyReview(@PathVariable Long id, @RequestBody Review review) {
        Review existing = reviewService.GetReview(id);
        existing.setDescription(review.getDescription());
        existing.setRating(review.getRating());
        return reviewService.ModifierReview(existing);
    }

    @DeleteMapping("/DeleteMyReview/{id}")
    public void deleteMyReview(@PathVariable Long id) {
        reviewService.SupprimerReview(id);
    }

    @GetMapping("/GetReview/{id}")
    public Review GetReview(@PathVariable Long id) {
        return reviewService.GetReview(id);
    }

    @GetMapping("/GetAllReview")
    public List<Review> GetAllReview() {
        return reviewService.GetAllReview();
    }

    @GetMapping("/GetReviewsByClient/{id}")
    public List<Review> GetReviewsByClient(@PathVariable String id) {
        return reviewService.GetReviewsByClient(id);
    }
}