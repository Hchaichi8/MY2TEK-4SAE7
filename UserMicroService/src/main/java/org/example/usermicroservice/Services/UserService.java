package org.example.usermicroservice.Services;

import org.example.usermicroservice.Entities.Role;
import org.example.usermicroservice.Entities.User;
import org.example.usermicroservice.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;
import java.util.UUID;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User loginWithGoogle(String idTokenString) {
        try {
            // Remplacer par ton vrai Client ID Google
            String CLIENT_ID = "1082853601475-srb651krqb3hrofil6or420qsuhi03o8.apps.googleusercontent.com";
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                Payload payload = idToken.getPayload();
                String email = payload.getEmail();

                return userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFirstName((String) payload.get("given_name"));
                    newUser.setLastName((String) payload.get("family_name"));
                    newUser.setPassword(passwordEncoder.encode("GOOGLE_USER_" + UUID.randomUUID()));
                    newUser.setRole(Role.CLIENT);
                    return userRepository.save(newUser);
                });
            } else {
                throw new RuntimeException("Token Google invalide.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la vérification Google : " + e.getMessage());
        }
    }

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé !");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User loginUser(User loginData) {
        Optional<User> userOpt = userRepository.findByEmail(loginData.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(loginData.getPassword(), user.getPassword())) {
                return user; // Succès
            }
        }
        throw new RuntimeException("Email ou mot de passe incorrect.");
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur introuvable.");
        }
        userRepository.deleteById(id);
    }

    public User updateUser(Long id, User userDetails) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));

        existingUser.setFirstName(userDetails.getFirstName());
        existingUser.setLastName(userDetails.getLastName());
        existingUser.setLocation(userDetails.getLocation());

        return userRepository.save(existingUser);
    }

    @Autowired
    private JavaMailSender mailSender;

    public void sendForgotPasswordEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec cet email."));

        // Construction de l'email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("MY2TECK");
        message.setTo(email);
        message.setSubject("Réinitialisation de votre mot de passe - MY2TEK");

        // Le lien renvoie vers ton futur composant Angular de réinitialisation
        String resetLink = "http://localhost:4200/reset-password?email=" + email;

        message.setText("Bonjour " + user.getFirstName() + ",\n\n" +
                "Vous avez demandé la réinitialisation de votre mot de passe MY2TEK.\n" +
                "Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :\n" +
                resetLink + "\n\n" +
                "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.");

        mailSender.send(message);
    }
    public void updatePasswordByEmail(String email, String newPassword) {
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setPassword(passwordEncoder.encode(newPassword)); // INDISPENSABLE
        userRepository.save(user);
    }
}