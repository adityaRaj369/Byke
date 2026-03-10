package com.byke.service;

import com.byke.model.entity.User;
import com.byke.model.enums.AccountStatus;
import com.byke.model.enums.UserRole;
import com.byke.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User createOrGetUser(String mobileNumber, String fullName, UserRole role) {
        Optional<User> existingUser = userRepository.findByMobileNumber(mobileNumber);
        
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        User newUser = User.builder()
                .mobileNumber(mobileNumber)
                .fullName(fullName)
                .role(role)
                .status(AccountStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("New user created: {} with role: {}", mobileNumber, role);
        return savedUser;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByMobileNumber(String mobileNumber) {
        return userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateUser(Long userId, User updatedUser) {
        User user = getUserById(userId);
        
        if (updatedUser.getFullName() != null) {
            user.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getProfilePhotoUrl() != null) {
            user.setProfilePhotoUrl(updatedUser.getProfilePhotoUrl());
        }
        if (updatedUser.getHomeAddress() != null) {
            user.setHomeAddress(updatedUser.getHomeAddress());
        }
        if (updatedUser.getWorkAddress() != null) {
            user.setWorkAddress(updatedUser.getWorkAddress());
        }
        if (updatedUser.getNotificationsEnabled() != null) {
            user.setNotificationsEnabled(updatedUser.getNotificationsEnabled());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void updateUserStatus(Long userId, AccountStatus status) {
        User user = getUserById(userId);
        user.setStatus(status);
        userRepository.save(user);
        log.info("User {} status updated to: {}", userId, status);
    }

    @Transactional
    public void incrementBookingCount(Long userId) {
        User user = getUserById(userId);
        user.setTotalBookings(user.getTotalBookings() + 1);
        userRepository.save(user);
    }

    @Transactional
    public void updateAverageRating(Long userId, Double newRating, boolean isGiven) {
        User user = getUserById(userId);
        
        if (isGiven) {
            double currentAvg = user.getAverageRatingGiven();
            int totalBookings = user.getTotalBookings();
            double newAvg = ((currentAvg * (totalBookings - 1)) + newRating) / totalBookings;
            user.setAverageRatingGiven(newAvg);
        } else {
            double currentAvg = user.getAverageRatingReceived();
            int totalBookings = user.getTotalBookings();
            double newAvg = ((currentAvg * (totalBookings - 1)) + newRating) / totalBookings;
            user.setAverageRatingReceived(newAvg);
        }
        
        userRepository.save(user);
    }

    public long getTotalUserCount() {
        return userRepository.count();
    }

    public long getUserCountByRole(UserRole role) {
        return userRepository.countByRole(role);
    }
}
