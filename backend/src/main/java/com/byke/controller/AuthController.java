package com.byke.controller;

import com.byke.dto.AuthRequest;
import com.byke.dto.AuthResponse;
import com.byke.dto.RefreshTokenRequest;
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
            String phoneNumber = normalizePhone(request.getMobileNumber());
            String sessionInfoId = firebaseOtpService.initiatePhoneSignIn(phoneNumber, request.getRecaptchaToken());
            return ResponseEntity.ok().body(Map.of(
                    "sessionInfoId", sessionInfoId,
                    "message", "OTP sent successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody AuthRequest request) {
        return handleOtpVerification(request, UserRole.USER, request.getFullName() != null ? request.getFullName() : "User");
    }

    @PostMapping("/rider/verify-otp")
    public ResponseEntity<?> verifyRiderOtp(@RequestBody AuthRequest request) {
        return handleOtpVerification(request, UserRole.RIDER, request.getFullName() != null ? request.getFullName() : "Rider");
    }

    @PostMapping("/verify-firebase-token")
    public ResponseEntity<?> verifyFirebaseToken(@RequestBody AuthRequest request) {
        return handleIdTokenVerification(request, UserRole.USER, request.getFullName() != null ? request.getFullName() : "User");
    }

    @PostMapping("/rider/verify-firebase-token")
    public ResponseEntity<?> verifyRiderFirebaseToken(@RequestBody AuthRequest request) {
        return handleIdTokenVerification(request, UserRole.RIDER, request.getFullName() != null ? request.getFullName() : "Rider");
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();
            String mobileNumber = jwtUtil.extractMobileNumber(refreshToken);
            if (!jwtUtil.validateToken(refreshToken, mobileNumber)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid refresh token"));
            }

            Long userId = jwtUtil.extractUserId(refreshToken);
            String role = jwtUtil.extractRole(refreshToken);
            User user = userService.getUserById(userId);

            String accessToken = jwtUtil.generateToken(
                    user.getMobileNumber(),
                    role,
                    user.getId()
            );

            AuthResponse response = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .role(role)
                    .message("Token refreshed")
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private ResponseEntity<?> handleOtpVerification(AuthRequest request, UserRole role, String defaultName) {
        try {
            String phoneNumber = firebaseOtpService.verifyOtpSession(request.getSessionInfoId(), request.getOtpCode());
            User user = userService.createOrGetUser(
                    phoneNumber,
                    defaultName,
                    role
            );
            return ResponseEntity.ok(buildAuthResponse(user, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private ResponseEntity<?> handleIdTokenVerification(AuthRequest request, UserRole role, String defaultName) {
        try {
            String phoneNumber = firebaseOtpService.verifyIdToken(request.getIdToken(), request.getMobileNumber());
            User user = userService.createOrGetUser(
                    phoneNumber,
                    defaultName,
                    role
            );
            return ResponseEntity.ok(buildAuthResponse(user, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private AuthResponse buildAuthResponse(User user, String message) {
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

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .role(user.getRole().name())
                .message(message)
                .build();
    }

    private String normalizePhone(String mobileNumber) {
        if (mobileNumber == null || mobileNumber.isBlank()) {
            throw new IllegalArgumentException("Mobile number is required");
        }
        return mobileNumber.startsWith("+91") ? mobileNumber : "+91" + mobileNumber;
    }
}
