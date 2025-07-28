package com.assignment.ijse.back_end.controller;


import com.assignment.ijse.back_end.dto.AuthDTO;
import com.assignment.ijse.back_end.dto.AuthResponseDTO;
import com.assignment.ijse.back_end.dto.RegisterDTO;
import com.assignment.ijse.back_end.entity.PasswordResetToken;
import com.assignment.ijse.back_end.service.AuthService;
import com.assignment.ijse.back_end.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;


@RestController
@RequestMapping("/claimrightauth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<APIResponse> registerUser(@RequestBody RegisterDTO registerDTO) {
        return ResponseEntity.ok(
            new APIResponse(
                    200,
                    "OK",
                    authService.register(registerDTO)));
    }

    @PostMapping("/login")
    public ResponseEntity<APIResponse<AuthResponseDTO>> loginUser(@RequestBody AuthDTO authDTO) {
        AuthResponseDTO response = authService.authenticate(authDTO);
        return ResponseEntity.ok(new APIResponse<>(200, "Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<APIResponse<String>> logoutUser(@RequestHeader("Authorization") String token) {
//        authService.logout(token);
        return ResponseEntity.ok(new APIResponse<>(200, "Logout successful", "You have been logged out successfully."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<APIResponse<String>> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        String result = authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(new APIResponse<>(200, "OK", result));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<APIResponse<String>> forgotPassword(@RequestParam String email) {
        String result = authService.forgotPassword(email);
        return ResponseEntity.ok(new APIResponse<>(200, "Email Sent", result));
    }





}
