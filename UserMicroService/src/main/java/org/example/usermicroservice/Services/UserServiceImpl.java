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
                .map(this::toDTO)
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

    @Override
    public UserDTO updateUser(String keycloakId, UserDTO dto) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found: " + keycloakId));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setLocation(dto.getLocation());
        user.setZipCode(dto.getZipCode());
        return toDTO(userRepository.save(user));
    }

    @Override
    public void deleteUser(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found: " + keycloakId));
        userRepository.delete(user);
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