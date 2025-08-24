package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.service.ClaimService;
import com.assignment.ijse.back_end.service.ImgBBUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("claimright/claim-item")
@RequiredArgsConstructor
@Slf4j
public class ClaimController {

    private final ClaimService claimService;
    private final ImgBBUploadService imgBBUploadService;

}
