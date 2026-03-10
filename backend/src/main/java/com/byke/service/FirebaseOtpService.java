package com.byke.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.SessionCookie;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseOtpService {

    private final FirebaseAuth firebaseAuth;

    public String initiatePhoneSignIn(String phoneNumber) {
        try {
            log.info("Initiating phone sign-in for: {}", phoneNumber);
            return "Phone sign-in initiated. User will receive OTP on their device via Firebase.";
        } catch (Exception e) {
            log.error("Failed to initiate phone sign-in: {}", e.getMessage());
            throw new RuntimeException("Failed to initiate phone sign-in: " + e.getMessage());
        }
    }

    public String verifyIdToken(String idToken) {
        try {
            var decodedToken = firebaseAuth.verifyIdToken(idToken);
            String phoneNumber = decodedToken.getPhoneNumber();
            String uid = decodedToken.getUid();
            
            log.info("Firebase token verified for phone: {}, UID: {}", phoneNumber, uid);
            return phoneNumber;
        } catch (FirebaseAuthException e) {
            log.error("Failed to verify Firebase token: {}", e.getMessage());
            throw new RuntimeException("Invalid Firebase token: " + e.getMessage());
        }
    }

    public String createSessionCookie(String idToken, long expiresIn) {
        try {
            SessionCookie sessionCookie = firebaseAuth.createSessionCookie(idToken, expiresIn);
            log.info("Session cookie created successfully");
            return sessionCookie;
        } catch (FirebaseAuthException e) {
            log.error("Failed to create session cookie: {}", e.getMessage());
            throw new RuntimeException("Failed to create session cookie: " + e.getMessage());
        }
    }
}
