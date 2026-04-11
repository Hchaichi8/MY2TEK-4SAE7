package org.example.ms_commandes.Feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

/**
 * Scénario 1 — OpenFeign (communication synchrone)
 * MS_Commandes appelle UserMicroService pour vérifier qu'un utilisateur existe.
 * On utilise GET /users/all qui existe déjà dans UserController.
 * "USERMICROSERVICE" = spring.application.name du UserMicroService dans Eureka.
 */
@FeignClient(name = "USERMICROSERVICE", fallback = UserClientFallback.class)
public interface UserClient {

    /**
     * Récupère tous les utilisateurs depuis UserMicroService.
     * Utilisé pour vérifier si le clientId (email) existe parmi les users.
     */
    @GetMapping("/users/all")
    List<Map<String, Object>> getAllUsers();
}
