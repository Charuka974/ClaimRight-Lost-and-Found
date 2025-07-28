package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/claimright/sendemail")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public String sendEmail(@RequestParam String to, @RequestParam String subject, @RequestParam String body) {
        emailService.sendSimpleMail(to, subject, body);
        return "Email sent successfully!";
    }
}

