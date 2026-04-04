package org.example.ms_competenceandreview.Services.Impl;

import org.example.ms_competenceandreview.Entities.Review;
import org.example.ms_competenceandreview.Repositories.ReviewRepo;
import org.example.ms_competenceandreview.Services.Interface.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import java.util.*;


@Service
public class ReviewServiceImpl implements ReviewService {
    @Autowired
    ReviewRepo reviewRepo;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Override
    public Review AjouterReview(Review review) {
        return reviewRepo.save(review);

    }

    @Override
    public List<Review> GetReviewsByClient(String clientId) {
        return reviewRepo.findByClientId(clientId);
    }

    @Override
    public Review ModifierReview(Review review) {
        return reviewRepo.save(review);
    }

    @Override
    public void SupprimerReview(Long id) {
        reviewRepo.deleteById(id);

    }

    @Override
    public Review GetReview(Long id) {
        return reviewRepo.findById(id).orElseThrow();
    }

    @Override
    public List<Review> GetAllReview() {
        return reviewRepo.findAll();
    }

    @Override
    public String generateEnhancedText(String originalText, Integer rating) {
        RestTemplate restTemplate = new RestTemplate();

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;

        String ratingContext;
        if (rating >= 5) {
            ratingContext = "very satisfied customer (5/5 stars)";
        } else if (rating == 4) {
            ratingContext = "satisfied customer (4/5 stars)";
        } else if (rating == 3) {
            ratingContext = "neutral customer (3/5 stars)";
        } else if (rating == 2) {
            ratingContext = "dissatisfied customer (2/5 stars)";
        } else {
            ratingContext = "very dissatisfied customer (1/5 stars)";
        }

        String prompt = "You are a review assistant for MY2TEK, a Tunisian e-commerce website " +
                "specializing in high-tech products: gaming PCs, GPUs, CPUs, RAM, storage, " +
                "peripherals and accessories.\n\n" +
                "A " + ratingContext + " wrote this product review draft:\n" +
                "\"" + originalText + "\"\n\n" +
                "Your task:\n" +
                "- Rewrite it to sound like a natural, authentic customer review\n" +
                "- Keep the same sentiment and opinion as the original\n" +
                "- Make it clear, specific, and helpful for other buyers\n" +
                "- Keep technical terms if the original mentions them (GPU, FPS, MHz, etc.)\n" +
                "- Write in the same language as the original (French or English)\n" +
                "- Do NOT add fake details the customer didn't mention\n" +
                "- Do NOT use overly marketing language\n" +
                "- Return ONLY the rewritten review text, nothing else\n" +
                "- Keep it between 2-4 sentences maximum";

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> parts = new HashMap<>();
        parts.put("parts", Collections.singletonList(textPart));

        Map<String, Object> contents = new HashMap<>();
        contents.put("contents", Collections.singletonList(parts));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            List candidates = (List) response.getBody().get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map content = (Map) firstCandidate.get("content");
            List partsList = (List) content.get("parts");
            Map firstPart = (Map) partsList.get(0);

            return (String) firstPart.get("text");

        } catch (HttpClientErrorException e) {
            System.err.println("API Error: " + e.getResponseBodyAsString());
            return "Google API Error: " + e.getStatusCode() + " - Check your backend console for details.";
        } catch (Exception e) {
            System.err.println("Unexpected Error: " + e.getMessage());
            return "Unexpected System Error: " + e.getMessage();
        }
    }
}
