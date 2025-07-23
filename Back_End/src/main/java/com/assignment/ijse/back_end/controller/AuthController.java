package com.assignment.ijse.back_end.controller;


import com.assignment.ijse.back_end.dto.AuthDTO;
import com.assignment.ijse.back_end.dto.AuthResponseDTO;
import com.assignment.ijse.back_end.dto.RegisterDTO;
import com.assignment.ijse.back_end.service.AuthService;
import com.assignment.ijse.back_end.util.APIResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/claimrightauth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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


}
