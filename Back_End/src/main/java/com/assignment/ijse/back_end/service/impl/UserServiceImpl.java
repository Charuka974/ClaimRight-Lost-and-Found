package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.AuthResponseDTO;
import com.assignment.ijse.back_end.dto.UserDTO;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.entity.enums.UserRole;
import com.assignment.ijse.back_end.exceptions.ResourceNotFound;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.UserService;
import com.assignment.ijse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public UserDTO saveUser(UserDTO userDTO) {
        if (userDTO == null) {
            throw new IllegalArgumentException("UserDTO cannot be null");
        }
        userDTO.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(modelMapper.map(userDTO, User.class));
        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    public AuthResponseDTO updateUser(UserDTO userDTO) {
        if (userDTO == null || userDTO.getUserId() == 0) {
            throw new IllegalArgumentException("UserDTO or User ID cannot be null");
        }

        User existingUser = userRepository.findById(userDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFound("User not found with ID: " + userDTO.getUserId()));

        // Map updates
        User updatedUser = modelMapper.map(userDTO, User.class);

        // Preserve non-editable fields
        updatedUser.setRole(existingUser.getRole());
        updatedUser.setCreatedAt(existingUser.getCreatedAt());
        updatedUser.setActive(existingUser.isActive());

        // Handle password
        if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) {
            // Only encode if new password is different from the current one
            if (!passwordEncoder.matches(userDTO.getPassword(), existingUser.getPassword())) {
                updatedUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            } else {
                updatedUser.setPassword(existingUser.getPassword());
            }
        } else {
            updatedUser.setPassword(existingUser.getPassword()); // keep current password
        }

        // Save updated user
        User savedUser = userRepository.save(updatedUser);

        // Generate a new JWT token (in case username or credentials changed)
        String newToken = jwtUtil.generateToken(savedUser.getUsername());

        // Return both the updated user and new token
        UserDTO updatedDTO = modelMapper.map(savedUser, UserDTO.class);
        return new AuthResponseDTO(newToken, updatedDTO);
    }



    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFound("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .toList();
    }

    @Override
    public List<UserDTO> getUsersByRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be null or empty");
        }
        UserRole userRole;
        try {
            userRole = UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
        List<User> users = userRepository.findUsersByRole(userRole);
        return users.stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .toList();
    }

    @Override
    public List<UserDTO> searchUser(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new IllegalArgumentException("Search keyword cannot be null or empty");
        }
        List<User> users = userRepository.findUserByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                keyword, keyword);
        return users.stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .toList();
    }

    @Override
    public Page<UserDTO> searchUser(String keyword, Pageable pageable) {
        List<UserDTO> filtered = searchUser(keyword);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    @Override
    public void changeUserStatusDeactivate(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFound("User not found with ID: " + id);
        }
        userRepository.deactivateUserById(id);
    }

    @Override
    public void changeUserStatusActivate(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFound("User not found with ID: " + id);
        }
        userRepository.activateUserById(id);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("User not found with ID: " + id));
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public Page<UserDTO> getUsersPages(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("userId").descending());
        Page<User> userPage = userRepository.findAll(pageable);
        return userPage.map(user -> modelMapper.map(user, UserDTO.class));
    }

    @Override
    public void changeUpdateUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFound("User not found with ID: " + userId));

        try {
            UserRole role = UserRole.valueOf(newRole.toUpperCase());
            user.setRole(role);
            userRepository.save(user);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role: " + newRole);
        }
    }


}
