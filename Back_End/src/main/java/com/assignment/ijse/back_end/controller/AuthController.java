package com.assignment.ijse.securebackend.controller;


import com.assignment.ijse.securebackend.dto.AuthDTO;
import com.assignment.ijse.securebackend.dto.RegisterDTO;
import com.assignment.ijse.securebackend.service.impl.AuthService;
import com.assignment.ijse.securebackend.util.APIResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://127.0.0.1:5500")
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
    public ResponseEntity<APIResponse> loginUser(@RequestBody AuthDTO registerDTO) {
        return ResponseEntity.ok(
            new APIResponse(
                    200,
                    "OK",
                    authService.authenticate(registerDTO)));
    }

}
