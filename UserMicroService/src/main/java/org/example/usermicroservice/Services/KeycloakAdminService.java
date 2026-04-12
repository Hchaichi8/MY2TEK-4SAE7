package org.example.usermicroservice.Services;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.admin.server-url}")
    private String serverUrl;

    @Value("${keycloak.admin.realm}")
    private String realm;

    @Value("${keycloak.admin.client-id}")
    private String clientId;

    @Value("${keycloak.admin.username}")
    private String username;

    @Value("${keycloak.admin.password}")
    private String password;

    private Keycloak getKeycloakInstance() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master")           // always master for admin-cli
                .clientId(clientId)
                .username(username)
                .password(password)
                .build();
    }

    public void deleteUser(String keycloakId) {
        try (Keycloak keycloak = getKeycloakInstance()) {
            keycloak.realm(realm).users().delete(keycloakId);
            System.out.println("✅ Keycloak user deleted: " + keycloakId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user from Keycloak: " + e.getMessage());
        }
    }

    public void updateUser(String keycloakId, String firstName, String lastName) {
        try (Keycloak keycloak = getKeycloakInstance()) {
            var userResource = keycloak.realm(realm).users().get(keycloakId);
            var userRep = userResource.toRepresentation();
            userRep.setFirstName(firstName);
            userRep.setLastName(lastName);
            userResource.update(userRep);
            System.out.println("✅ Keycloak user updated: " + keycloakId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user in Keycloak: " + e.getMessage());
        }
    }
    public List<Map<String, Object>> getAllUsersFromKeycloak() {
        try (Keycloak keycloak = getKeycloakInstance()) {
            return keycloak.realm(realm).users().list()
                    .stream()
                    .map(u -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("keycloakId", u.getId());
                        map.put("firstName",  u.getFirstName());
                        map.put("lastName",   u.getLastName());
                        map.put("email",      u.getEmail());
                        map.put("username",   u.getUsername());
                        map.put("enabled",    u.isEnabled());
                        map.put("createdAt",  u.getCreatedTimestamp());
                        return map;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch users from Keycloak: " + e.getMessage());
        }
    }
}