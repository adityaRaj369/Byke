package com.byke.controller;

import com.byke.dto.AuthRequest;
import com.byke.dto.AuthResponse;
import com.byke.model.entity.User;
import com.byke.model.enums.UserRole;
import com.byke.security.JwtUtil;
import com.byke.service.FirebaseOtpService;
import com.byke.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final FirebaseOtpService firebaseOtpService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody AuthRequest request) {
        try {
            String phoneNumber = request.getMobileNumber();
            if (!phoneNumber.startsWith("+91")) {
                phoneNumber = "+91" + phoneNumber;
            }
            
            String result = firebaseOtpService.initiatePhoneSignIn(phoneNumber);
            return ResponseEntity.ok().body(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody AuthRequest request) {
        try {
            // For demo purposes, accept any 6-digit OTP
            if (request.getOtpCode() == null || request.getOtpCode().length() != 6) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP"));
            }
            
            String phoneNumber = request.getMobileNumber();
            if (!phoneNumber.startsWith("+91")) {
                phoneNumber = "+91" + phoneNumber;
            }
            
            User user = userService.createOrGetUser(
                    phoneNumber,
                    request.getFullName() != null ? request.getFullName() : "User",
                    UserRole.USER
            );

            String accessToken = jwtUtil.generateToken(
                    user.getMobileNumber(),
                    user.getRole().name(),
                    user.getId()
            );

            String refreshToken = jwtUtil.generateRefreshToken(
                    user.getMobileNumber(),
                    user.getRole().name(),
                    user.getId()
            );

            AuthResponse response = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .role(user.getRole().name())
                    .message("Login successful")
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/rider/verify-otp")
    public ResponseEntity<?> verifyRiderOtp(@RequestBody AuthRequest request) {
        try {
            // For demo purposes, accept any 6-digit OTP
            if (request.getOtpCode() == null || request.getOtpCode().length() != 6) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP"));
            }
            
            String phoneNumber = request.getMobileNumber();
            if (!phoneNumber.startsWith("+91")) {
                phoneNumber = "+91" + phoneNumber;
            }
            
            User user = userService.createOrGetUser(
                    phoneNumber,
                    request.getFullName() != null ? request.getFullName() : "Rider",
                    UserRole.RIDER
            );

            String accessToken = jwtUtil.generateToken(
                    user.getMobileNumber(),
                    user.getRole().name(),
                    user.getId()
            );

            String refreshToken = jwtUtil.generateRefreshToken(
                    user.getMobileNumber(),
                    user.getRole().name(),
                    user.getId()
            );

            AuthResponse response = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .role(user.getRole().name())
                    .message("Login successful")
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-firebase-token")
    public ResponseEntity<?> verifyFirebaseToken(@RequestBody AuthRequest request) {
        try {
            String phoneNumber = firebaseOtpService.verifyIdToken(request.getIdToken());
            
            User user = userService.createOrGetUser(
                    phoneNumber,
                    request.getFullName() != null ? request.getFullName() : "User",
                    UserRole.USER
            );

            String accessToken = jwtUtil.generateToken(
                    user.getMobileNumber(),
                    user.getRole().name(),
                    user.getId()
            );

            String refreshToken = jwtUtil.generateRefreshToken(
                    user.getMobileNumber(),
                    user.getRole().name(),
                    user.getId()
            );

            AuthResponse response = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .role(user.getRole().name())
                    .message("Login successful")
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/rider/verify-firebase-token")
    public ResponseEntity<?> verifyRiderFirebaseToken(@RequestBody AuthRequest request) {
        try {
            String phoneNumber = firebaseOtpService.verifyIdToken(request.getIdToken());
            
            User user = userService.createOrGetUser(
                    phoneNumber,
                    request.getFullName() != null ? request.getFullName() : "Rider",
                    UserRole.RIDER
            );

            String accessToken = jwtUtil.generateToken(
                    user.getMobileNumber(),
                    user.getRole().name(),
                    user.getId()
            );

            String refreshToken = jwtUtil.generateRefreshToken(
                    user.getMobileNumber(),
                    user.getRole().name(),
                    user.getId()
            );

            AuthResponse response = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .role(user.getRole().name())
                    .message("Login successful")
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
