package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.AuthResponseDTO;
import com.assignment.ijse.back_end.dto.UserDTO;
import com.assignment.ijse.back_end.service.ImgBBUploadService;
import com.assignment.ijse.back_end.service.UserService;
import com.assignment.ijse.back_end.util.APIResponse;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("claimright/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {
//    @Autowired
    private final UserService userService;
    private final ImgBBUploadService imgBBUploadService;

//    @Value("${cloudinary.cloud_name}")
//    private String cloudName;
//    @Value("${cloudinary.api_key}")
//    private String apiKey;
//    @Value("${cloudinary.api_secret}")
//    private String apiSecret;



//    @PostMapping("/validate")
//    public ResponseEntity<APIResponse<UserDTO>> validateUser(@RequestBody UserDTO loginRequest) {
//        String email = loginRequest.getEmail();
//        String password = loginRequest.getPassword();
//        // Optional: log email for debugging (never log passwords)
//        log.info("Attempting login for email: {}", email);
//        UserDTO matchedUser = userService.getAllUsers().stream()
//                .filter(user -> user.getEmail().equalsIgnoreCase(email) && user.getPassword().equals(password))
//                .findFirst()
//                .orElse(null);
//
//        if (matchedUser == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                    .body(new APIResponse<>(401, "Invalid credentials", null));
//        }
//        return ResponseEntity.ok(new APIResponse<>(200, "User validated successfully", matchedUser));
//    }

//    @PostMapping("/create")
//    public ResponseEntity<APIResponse<UserDTO>> createUser(@RequestBody UserDTO UserDTO) {
//        log.info("User Created Successfully !");
//        log.debug("User Details: {}", UserDTO);
//        log.warn("This is a warning message for User creation");
//        log.error("This is an error message for User creation");
//        log.trace("This is a trace message for User creation");
//
//        UserDTO.setActive(true); // Set the User as active by default
//        UserDTO savedUser = userService.saveUser(UserDTO);
//
//        return ResponseEntity.ok(new APIResponse<>(
//                200, "User Saved Successfully", savedUser
//        ));
//    }

    @GetMapping("/get-all")
    public ResponseEntity<APIResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> UserDTOs = userService.getAllUsers();
        return ResponseEntity.ok(new APIResponse<>(
                200, "User List Fetched Successfully", UserDTOs
        ));
    }

    @PutMapping("/update")
    public ResponseEntity<APIResponse<AuthResponseDTO>> updateUser(
            @RequestPart("user") UserDTO userDTO,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {

        try {
            if (profilePicture != null && !profilePicture.isEmpty()) {
                // Upload to ImgBB using your service
                byte[] bytes = profilePicture.getBytes();
                String uploadedUrl = imgBBUploadService.uploadToImgBB(bytes, profilePicture.getOriginalFilename()).block();

                // Set uploaded image URL to user
                userDTO.setProfilePictureUrl(uploadedUrl);
            }

            AuthResponseDTO response = userService.updateUser(userDTO);
            return ResponseEntity.ok(new APIResponse<>(200, "User updated successfully", response));

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(new APIResponse<>(400, "Error updating user: " + e.getMessage(), null));
        }
    }



    //    // Delete User - we use a put mapping here for delete operation
//    @PutMapping("/delete/{id}")
//    public ResponseEntity<APIResponse<List<UserDTO>>> deleteUser(@PathVariable("id") String id) {
//        userService.deleteUser(Long.valueOf(id));
//        return ResponseEntity.ok(new APIResponse<>(
//                200, "User Deleted Successfully", null
//        ));
//
//    }

    @PatchMapping("/change-job-role/{id}")
    public ResponseEntity<APIResponse<Void>> changeUserRole(
            @PathVariable("id") Long id,
            @RequestParam("newRole") String newRole) {

        userService.changeUpdateUserRole(id, newRole);
        return ResponseEntity.ok(new APIResponse<>(
                200, "User role changed successfully", null
        ));
    }

    @PatchMapping("/change-status-deactivate/{id}")
    public ResponseEntity<APIResponse<List<UserDTO>>> changeUserStatus(@PathVariable("id") String id) {
        userService.changeUserStatusDeactivate(Long.valueOf(id));
        return ResponseEntity.ok(new APIResponse<>(
                200, "User Status Deactivated Successfully", null
        ));
    }

    @PatchMapping("/change-status-activate/{id}")
    public ResponseEntity<APIResponse<List<UserDTO>>> changeUserStatusActive(@PathVariable("id") String id) {
        userService.changeUserStatusActivate(Long.valueOf(id));
        return ResponseEntity.ok(new APIResponse<>(
                200, "User Status Activated Successfully", null
        ));
    }

    @GetMapping("/search/{keyword}")
    public ResponseEntity<APIResponse<Page<UserDTO>>> searchUser(
            @PathVariable("keyword") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserDTO> userPage = userService.searchUser(keyword, pageable);

        APIResponse<Page<UserDTO>> response = new APIResponse<>(
                200,
                "Users fetched successfully",
                userPage
        );

        return ResponseEntity.ok(response);
    }



    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<APIResponse<UserDTO>> getUserById(@PathVariable("id") Long id) {
        UserDTO selectedUser = userService.getUserById(id);
        return ResponseEntity.ok(new APIResponse<>(
                200, "User Selected Successfully", selectedUser
        ));
    }


    @GetMapping("/paginated-users")
    public ResponseEntity<APIResponse<Page<UserDTO>>> getUsersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<UserDTO> userPage = userService.getUsersPages(page, size);

        APIResponse<Page<UserDTO>> response = new APIResponse<>(
                200,
                "Users fetched successfully",
                userPage
        );

        return ResponseEntity.ok(response);
    }

}
