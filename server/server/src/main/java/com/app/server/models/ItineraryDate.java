package com.app.server.models;

import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDate {
   private Date date;
    private List<ItineraryDestination> places;
}
