package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.AuthDTO;
import com.assignment.ijse.back_end.dto.AuthResponseDTO;
import com.assignment.ijse.back_end.dto.RegisterDTO;
import com.assignment.ijse.back_end.dto.UserDTO;
import com.assignment.ijse.back_end.entity.PasswordResetToken;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.entity.enums.UserRole;
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

        user.setPassword(null); // Don't expose password in response

        String token = jwtUtil.generateToken(user.getEmail());
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);
        userDTO.setPassword(null); // Don't expose password in response

        return new AuthResponseDTO(token, userDTO);
    }

    @Override
    public String register(RegisterDTO registerDTO) {
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        boolean isFirstUser = userRepository.count() == 0;

        User user = User.builder()
                .username(registerDTO.getUsername())
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(isFirstUser ? UserRole.ADMIN : UserRole.USER) // ADMIN if first user
                .phoneNumber(registerDTO.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();

        userRepository.save(user);
        return "User registered successfully";
    }



//    @Override
//    public String register(RegisterDTO registerDTO) {
//        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
//            throw new RuntimeException("Email already exists");
//        }
//        User user = User.builder()
//                .username(registerDTO.getUsername())
//                .email(registerDTO.getEmail())
//                .password(passwordEncoder.encode(registerDTO.getPassword()))
//                .role(UserRole.USER) // Default role
//                .phoneNumber(registerDTO.getPhoneNumber())
//                .createdAt(LocalDateTime.now())
//                .isActive(true)
//                .build();
//        userRepository.save(user);
//        return "User registered successfully";
//    }

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

        String htmlContent = """
        <div style="background-color: #f8f9fc; padding: 30px; border-radius: 12px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2e4374; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://i.ibb.co/twfxkRqj/Chat-GPT-Image-Jul-24-2025-11-16-54-AM.png" alt="ClaimRight Logo" style="width: 100px; border-radius: 50%%; box-shadow: 0 4px 10px rgba(78, 115, 223, 0.3);" />
            </div>
            <h2 style="color: #2e4374; font-weight: 700;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #333;">Hi there,</p>
            <p style="font-size: 15px; line-height: 1.6;">
                We received a request to reset your ClaimRight password. Click the button below to proceed:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="%s" style="
                    background-color: #4e73df;
                    color: white;
                    padding: 12px 25px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: bold;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(78, 115, 223, 0.3);
                ">
                    Reset Password
                </a>
            </div>
            <p style="font-size: 14px; color: #666;">
                This link will expire in 30 minutes. If you did not request a password reset, you can safely ignore this email.
            </p>
            <p style="margin-top: 30px; font-size: 14px; color: #999;">
                — ClaimRight Team
            </p>
        </div>
    """.formatted(resetLink);

        emailService.sendHtmlMail(user.getEmail(), "ClaimRight Reset Password", htmlContent);

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
