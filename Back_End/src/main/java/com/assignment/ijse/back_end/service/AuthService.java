package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.AuthDTO;
import com.assignment.ijse.back_end.dto.AuthResponseDTO;
import com.assignment.ijse.back_end.dto.RegisterDTO;
import com.assignment.ijse.back_end.entity.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface AuthService {
    public AuthResponseDTO authenticate(AuthDTO authDTO);
    public String register(RegisterDTO registerDTO);
}
