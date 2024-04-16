package com.app.server.services;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.server.models.Itinerary;
import com.app.server.models.ItineraryDate;
import com.app.server.models.ItineraryDestination;
import com.app.server.repositories.ItinerariesRepo;

@Service
public class ItineraryService {

    @Autowired
    private ItinerariesRepo itinerariesRepo;

    @Transactional
    public void saveItineraryFromForm(Itinerary itinerary, String tripId) {
        int itineraryId = itinerariesRepo.saveItinerary(tripId);

        for (ItineraryDate dateInfo : itinerary.getDates()) {
            Date date = dateInfo.getDate();
            int itineraryDateId = itinerariesRepo.saveItineraryDate(itineraryId, date);

            for (ItineraryDestination place : dateInfo.getPlaces()) {
                itinerariesRepo.saveItineraryDestination(itineraryDateId, place);
            }
        }
    }

}
