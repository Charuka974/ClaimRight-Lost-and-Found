package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.AuthDTO;
import com.assignment.ijse.back_end.dto.AuthResponseDTO;
import com.assignment.ijse.back_end.dto.RegisterDTO;
import com.assignment.ijse.back_end.dto.UserDTO;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.entity.UserRole;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.AuthService;
import com.assignment.ijse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponseDTO authenticate(AuthDTO authDTO) {
        User user = userRepository.findByEmail(authDTO.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername());
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        return new AuthResponseDTO(token, userDTO);
    }



    @Override
    public String register(RegisterDTO registerDTO) {
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = User.builder()
                .username(registerDTO.getUsername())
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(UserRole.valueOf(registerDTO.getRole()))
                .phoneNumber(registerDTO.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .isActive("USER".equalsIgnoreCase(registerDTO.getRole()))
                .build();
        userRepository.save(user);
        return "User registered successfully";
    }



}
