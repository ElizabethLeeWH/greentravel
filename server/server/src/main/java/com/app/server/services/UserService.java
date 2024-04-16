package com.app.server.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.app.server.models.User;
import com.app.server.repositories.MongoRepo;
import com.app.server.utils.JwtUtils;

@Service
public class UserService {
    @Autowired
    private MongoRepo mongoRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User saveUser(User user){
        // Encode the user's password before saving to the database
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        mongoRepo.addNewUser(user);
        return user;
    }
    
    public boolean authenticateUser(String email, String password) {
        User user = this.getUserByEmail(email);
        
        if (user != null) {
            System.out.println(user.getPassword());
            return passwordEncoder.matches(password, user.getPassword());
        }
        return false;
    }

    public String generateToken(User user){
        // Assuming the JwtUtils.generateToken() expects a user's email to generate a token
        return JwtUtils.generateToken(user.getEmail());
    }

    public String findEmailByToken(String token){
        return JwtUtils.getEmailFromToken(token);
    }

    public boolean findByEmail(String email) {
        return mongoRepo.userExists(email);
    }

    public User getUserByEmail(String email) {
        return mongoRepo.findUserDetailsByEmail(email);
    }
}
