package com.app.server.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargeResponse {
    private String id;
    private Long amount;
    private String currency;
    private String status;

}

