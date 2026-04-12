package org.example.shippingmicroservice.controllers;

import org.example.shippingmicroservice.feign.UserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/shipments")
@CrossOrigin(origins = "http://localhost:4200")

public class WelcomeController {

    // Injected from Config Server via spring.cloud.config
    @Value("${welcome.message:Welcome to ShippingMicroService}")
    private String welcomeMessage;

    @Autowired
    private UserServiceClient userServiceClient;

    /**
     * GET /shipments/welcome
     * Shows the welcome message loaded from Config Server.
     */
    @GetMapping("/welcome")
    public Map<String, String> welcome() {
        Map<String, String> response = new HashMap<>();
        response.put("message", welcomeMessage);
        response.put("service", "ShippingMicroService");
        return response;
    }

    /**
     * GET /shipments/users
     * Scenario 2 — Feign call to UserMicroService to get all users.
     * Demonstrates inter-service communication via OpenFeign.
     */
    @GetMapping("/users")
    public List<Map<String, Object>> getUsersViaFeign() {
        return userServiceClient.getAllUsers();
    }
}
