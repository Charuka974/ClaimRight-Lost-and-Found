package com.assignment.ijse.back_end.service;

public interface EmailService {
    void sendSimpleMail(String to, String subject, String text);
    void sendHtmlMail(String to, String subject, String htmlBody);
}
