package com.app.server.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.app.server.models.PaymentInfo;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.param.ChargeCreateParams;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;


@Service
public class PaymentService {

    public Charge chargeCreditCard(String token, double amount) throws StripeException {
        ChargeCreateParams params = ChargeCreateParams.builder()
                .setAmount((long) (amount * 100))
                .setCurrency("usd")
                .setDescription("Example charge")
                .setSource(token)
                .build();

        return Charge.create(params);
    }

    @Value("${stripe.api.key}")
    private String STRIPE_API_KEY;

    @Value("${server.api.url}")
    private String SERVER_API_URL;
    
    public String createPaymentLink(PaymentInfo urls) { 
        Stripe.apiKey = STRIPE_API_KEY;

        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl(SERVER_API_URL + "/premium-success")
            .setCancelUrl(SERVER_API_URL + "/premium-cancel")
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("sgd")
                            .setUnitAmount(500L)
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("Total")
                                    .build())
                            .build())
                    .build())
            .build();

        try {
            Session session = Session.create(params);
            return session.getId();
        } catch (StripeException ex) {
            System.out.println(ex);
        }

        return "";

    }
}