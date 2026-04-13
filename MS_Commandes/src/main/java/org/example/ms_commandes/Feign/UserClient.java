package org.example.ms_commandes.Feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "UserMicroService", fallback = UserClientFallback.class)
public interface UserClient {

    // GET /users — liste tous les users (endpoint réel de UserMicroService)
    @GetMapping("/users")
    List<Map<String, Object>> getAllUsers();

    // GET /users/feign/{keycloakId} — récupérer un user par son sub Keycloak
    @GetMapping("/users/feign/{keycloakId}")
    Map<String, Object> getUserByKeycloakId(@PathVariable("keycloakId") String keycloakId);
}
