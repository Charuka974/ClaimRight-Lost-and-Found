package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.UserDTO;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.exceptions.ResourceNotFound;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

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
    public UserDTO updateUser(UserDTO userDTO) {
        if (userDTO == null || userDTO.getUserId() == 0) {
            throw new IllegalArgumentException("UserDTO or User ID cannot be null");
        }

        User existingUser = userRepository.findById(userDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFound("User not found with ID: " + userDTO.getUserId()));

        User updatedUser = modelMapper.map(userDTO, User.class);
        updatedUser.setRole(existingUser.getRole()); // preserve role
        updatedUser.setCreatedAt(existingUser.getCreatedAt()); // preserve createdAt
        User savedUser = userRepository.save(updatedUser);
        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    public void deleteUser(int id) {
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
    public void changeUserStatusDeactivate(int id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFound("User not found with ID: " + id);
        }
        userRepository.deactivateUserById(id);
    }

    @Override
    public void changeUserStatusActivate(int id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFound("User not found with ID: " + id);
        }
        userRepository.activateUserById(id);
    }

    @Override
    public UserDTO getUserById(int id) {
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

}
