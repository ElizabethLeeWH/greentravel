package com.app.server.models;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItineraryDestination {
    private int itineraryDestinationId;
    private int itineraryDateId;
    private String destination;
    private double latitude;
    private double longitude;

    @JsonProperty("destination")
    private void unpackNestedDestination(Map<String, Object> destination) {
        this.destination = (String) destination.get("country");
        this.latitude = (Double) destination.get("latitude");
        this.longitude = (Double) destination.get("longitude");
    }
}