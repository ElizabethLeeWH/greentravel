package com.app.server.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.server.models.EmailRequest;
import com.app.server.models.InviteRequest;
import com.app.server.services.EmailService;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public String sendEmail(@RequestBody EmailRequest emailRequest) {
        try {
            return emailService.sendNewsletterMessage(emailRequest.getTo());
        } catch (IOException e) {
            e.printStackTrace();
            return "Error sending email: " + e.getMessage();
        }
    }

    @PostMapping("/inviteTripmate/{tripId}")
    public ResponseEntity<?> sendEmail(@RequestBody InviteRequest inviteRequest, @PathVariable String tripId) {
        String url = "https://thetravelcompanion.up.railway.app/plan/" + tripId;
        List<String> responses = new ArrayList<>();
        for (String recipient : inviteRequest.getTo()) {
            try {
                String response = emailService.sendInviteMessage(recipient, url);
                responses.add(response);
            } catch (IOException e) {
                e.printStackTrace();
                responses.add("Error sending email to " + recipient + ": " + e.getMessage());
            }
        }
        return ResponseEntity.ok(responses);
    }
}