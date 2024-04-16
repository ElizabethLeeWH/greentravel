package com.app.server.repositories;

import java.sql.PreparedStatement;
import java.sql.Statement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.app.server.models.ItineraryDestination;

@Repository
public class ItinerariesRepo {
     @Autowired
    private JdbcTemplate jdbcTemplate;

    // public int saveItinerary(String tripId) {
    //     KeyHolder keyHolder = new GeneratedKeyHolder();
    //     jdbcTemplate.update(
    //         connection -> {
    //             PreparedStatement ps = connection.prepareStatement(
    //                 "INSERT INTO itineraries (trip_id) VALUES (?)", 
    //                 new String[] {"itinerary_id"});
    //             ps.setString(1, tripId);
    //             return ps;
    //         }, keyHolder);
    //     return keyHolder.getKey().intValue();
    // }

    public Integer saveItinerary(String tripId) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
            connection -> {
                PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO itineraries (trip_id) VALUES (?)",
                    Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, tripId);
                return ps;
            }, keyHolder);
        return (keyHolder.getKey() != null ? keyHolder.getKey().intValue() : null);
    }
    

    public int saveItineraryDate(int itineraryId, java.util.Date date) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
            connection -> {
                PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO itinerary_dates (itinerary_id, date) VALUES (?, ?)", 
                    new String[] {"itinerary_date_id"});
                ps.setInt(1, itineraryId);
                ps.setDate(2, new java.sql.Date(date.getTime()));
                return ps;
            }, keyHolder);
        return keyHolder.getKey().intValue();
    }

    public int saveItineraryDestination(int itineraryDateId, ItineraryDestination destination) {
        return jdbcTemplate.update(
            "INSERT INTO itinerary_destinations (itinerary_date_id, destination, latitude, longitude) VALUES (?, ?, ?, ?)",
            itineraryDateId, destination.getDestination(), destination.getLatitude(), destination.getLongitude());
    }
}
