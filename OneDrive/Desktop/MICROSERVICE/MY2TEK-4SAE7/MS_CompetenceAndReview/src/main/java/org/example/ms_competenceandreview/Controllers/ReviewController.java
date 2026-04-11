package org.example.ms_competenceandreview.Controllers;


import org.example.ms_competenceandreview.Entities.Review;

import org.example.ms_competenceandreview.Services.Interface.ReviewService;
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
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/enhance")
    public Map<String, String> enhanceReview(@RequestBody Map<String, Object> payload) {
        String text = (String) payload.get("text");
        Integer rating = Integer.parseInt(payload.get("rating").toString());

        String enhanced = reviewService.generateEnhancedText(text, rating);
        return Collections.singletonMap("enhancedText", enhanced);
    }

    @PostMapping("/AjouterReview")
    public Review AjouterReview(@RequestBody Review a) {
        if(a.getCreatedAt() == null) a.setCreatedAt(java.time.LocalDateTime.now());
        return reviewService.AjouterReview(a);
    }

    @PutMapping("/ModifierReview")
    public Review ModifierReview(@RequestBody Review a) {
        return reviewService.ModifierReview(a);
    }


    @DeleteMapping("/SupprimerReview/{id}")
    public void SupprimerReview(@PathVariable Long id) {
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