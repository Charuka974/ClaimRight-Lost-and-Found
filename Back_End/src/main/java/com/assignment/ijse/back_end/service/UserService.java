package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    UserDTO saveUser(UserDTO jobDTO);

    UserDTO updateUser(UserDTO jobDTO);

    void deleteUser(int id);

    List<UserDTO> getAllUsers();

    List<UserDTO> searchUser(String keyword);

    public Page<UserDTO> searchUser(String keyword, Pageable pageable);

    void changeUserStatusDeactivate(int id);

    UserDTO getUserById(int id);

    void changeUserStatusActivate(int id);


    Page<UserDTO> getUsersPages(int page, int size);
}
