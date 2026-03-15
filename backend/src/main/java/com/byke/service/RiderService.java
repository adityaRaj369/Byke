package com.byke.service;

import com.byke.model.entity.Rider;
import com.byke.model.entity.User;
import com.byke.model.enums.RiderStatus;
import com.byke.repository.RiderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiderService {

    private final RiderRepository riderRepository;
    private final UserService userService;

    @Transactional
    public Rider createRiderApplication(User user, Rider riderData) {
        Rider rider = Rider.builder()
                .user(user)
                .dateOfBirth(riderData.getDateOfBirth())
                .gender(riderData.getGender())
                .homeAddress(riderData.getHomeAddress())
                .vehicleType(riderData.getVehicleType())
                .vehicleMake(riderData.getVehicleMake())
                .vehicleModel(riderData.getVehicleModel())
                .vehicleYear(riderData.getVehicleYear())
                .vehicleRegistrationNumber(riderData.getVehicleRegistrationNumber())
                .vehicleColor(riderData.getVehicleColor())
                .bankAccountNumber(riderData.getBankAccountNumber())
                .bankIfscCode(riderData.getBankIfscCode())
                .bankAccountHolderName(riderData.getBankAccountHolderName())
                .status(RiderStatus.PENDING)
                .build();

        Rider savedRider = riderRepository.save(rider);
        log.info("Rider application created for user: {}", user.getId());
        return savedRider;
    }

    public Rider getRiderById(Long riderId) {
        return riderRepository.findById(riderId)
                .orElseThrow(() -> new RuntimeException("Rider not found"));
    }

    public Rider getRiderByUserId(Long userId) {
        return riderRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Rider not found for this user"));
    }

    @Transactional
    public Rider updateRiderDocuments(Long riderId, Rider documentUrls) {
        Rider rider = getRiderById(riderId);
        
        if (documentUrls.getDrivingLicenseUrl() != null) {
            rider.setDrivingLicenseUrl(documentUrls.getDrivingLicenseUrl());
        }
        if (documentUrls.getAadharCardUrl() != null) {
            rider.setAadharCardUrl(documentUrls.getAadharCardUrl());
        }
        if (documentUrls.getPanCardUrl() != null) {
            rider.setPanCardUrl(documentUrls.getPanCardUrl());
        }
        if (documentUrls.getVehicleRcUrl() != null) {
            rider.setVehicleRcUrl(documentUrls.getVehicleRcUrl());
        }
        if (documentUrls.getVehicleInsuranceUrl() != null) {
            rider.setVehicleInsuranceUrl(documentUrls.getVehicleInsuranceUrl());
        }
        if (documentUrls.getVehiclePucUrl() != null) {
            rider.setVehiclePucUrl(documentUrls.getVehiclePucUrl());
        }
        if (documentUrls.getVehiclePhotoUrl() != null) {
            rider.setVehiclePhotoUrl(documentUrls.getVehiclePhotoUrl());
        }
        if (documentUrls.getSelfieWithVehicleUrl() != null) {
            rider.setSelfieWithVehicleUrl(documentUrls.getSelfieWithVehicleUrl());
        }

        return riderRepository.save(rider);
    }

    @Transactional
    public Rider approveRider(Long riderId) {
        Rider rider = getRiderById(riderId);
        rider.setStatus(RiderStatus.APPROVED);
        Rider savedRider = riderRepository.save(rider);
        log.info("Rider approved: {}", riderId);
        return savedRider;
    }

    @Transactional
    public Rider rejectRider(Long riderId, String reason) {
        Rider rider = getRiderById(riderId);
        rider.setStatus(RiderStatus.BANNED);
        rider.setRejectionReason(reason);
        Rider savedRider = riderRepository.save(rider);
        log.info("Rider rejected: {} with reason: {}", riderId, reason);
        return savedRider;
    }

    @Transactional
    public Rider activateSubscription(Long riderId, LocalDateTime startDate, LocalDateTime endDate) {
        Rider rider = getRiderById(riderId);
        rider.setSubscriptionStartDate(startDate);
        rider.setSubscriptionEndDate(endDate);
        rider.setSubscriptionActive(true);
        rider.setStatus(RiderStatus.ACTIVE);
        Rider savedRider = riderRepository.save(rider);
        log.info("Subscription activated for rider: {}", riderId);
        return savedRider;
    }

    @Transactional
    public void deactivateSubscription(Long riderId) {
        Rider rider = getRiderById(riderId);
        rider.setSubscriptionActive(false);
        rider.setStatus(RiderStatus.INACTIVE);
        riderRepository.save(rider);
        log.info("Subscription deactivated for rider: {}", riderId);
    }

    @Transactional
    public void updateRiderLocation(Long riderId, Double latitude, Double longitude) {
        Rider rider = getRiderById(riderId);
        rider.setCurrentLatitude(latitude);
        rider.setCurrentLongitude(longitude);
        rider.setLastLocationUpdate(LocalDateTime.now());
        riderRepository.save(rider);
    }

    @Transactional
    public void updateRiderStatus(Long riderId, RiderStatus status) {
        Rider rider = getRiderById(riderId);
        rider.setStatus(status);
        riderRepository.save(rider);
        log.info("Rider {} status updated to: {}", riderId, status);
    }

    @Transactional
    public void incrementRideCount(Long riderId) {
        Rider rider = getRiderById(riderId);
        rider.setTotalRides(rider.getTotalRides() + 1);
        riderRepository.save(rider);
    }

    @Transactional
    public void updateRiderRating(Long riderId, Integer newRating) {
        Rider rider = getRiderById(riderId);
        int totalRatings = rider.getTotalRatings();
        double currentAvg = rider.getAverageRating();
        
        double newAvg = ((currentAvg * totalRatings) + newRating) / (totalRatings + 1);
        rider.setAverageRating(newAvg);
        rider.setTotalRatings(totalRatings + 1);
        
        riderRepository.save(rider);
        log.info("Rider {} rating updated to: {}", riderId, newAvg);
    }

    @Transactional
    public void incrementCancellationCount(Long riderId) {
        Rider rider = getRiderById(riderId);
        rider.setCancellationCount(rider.getCancellationCount() + 1);
        
        int totalRides = rider.getTotalRides();
        int cancellations = rider.getCancellationCount();
        double acceptanceRate = ((double) (totalRides - cancellations) / totalRides) * 100;
        rider.setAcceptanceRate(acceptanceRate);
        
        riderRepository.save(rider);
    }

    public List<Rider> getPendingRiders() {
        return riderRepository.findByStatus(RiderStatus.PENDING);
    }

    public List<Rider> getActiveRiders() {
        return riderRepository.findByStatus(RiderStatus.ACTIVE);
    }

    public List<Rider> getNearbyAvailableRiders(Double latitude, Double longitude, Double radiusKm) {
        return riderRepository.findNearbyAvailableRiders(latitude, longitude, radiusKm, RiderStatus.AVAILABLE);
    }

    public List<Rider> getNearbyAvailableRidersByVehicleType(Double latitude, Double longitude, Double radiusKm, String vehicleType) {
        return riderRepository.findNearbyAvailableRidersByVehicleType(latitude, longitude, radiusKm, RiderStatus.AVAILABLE, vehicleType);
    }

    public long getRiderCountByStatus(RiderStatus status) {
        return riderRepository.countByStatus(status);
    }
}
