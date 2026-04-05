package org.example.usermicroservice.Controllers;


import org.example.usermicroservice.Entities.SecurityConfig;
import org.example.usermicroservice.Entities.User;
import org.example.usermicroservice.Repositories.UserRepository;
import org.example.usermicroservice.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private SecurityConfig jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        try {
            User loggedInUser = userService.loginUser(loginData);

            // 🟢 On génère le token sécurisé
            String token = jwtUtil.generateToken(
                    loggedInUser.getId(),
                    loggedInUser.getEmail(),
                    loggedInUser.getFirstName(),
                    loggedInUser.getLastName(),
                    loggedInUser.getRole().name()
            );


            return ResponseEntity.ok(Collections.singletonMap("token", token));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Called by ShippingMicroService via OpenFeign (Scenario 1)
    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Utilisateur supprimé avec succès.");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            // 1. Mise à jour en base de données via ton service
            User updatedUser = userService.updateUser(id, userDetails);

            // 2. Génération du nouveau token avec les données fraîches
            String newToken = jwtUtil.generateToken(
                    updatedUser.getId(),
                    updatedUser.getEmail(),
                    updatedUser.getFirstName(),
                    updatedUser.getLastName(),
                    updatedUser.getRole().name()
            );

            // 3. Préparation de la réponse
            Map<String, Object> response = new HashMap<>();
            response.put("user", updatedUser);
            response.put("token", newToken); // On renvoie le token ici !

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            userService.sendForgotPasswordEmail(email);
            return ResponseEntity.ok(Collections.singletonMap("message", "Email envoyé avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("newPassword");

        try {
            // Appelle ton service qui fait le passwordEncoder.encode() et le save()
            userService.updatePasswordByEmail(email, newPassword);
            return ResponseEntity.ok(Collections.singletonMap("message", "Success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        try {
            String googleToken = payload.get("token");

            User user = userService.loginWithGoogle(googleToken);

            String token = jwtUtil.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole().name()
            );

            return ResponseEntity.ok(Collections.singletonMap("token", token));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

}
