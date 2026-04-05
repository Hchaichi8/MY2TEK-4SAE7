package org.example.ms_competenceandreview.OpenFeign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "USERMICROSERVICE", url = "http://localhost:8083")
public interface UserClient {
    // ✅ Return String — always works, no converter needed
    @GetMapping("/users/feign/{keycloakId}")
    String getUserByKeycloakId(@PathVariable("keycloakId") String keycloakId);
}