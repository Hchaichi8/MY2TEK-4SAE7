package org.example.usermicroservice.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.usermicroservice.Config.RabbitMQConfig;
import org.example.usermicroservice.DTO.UserDTO;
import org.example.usermicroservice.DTO.UserSyncRequest;
import org.example.usermicroservice.OpenFeign.ReviewClient;
import org.example.usermicroservice.Services.KeycloakAdminService;
import org.example.usermicroservice.Services.UserService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final KeycloakAdminService keycloakAdminService;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private ReviewClient reviewClient;
    // ✅ Add this endpoint — called by OpenFeign from ReviewMicroservice
    @GetMapping("/feign/{keycloakId}")
    public ResponseEntity<UserDTO> getUserForFeign(@PathVariable String keycloakId) {
        return ResponseEntity.ok(userService.getUserByKeycloakId(keycloakId));
    }
    // Called after login — creates local profile if first time
    @PostMapping("/sync")
    public ResponseEntity<UserDTO> syncUser(@AuthenticationPrincipal Jwt jwt) {
        UserSyncRequest req = new UserSyncRequest(
                jwt.getSubject(),
                jwt.getClaimAsString("given_name"),
                jwt.getClaimAsString("family_name"),
                jwt.getClaimAsString("email")
        );
        return ResponseEntity.ok(userService.syncUser(req));
    }
    @GetMapping("/me/reviews")
    public ResponseEntity<Map<String, Object>> getMyReviews(
            @AuthenticationPrincipal Jwt jwt) {

        String keycloakId = jwt.getSubject();

        // Auto-sync here too
        UserSyncRequest req = new UserSyncRequest(
                keycloakId,
                jwt.getClaimAsString("given_name"),
                jwt.getClaimAsString("family_name"),
                jwt.getClaimAsString("email")
        );
        UserDTO user = userService.syncUser(req);

        Map<String, Object> result = new HashMap<>();
        result.put("user", user);

        // ✅ OpenFeign call to ReviewMicroservice
        try {
            String reviewsJson = reviewClient.getReviewsByClient(keycloakId);
            Object reviews = objectMapper.readValue(reviewsJson, Object.class);
            result.put("reviews", reviews);
            System.out.println("✅ OpenFeign: Got reviews for " + user.getFirstName());
        } catch (Exception e) {
            System.out.println("⚠️ OpenFeign reviews failed: " + e.getMessage());
            result.put("reviews", List.of());
        }

        return ResponseEntity.ok(result);
    }

    // Get my own profile from token — auto-sync if first time (Google login, etc.)
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal Jwt jwt) {
        UserSyncRequest req = new UserSyncRequest(
                jwt.getSubject(),
                jwt.getClaimAsString("given_name"),
                jwt.getClaimAsString("family_name"),
                jwt.getClaimAsString("email")
        );
        return ResponseEntity.ok(userService.syncUser(req));
    }

    // Update my profile
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMe(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UserDTO dto) {

        UserDTO updated = userService.updateUser(jwt.getSubject(), dto);

        // ✅ RabbitMQ Scenario 2 — notify ReviewMicroservice name changed
        try {
            String message = jwt.getSubject()
                    + ":" + updated.getFirstName()
                    + " " + updated.getLastName();

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EXCHANGE,
                    RabbitMQConfig.USER_ROUTING_KEY,
                    message
            );
            System.out.println("✅ RabbitMQ: User update published → " + message);
        } catch (Exception e) {
            System.out.println("⚠️ RabbitMQ user update failed: " + e.getMessage());
        }

        return ResponseEntity.ok(updated);
    }

    // Admin — list all
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Admin — delete
    @DeleteMapping("/{keycloakId}")
    public ResponseEntity<Void> delete(@PathVariable String keycloakId) {
        userService.deleteUser(keycloakId);
        return ResponseEntity.noContent().build();
    }

    // Admin — update any user
    @PutMapping("/{keycloakId}")
    public ResponseEntity<UserDTO> updateByAdmin(
            @PathVariable String keycloakId,
            @RequestBody UserDTO dto) {
        return ResponseEntity.ok(userService.updateUser(keycloakId, dto));
    }

    @GetMapping("/keycloak/all")
    public ResponseEntity<List<Map<String, Object>>> getAllFromKeycloak() {
        return ResponseEntity.ok(keycloakAdminService.getAllUsersFromKeycloak());
    }
}