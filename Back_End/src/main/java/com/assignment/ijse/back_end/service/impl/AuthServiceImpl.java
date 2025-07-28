package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.AuthDTO;
import com.assignment.ijse.back_end.dto.AuthResponseDTO;
import com.assignment.ijse.back_end.dto.RegisterDTO;
import com.assignment.ijse.back_end.dto.UserDTO;
import com.assignment.ijse.back_end.entity.PasswordResetToken;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.entity.UserRole;
import com.assignment.ijse.back_end.repository.PasswordResetTokenRepository;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.AuthService;
import com.assignment.ijse.back_end.service.EmailService;
import com.assignment.ijse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;


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

    @Override
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check for existing token for the user
        Optional<PasswordResetToken> existingTokenOpt = passwordResetTokenRepository.findByUser(user);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken;
        if (existingTokenOpt.isPresent()) {
            // Update existing token
            resetToken = existingTokenOpt.get();
            resetToken.setToken(token);
            resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        } else {
            // Create new token
            resetToken = new PasswordResetToken();
            resetToken.setToken(token);
            resetToken.setUser(user);
            resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        }

        passwordResetTokenRepository.save(resetToken);

        String resetLink = "http://127.0.0.1:5501/Front_End/html/reset-new-password.html?token=" + token;
        emailService.sendSimpleMail(user.getEmail(), "Reset Password", "Click to reset: " + resetLink);

        return "Reset email sent to " + email;
    }


    @Override
    public String resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken); // Clean up token

        return "Password reset successful";
    }




}
