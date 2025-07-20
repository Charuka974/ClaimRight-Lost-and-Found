package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.UserDTO;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public UserDTO saveUser(UserDTO userDTO) {
        User savedUser = userRepository.save(modelMapper.map(userDTO, User.class));
        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    public UserDTO updateUser(UserDTO userDTO) {
        User savedUser = userRepository.save(modelMapper.map(userDTO, User.class));
        return modelMapper.map(savedUser, UserDTO.class);
    }

    @Override
    public void deleteUser(int id) {
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
        List<User> users = userRepository.findUserByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                keyword, keyword);
        return users.stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .toList();
    }

    @Override
    public Page<UserDTO> searchUser(String keyword, Pageable pageable) {
        List<UserDTO> filtered = searchUser(keyword);
        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    @Override
    public void changeUserStatusDeactivate(int id) {
        userRepository.deactivateUserById(id);
    }

    @Override
    public UserDTO getUserById(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public void changeUserStatusActivate(int id) {
        userRepository.activateUserById(id);
    }

    @Override
    public Page<UserDTO> getUsersPages(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserDTO> dtoList = userPage.getContent()
                .stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .toList();
        return new PageImpl<>(dtoList, pageable, userPage.getTotalElements());
    }
}
