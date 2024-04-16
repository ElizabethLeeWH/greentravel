package com.app.server.utils;

import java.util.Date;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

public class JwtUtils {

    // @Value("${JWT_SECRET_KEY}")
    // private String secretKey;

    private static final String SECRET = "secret"; /* use this for development only */
    private static final long EXPIRATION_TIME = 864000000;
    private static final Algorithm ALGORITHM = Algorithm.HMAC512(SECRET);

    public static String generateToken(String email) {
        return JWT.create().withSubject(email)
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(ALGORITHM);
    }

    public static String getEmailFromToken(String token){
        JWTVerifier verifier = JWT.require(ALGORITHM).build();
        DecodedJWT jwt = verifier.verify(token);
        return jwt.getSubject();
    }
}
