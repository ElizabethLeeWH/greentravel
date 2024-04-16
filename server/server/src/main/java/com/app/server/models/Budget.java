package com.app.server.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {
    private String budgetId;
    private String tripId;
    private String currency;
    private Double totalBudget;
}
