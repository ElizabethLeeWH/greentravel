package com.app.server.models;

import java.util.Date;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripHeader {
    public String tripId;
    public String userId;
    public String destinationCountry;
    public double latitude;
    public double longitude;
    public String tripCoverPhoto;
    public String tripName;
    public Date startDate;
    public Date endDate;

    @JsonProperty("destination")
    private void unpackNestedDestination(Map<String, Object> destination) {
        this.destinationCountry = (String) destination.get("country");
        this.latitude = (Double) destination.get("latitude");
        this.longitude = (Double) destination.get("longitude");
    }
}
