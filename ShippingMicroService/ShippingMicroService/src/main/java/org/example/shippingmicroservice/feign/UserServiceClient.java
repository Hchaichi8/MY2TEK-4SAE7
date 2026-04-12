package org.example.shippingmicroservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

/**
 * Feign client for communicating with UserMicroService.
 *
 * Scenario 1: Verify a user exists by email before creating a shipment.
 * Scenario 2: Get all users (for admin dashboard enrichment).
 */
@FeignClient(
        name = "USERMICROSERVICE",
        configuration = FeignConfig.class
)
public interface UserServiceClient {

    // Scenario 1 — check if a user exists by email
    @GetMapping("/users/by-email/{email}")
    Map<String, Object> getUserByEmail(@PathVariable("email") String email);

    // Scenario 2 — get all users list
    @GetMapping("/users/all")
    List<Map<String, Object>> getAllUsers();
}
