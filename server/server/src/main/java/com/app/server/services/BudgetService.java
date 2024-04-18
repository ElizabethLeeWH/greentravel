package com.app.server.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.app.server.models.Budget;
import com.app.server.repositories.BudgetRepo;

public class BudgetService {
    @Autowired
    private BudgetRepo budgetRepo;

    @Transactional
    public void saveBudget(Budget budget) {
        Optional<Budget> existingBudget = budgetRepo.getBudgetByTripId(budget.getTripId());
        if (existingBudget.isPresent()) {
            Budget updatedBudget = existingBudget.get();
            updatedBudget.setCurrency(budget.getCurrency());
            updatedBudget.setTotalBudget(budget.getTotalBudget());
            budgetRepo.updateBudget(updatedBudget);
        } else {
            budgetRepo.saveBudget(budget);
        }
    }
}
