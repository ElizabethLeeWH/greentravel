package com.app.server.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.server.models.TripHeader;
import com.app.server.models.User;
import com.app.server.repositories.MongoRepo;
import com.app.server.repositories.TripHeaderRepo;

@Service
public class TripHeaderService {

    @Autowired
    private TripHeaderRepo tripHeaderRepo;

    @Autowired
    private MongoRepo mongoRepo;

    public List<TripHeader> getTripHeadersByUserId(String userId) {
        return tripHeaderRepo.findAllByUserId(userId);
    }

    public TripHeader getTripHeaderByTripId(String tripId) {
        return tripHeaderRepo.findTripHeaderByTripId(tripId);
    }

    public boolean addTripHeader(TripHeader tripHeader,  String userEmail) {
        User user = mongoRepo.findUserDetailsByEmail(userEmail);
        if (user != null) {
            tripHeader.userId = user.getId();
            System.out.println(user.getId());
            return tripHeaderRepo.insert(tripHeader) > 0;
        } else {
            return false;
        }
    }

    public List<TripHeader> getTripHeaderByUserEmail(String userEmail) {
        User user = mongoRepo.findUserDetailsByEmail(userEmail);
        if (user != null) {
            return tripHeaderRepo.findAllByUserId(user.getId());
        } else {
            return new ArrayList<>();
        }
    }

    public int updateTripHeader(TripHeader tripHeader) {
        return tripHeaderRepo.update(tripHeader);
    }

    public void deleteTripHeader(String tripId) {
        tripHeaderRepo.delete(tripId);
    }

}
