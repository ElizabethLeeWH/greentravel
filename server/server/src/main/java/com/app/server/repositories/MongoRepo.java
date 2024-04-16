package com.app.server.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import com.app.server.models.User;

@Repository
public class MongoRepo {
    @Autowired
    private MongoTemplate template;

    /*
    db.userData.insertOne({

    })
    */    
    public void addNewUser(User user){
        template.insert(user, "userData");
    }

    public boolean userExists(String email) {
        Query query = new Query();
        query.addCriteria(Criteria.where("email").is(email));
        return template.exists(query, User.class, "userData");
    }

    public User findUserDetailsByEmail(String email) {
        Query query = new Query().addCriteria(Criteria.where("email").is(email));
        return template.findOne(query, User.class, "userData");
    }
}
