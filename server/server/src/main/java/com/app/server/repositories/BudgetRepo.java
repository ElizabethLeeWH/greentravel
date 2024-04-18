package com.app.server.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.app.server.models.Budget;

@Repository
public class BudgetRepo {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public static final String SQL_SAVE_BUDGET = """
            INSERT INTO budgets (budget_id, trip_id, currency, total_budget)
            VALUES (?, ?, ?, ?)
                """;

    public static final String SQL_GET_BUDGET_BY_TRIP_ID = """
            SELECT * FROM budgets
            WHERE trip_id = ?
                """;

    final String SQL_UPDATE_BUDGET = """
                UPDATE budgets SET currency = ?, total_budget = ?
                WHERE trip_id = ?
            """;

    public void saveBudget(Budget budget) {
        jdbcTemplate.update(SQL_SAVE_BUDGET, budget.getBudgetId(), budget.getTripId(), budget.getCurrency(),
                budget.getTotalBudget());
    }

    private final RowMapper<Budget> rowMapper = (rs, rowNum) -> {
        Budget budget = new Budget();
        budget.setTripId(rs.getString("trip_id"));
        budget.setCurrency(rs.getString("currency"));
        budget.setTotalBudget(rs.getDouble("total_budget"));
        return budget;
    };

    public Optional<Budget> getBudgetByTripId(String tripId) {
        String sql = "SELECT * FROM budgets WHERE trip_id = ?";
        List<Budget> budgets = jdbcTemplate.query(sql, rowMapper, tripId);
        return budgets.stream().findFirst();
    }

    public void updateBudget(Budget budget) {
        jdbcTemplate.update(SQL_UPDATE_BUDGET, budget.getCurrency(), budget.getTotalBudget(), budget.getTripId());
    }
}
