package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.AuthResponseDTO;
import com.assignment.ijse.back_end.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    UserDTO saveUser(UserDTO jobDTO);

    AuthResponseDTO updateUser(UserDTO jobDTO);

    void deleteUser(Long id);

    List<UserDTO> getAllUsers();

    List<UserDTO> getUsersByRole(String role);

    List<UserDTO> searchUser(String keyword);

    public Page<UserDTO> searchUser(String keyword, Pageable pageable);

    void changeUserStatusDeactivate(Long id);

    UserDTO getUserById(Long id);

    void changeUserStatusActivate(Long id);

    void changeUpdateUserRole(Long userId, String newRole);

    Page<UserDTO> getUsersPages(int page, int size);
}
