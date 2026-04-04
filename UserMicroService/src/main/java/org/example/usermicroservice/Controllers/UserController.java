package org.example.usermicroservice.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.usermicroservice.DTO.UserDTO;
import org.example.usermicroservice.DTO.UserSyncRequest;
import org.example.usermicroservice.Services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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

    // Get my own profile from token
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getUserByKeycloakId(jwt.getSubject()));
    }

    // Update my profile
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMe(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UserDTO dto) {
        return ResponseEntity.ok(userService.updateUser(jwt.getSubject(), dto));
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
}