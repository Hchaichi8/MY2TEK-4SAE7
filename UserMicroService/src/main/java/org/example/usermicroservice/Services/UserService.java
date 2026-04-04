package org.example.usermicroservice.Services;

import org.example.usermicroservice.DTO.UserDTO;
import org.example.usermicroservice.DTO.UserSyncRequest;
import java.util.List;

public interface UserService {
    UserDTO syncUser(UserSyncRequest request);
    List<UserDTO> getAllUsers();
    UserDTO getUserByKeycloakId(String keycloakId);
    UserDTO updateUser(String keycloakId, UserDTO dto);
    void deleteUser(String keycloakId);
}