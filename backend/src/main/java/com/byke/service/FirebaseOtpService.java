package com.byke.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.SessionCookieOptions;
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
            // In Firebase Admin SDK, phone_number is inside the claims
            String phoneNumber = (String) decodedToken.getClaims().get("phone_number");
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
            SessionCookieOptions options = SessionCookieOptions.builder().setExpiresIn(expiresIn).build();
            String sessionCookie = firebaseAuth.createSessionCookie(idToken, options);
            log.info("Session cookie created successfully");
            return sessionCookie;
        } catch (FirebaseAuthException e) {
            log.error("Failed to create session cookie: {}", e.getMessage());
            throw new RuntimeException("Failed to create session cookie: " + e.getMessage());
        }
    }
}
