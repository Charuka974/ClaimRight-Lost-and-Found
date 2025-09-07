package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.ClaimViewDTO;
import com.assignment.ijse.back_end.service.ClaimDetailService;
import com.assignment.ijse.back_end.service.ImgBBUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("claimright/claims")
@RequiredArgsConstructor
@Slf4j
public class ClaimDetailController {

    private final ClaimDetailService claimDetailService;
    private final ImgBBUploadService imgBBUploadService;


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClaimViewDTO>> getClaimsForUser(@PathVariable Long userId) {
        try {
            List<ClaimViewDTO> claims = claimDetailService.getClaimsForUser(userId);
            return ResponseEntity.ok(claims);
        } catch (Exception e) {
            log.error("Error fetching claims for user {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }


}
