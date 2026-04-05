package org.example.usermicroservice.OpenFeign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "MSCompetenceAndReview", url = "http://localhost:8084")
public interface ReviewClient {
    @GetMapping("/Review/GetReviewsByClient/{clientId}")
    String getReviewsByClient(@PathVariable("clientId") String clientId);
}