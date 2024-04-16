// budget.service.ts
import { Injectable } from '@angular/core';
import { Budget, Expense, BudgetCategory, Currency } from './model';

@Injectable({
    providedIn: 'root',
})
export class BudgetService {

    private budget: Budget = {
        currency: 'USD',
        totalBudget: 0,
        expenses: []
    };

    private categories: BudgetCategory[] = [
        { name: 'Flights' },
        { name: 'Accommodation' },
        { name: 'Car Rental' },
        { name: 'Transportation' },
        { name: 'Food' },
        { name: 'Drinks' },
        { name: 'Sightseeing' },
        { name: 'Activities' },
        { name: 'Shopping' },
        { name: 'Gas' },
        { name: 'Groceries' },
        { name: 'Other' }
    ];

    private currencies: Currency[] = [
        { code: 'USD', name: 'USA Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'Great Britain Pound' },
        { code: 'SGD', name: 'Singapore Dollar' },
        { code: 'VND', name: 'Vietnam Dong' },
        { code: 'AUD', name: 'Australia Dollar' },
        { code: 'JPY', name: 'Japan Yen' },
        { code: 'CHF', name: 'Switzerland Franc' }
    ];

    constructor() { }

    addCategory(category: BudgetCategory) {
        this.categories.push(category);
    }

    addExpense(expense: Expense) {
        this.budget.expenses.push(expense);
    }
    
    getCurrencies(): Currency[] {
        return this.currencies;
      }

    getCategories(): BudgetCategory[] {
        return this.categories;
    }

    getBudget(): Budget {
        return this.budget;
    }

    splitExpense(expenseId: number) {
        const expense = this.budget.expenses.find(e => e.id === expenseId);
        if (!expense) return;

        const numberOfPeople = expense.splitWith.length + 1;
        const splitAmount = expense.amount / numberOfPeople;

        // Here you could adjust each participant's balance
        // This is a simplification. You might need a more complex logic depending on your requirements
        expense.splitWith.forEach(email => {
            // Adjust balance for each user here
            console.log(`${email} owes ${splitAmount}`);
        });

        // Update total budget or perform other actions as needed
    }

    // Implement calculation logic as needed
}
