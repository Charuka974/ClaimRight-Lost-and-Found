package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.EmailRequestDTO;
import com.assignment.ijse.back_end.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/claimright/sendemail")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-simple")
    public ResponseEntity<String> sendSimpleEmail(
            @RequestParam("to") String to,
            @RequestParam("subject") String subject,
            @RequestParam("text") String text) {

        emailService.sendSimpleMail(to, subject, text);
        return ResponseEntity.ok("Simple email sent successfully");
    }

    @PostMapping("/send-html")
    public ResponseEntity<String> sendHtmlEmail(@RequestBody EmailRequestDTO emailRequest) {

        String senderName = (emailRequest.getFromUser() != null && !emailRequest.getFromUser().isBlank())
                ? emailRequest.getFromUser()
                : "A user";

        String senderEmail = extractEmailFromFromUser(senderName);

        // Styled HTML template
        String styledHtml = """
        <div style="background-color: #f8f9fc; padding: 30px; border-radius: 12px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2e4374; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://i.ibb.co/yFJ1PVNP/Chat-GPT-Image-Jul-24-2025-11-16-54-AM.png" alt="ClaimRight Logo" style="width: 100px; border-radius: 50%%; box-shadow: 0 4px 10px rgba(78, 115, 223, 0.3);" />
            </div>
            <h2 style="color: #2e4374; font-weight: 700;">%s</h2>
            <p style="font-size: 16px; color: #333;">Message from <strong>%s</strong>:</p>
            <p style="font-size: 14px; color: #333;">Email: <a href="mailto:%s">%s</a></p>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); margin: 15px 0; font-size: 15px; line-height: 1.6; color: #555;">
                %s
            </div>
            <p style="font-size: 14px; color: #666;">This message was sent via ClaimRight Contact Form.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #999;">— ClaimRight Team</p>
        </div>
    """.formatted(
                emailRequest.getSubject(),
                senderName.split("<")[0].trim(), // only the name
                senderEmail,
                senderEmail,
                emailRequest.getHtmlBody()
        );

        emailService.sendHtmlMail(emailRequest.getTo(), emailRequest.getSubject(), styledHtml);

        return ResponseEntity.ok("Styled HTML email sent successfully to admin");
    }

    private String extractEmailFromFromUser(String fromUser) {
        if (fromUser == null) return "unknown@example.com";
        int start = fromUser.indexOf("<");
        int end = fromUser.indexOf(">");
        if (start >= 0 && end > start) {
            return fromUser.substring(start + 1, end).trim();
        }
        return fromUser; // fallback if not in "<>" format
    }


    @PostMapping("/send-html/custom")
    public ResponseEntity<String> sendCustomHtmlEmail(
            @RequestParam("to") String to,
            @RequestParam("subject") String subject,
            @RequestParam(value = "userName", required = false) String userName,
            @RequestParam(value = "message", required = false) String messageContent,
            @RequestParam(value = "buttonLink", required = false) String buttonLink,
            @RequestParam(value = "buttonText", required = false) String buttonText
    ) {
        // Fallbacks
        String name = (userName != null && !userName.isBlank()) ? userName : "there";
        String message = (messageContent != null && !messageContent.isBlank()) ?
                messageContent : "This is a notification from ClaimRight.";
        String link = (buttonLink != null && !buttonLink.isBlank()) ? buttonLink : "#";
        String btnText = (buttonText != null && !buttonText.isBlank()) ? buttonText : "Click Here";

        // Build HTML content
        String htmlContent = """
        <div style="background-color: #f8f9fc; padding: 30px; border-radius: 12px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2e4374; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://i.ibb.co/yFJ1PVNP/Chat-GPT-Image-Jul-24-2025-11-16-54-AM.png" alt="ClaimRight Logo" style="width: 100px; border-radius: 50%%; box-shadow: 0 4px 10px rgba(78, 115, 223, 0.3);" />
            </div>
            <h2 style="color: #2e4374; font-weight: 700;">%s</h2>
            <p style="font-size: 16px; color: #333;">Hi %s,</p>
            <p style="font-size: 15px; line-height: 1.6;">%s</p>
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
                    %s
                </a>
            </div>
            <p style="font-size: 14px; color: #666;">
                If you did not expect this email, you can safely ignore it.
            </p>
            <p style="margin-top: 30px; font-size: 14px; color: #999;">
                — ClaimRight Team
            </p>
        </div>
    """.formatted(subject, name, message, link, btnText);

        // Send email
        emailService.sendHtmlMail(to, subject, htmlContent);

        return ResponseEntity.ok("Custom HTML email sent successfully to " + to);
    }


}

