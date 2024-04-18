package com.app.server.controllers;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.server.models.Budget;
import com.app.server.models.Itinerary;
import com.app.server.models.TripHeader;
import com.app.server.models.User;
import com.app.server.services.BudgetService;
import com.app.server.services.ItineraryService;
import com.app.server.services.TripHeaderService;
import com.app.server.services.UserService;

// @CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")
public class ApiController {
    @Autowired
    private UserService userService;

    @Autowired
    private ItineraryService itineraryService;

    // @Autowired
    // private BudgetService budgetService;

    @Autowired
    private TripHeaderService tripHeaderService;

    private static final Logger logger = LoggerFactory.getLogger(ApiController.class);

    @PostMapping("/signup")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        boolean existingUser = userService.findByEmail(user.getEmail());

        if (existingUser) {
            return ResponseEntity.badRequest().body("User already exists with this email.");
        }

        // Save user
        User savedUser = userService.saveUser(user);
        if (savedUser != null) {
            String token = userService.generateToken(savedUser);
            // Return the token or a success message
            // You might want to return the token in an HTTP header instead
            return ResponseEntity.ok().body("User created successfully. Token: " + token);
        } else {
            // Handle unexpected errors
            return ResponseEntity.internalServerError().body("An error occurred while creating the user.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> userLogin(@RequestBody User loginUser) {
        System.out.println(loginUser.getEmail() + loginUser.getPassword());

        boolean isAuthenticated = userService.authenticateUser(loginUser.getEmail(), loginUser.getPassword());

        if (isAuthenticated) {
            User user = userService.getUserByEmail(loginUser.getEmail());
            String token = userService.generateToken(user);
            return ResponseEntity.ok().body(token);
        } else {
            return ResponseEntity.badRequest().body("Invalid login credentials");
        }

    }

    @GetMapping("/getTripHeaders")
    public ResponseEntity<?> getTripHeadersFromToken(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Bearer token is missing.");
        }
        try {
            String token = authorizationHeader.substring(7);
            String userEmail = userService.findEmailByToken(token);
            return ResponseEntity.ok(tripHeaderService.getTripHeaderByUserEmail(userEmail));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/getTripHeader/{tripId}")
    public ResponseEntity<?> getTripHeaderFromToken(@PathVariable String tripId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Bearer token is missing.");
        }
        try {
            return ResponseEntity.ok(tripHeaderService.getTripHeaderByTripId(tripId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping(value = "/createTripHeader", consumes = "application/json")
    public ResponseEntity<String> createTripHeader(@RequestBody TripHeader tripHeader,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Bearer token is missing.");
        }

        String token = authorizationHeader.substring(7);

        try {
            logger.debug("TripHeader: {}", tripHeader);

            String userEmail = userService.findEmailByToken(token);
            boolean result = tripHeaderService.addTripHeader(tripHeader, userEmail);

            if (result) {
                logger.info("Successfully created Trip Header.");
                return ResponseEntity.ok("{\"message\": \"Successfully created Trip Header in database.\"}");
            } else {
                System.out.println(userEmail);
                logger.warn("Failed to create Trip Header due to service layer rejection.");
                return ResponseEntity.badRequest().body("{\"error\": \"Failed to create Trip Header in database.\"}");
            }
        } catch (Exception e) {
            logger.error("Exception occurred while creating Trip Header", e);
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"An error occurred while creating Trip Header.\"}");
        }
    }

    @PatchMapping("/saveTripHeader/{tripId}")
    public ResponseEntity<String> updateTripHeader(@PathVariable String tripId, @RequestBody TripHeader tripHeader,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Bearer token is missing.");
        }

        tripHeader.setTripId(tripId);

        try {
            int rowsAffected = tripHeaderService.updateTripHeader(tripHeader);
            if (rowsAffected > 0) {
                return ResponseEntity.ok("{\"message\": \"Successfully updated Trip Header in database.\"}");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"An error occurred while updating Trip Header.\"}");
        }
    }

    @DeleteMapping("/deleteTripHeader/{tripId}")
    public ResponseEntity<?> deleteTripHeader(@PathVariable String tripId) {
        try {
            tripHeaderService.deleteTripHeader(tripId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete trip header: " + e.getMessage());
        }
    }

    @PostMapping("/saveItinerary/{tripId}")
    public ResponseEntity<?> saveItinerary(@RequestBody Itinerary itinerary, @PathVariable String tripId) {
        try {
            itineraryService.saveItineraryFromForm(itinerary, tripId);
            return ResponseEntity.ok(Map.of("message", "Itinerary saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save itinerary: " + e.getMessage()));
        }
    }

    @PostMapping("/saveBudget/{tripId}")
    public ResponseEntity<?> saveBudget(@RequestBody Budget budget, @PathVariable String tripId) {
        try {
            budget.setTripId(tripId);
            // budgetService.saveBudget(budget);
            return ResponseEntity.ok().body("Budget saved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save budget: " + e.getMessage());
        }
    }

}
