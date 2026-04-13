package org.example.usermicroservice.Services;

import lombok.RequiredArgsConstructor;
import org.example.usermicroservice.DTO.UserDTO;
import org.example.usermicroservice.DTO.UserSyncRequest;
import org.example.usermicroservice.Entities.Role;
import org.example.usermicroservice.Entities.User;
import org.example.usermicroservice.Repositories.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserDTO syncUser(UserSyncRequest request) {
        return userRepository.findByKeycloakId(request.getKeycloakId())
                .map(existing -> {
                    // Update in case name/email changed in Keycloak
                    if (request.getFirstName() != null) existing.setFirstName(request.getFirstName());
                    if (request.getLastName() != null)  existing.setLastName(request.getLastName());
                    if (request.getEmail() != null)     existing.setEmail(request.getEmail());
                    return toDTO(userRepository.save(existing));
                })
                .orElseGet(() -> {
                    User user = User.builder()
                            .keycloakId(request.getKeycloakId())
                            .firstName(request.getFirstName())
                            .lastName(request.getLastName())
                            .email(request.getEmail())
                            .role(Role.CLIENT)
                            .build();
                    return toDTO(userRepository.save(user));
                });
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found: " + keycloakId));
    }

    private final KeycloakAdminService keycloakAdminService;

    @Override
    public void deleteUser(String keycloakId) {
        keycloakAdminService.deleteUser(keycloakId);
        userRepository.findByKeycloakId(keycloakId)
                .ifPresent(userRepository::delete);
    }

    @Override
    public UserDTO updateUser(String keycloakId, UserDTO dto) {
        // 1. Update local DB
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found: " + keycloakId));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setLocation(dto.getLocation());
        user.setZipCode(dto.getZipCode());
        User saved = userRepository.save(user);

        // 2. Sync name to Keycloak
        keycloakAdminService.updateUser(keycloakId, dto.getFirstName(), dto.getLastName());

        return toDTO(saved);
    }

    private UserDTO toDTO(User u) {
        return UserDTO.builder()
                .id(u.getId()).keycloakId(u.getKeycloakId())
                .firstName(u.getFirstName()).lastName(u.getLastName())
                .email(u.getEmail()).phone(u.getPhone())
                .location(u.getLocation()).zipCode(u.getZipCode())
                .role(u.getRole()).createdAt(u.getCreatedAt())
                .build();
    }
}