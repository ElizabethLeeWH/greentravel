package com.app.server.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.server.models.ChargeRequest;
import com.app.server.models.ChargeResponse;
import com.app.server.models.PaymentInfo;
import com.app.server.services.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;

import jakarta.json.Json;

@RestController
@RequestMapping("/api")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/charge")
    public ResponseEntity<?> createCharge(@RequestBody ChargeRequest request) {
        try {
            Charge charge = paymentService.chargeCreditCard(request.getToken(), request.getAmount());
            ChargeResponse response = new ChargeResponse(
                    charge.getId(),
                    charge.getAmount(),
                    charge.getCurrency(),
                    charge.getStatus());
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> redirectToPayment(@RequestBody PaymentInfo payment) {
        String sessionId = paymentService.createPaymentLink(payment);
        
        return ResponseEntity.ok(Json.createObjectBuilder()
                .add("sessionId", sessionId)
                .build()
                .toString());
    }
}
