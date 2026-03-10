package com.byke.service;

import com.byke.model.entity.Booking;
import com.byke.model.entity.Rider;
import com.byke.model.entity.User;
import com.byke.model.enums.BookingStatus;
import com.byke.model.enums.ServiceType;
import com.byke.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final RiderService riderService;
    private final NotificationService notificationService;

    @Value("${app.bidding.window-seconds}")
    private Integer biddingWindowSeconds;

    @Transactional
    public Booking createBooking(Long userId, Booking bookingData) {
        User user = userService.getUserById(userId);

        Double estimatedFare = calculateEstimatedFare(
                bookingData.getServiceType(),
                bookingData.getEstimatedDistance()
        );

        Booking booking = Booking.builder()
                .user(user)
                .serviceType(bookingData.getServiceType())
                .status(BookingStatus.BIDDING)
                .pickupAddress(bookingData.getPickupAddress())
                .pickupLatitude(bookingData.getPickupLatitude())
                .pickupLongitude(bookingData.getPickupLongitude())
                .dropAddress(bookingData.getDropAddress())
                .dropLatitude(bookingData.getDropLatitude())
                .dropLongitude(bookingData.getDropLongitude())
                .errandDescription(bookingData.getErrandDescription())
                .errandItemsList(bookingData.getErrandItemsList())
                .estimatedBudget(bookingData.getEstimatedBudget())
                .parcelDescription(bookingData.getParcelDescription())
                .parcelWeight(bookingData.getParcelWeight())
                .recipientName(bookingData.getRecipientName())
                .recipientPhone(bookingData.getRecipientPhone())
                .estimatedDistance(bookingData.getEstimatedDistance())
                .estimatedDuration(bookingData.getEstimatedDuration())
                .estimatedFare(estimatedFare)
                .biddingWindowSeconds(biddingWindowSeconds)
                .biddingStartTime(LocalDateTime.now())
                .biddingEndTime(LocalDateTime.now().plusSeconds(biddingWindowSeconds))
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created: {} for user: {}", savedBooking.getId(), userId);

        notificationService.notifyUser(userId, "Booking Confirmed", 
                "Your booking is confirmed! Finding riders...");

        return savedBooking;
    }

    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getRiderBookings(Long riderId) {
        return bookingRepository.findByRiderId(riderId);
    }

    public List<Booking> getActiveBookings() {
        return bookingRepository.findByStatus(BookingStatus.IN_PROGRESS);
    }

    @Transactional
    public Booking acceptBid(Long bookingId, Long riderId) {
        Booking booking = getBookingById(bookingId);
        Rider rider = riderService.getRiderById(riderId);

        booking.setRider(rider);
        booking.setStatus(BookingStatus.ACCEPTED);
        booking.setAcceptedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking {} accepted by rider {}", bookingId, riderId);

        notificationService.notifyUser(booking.getUser().getId(), "Rider Found", 
                "Rider " + rider.getUser().getFullName() + " is on the way!");
        
        notificationService.notifyRider(riderId, "Booking Confirmed", 
                "Navigate to pickup location");

        return savedBooking;
    }

    @Transactional
    public Booking updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(status);

        if (status == BookingStatus.RIDER_ARRIVED) {
            booking.setRiderArrivedAt(LocalDateTime.now());
            notificationService.notifyUser(booking.getUser().getId(), "Rider Arrived", 
                    "Your rider has arrived at the pickup location");
        } else if (status == BookingStatus.IN_PROGRESS) {
            booking.setStartedAt(LocalDateTime.now());
            notificationService.notifyUser(booking.getUser().getId(), "Ride Started", 
                    "Your ride/errand has started");
        } else if (status == BookingStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
            userService.incrementBookingCount(booking.getUser().getId());
            riderService.incrementRideCount(booking.getRider().getId());
            notificationService.notifyUser(booking.getUser().getId(), "Ride Completed", 
                    "Please rate your rider");
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking {} status updated to {}", bookingId, status);
        return savedBooking;
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, String reason, boolean byUser) {
        Booking booking = getBookingById(bookingId);
        
        booking.setStatus(byUser ? BookingStatus.CANCELLED_BY_USER : BookingStatus.CANCELLED_BY_RIDER);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(reason);

        if (!byUser && booking.getRider() != null) {
            riderService.incrementCancellationCount(booking.getRider().getId());
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking {} cancelled by {}", bookingId, byUser ? "user" : "rider");

        if (byUser && booking.getRider() != null) {
            notificationService.notifyRider(booking.getRider().getId(), "Booking Cancelled", 
                    "User has cancelled the booking");
        } else if (!byUser) {
            notificationService.notifyUser(booking.getUser().getId(), "Booking Cancelled", 
                    "Rider has cancelled. Finding another rider...");
        }

        return savedBooking;
    }

    @Transactional
    public Booking rateBooking(Long bookingId, Integer userRating, String userReview, 
                                Integer riderRating, String riderReview) {
        Booking booking = getBookingById(bookingId);

        if (userRating != null) {
            booking.setUserRating(userRating);
            booking.setUserReview(userReview);
            riderService.updateRiderRating(booking.getRider().getId(), userRating);
        }

        if (riderRating != null) {
            booking.setRiderRating(riderRating);
            booking.setRiderReview(riderReview);
            userService.updateAverageRating(booking.getUser().getId(), (double) riderRating, false);
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking {} rated", bookingId);
        return savedBooking;
    }

    private Double calculateEstimatedFare(ServiceType serviceType, Double distance) {
        double baseFare = 40.0;
        double perKmRate = 10.0;

        if (serviceType == ServiceType.ERRAND) {
            baseFare = 50.0;
            perKmRate = 12.0;
        } else if (serviceType == ServiceType.PARCEL) {
            baseFare = 30.0;
            perKmRate = 8.0;
        }

        return baseFare + (distance * perKmRate);
    }

    public long getTotalBookingsToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return bookingRepository.countByCreatedAtBetween(startOfDay, endOfDay);
    }

    public long getBookingCountByStatus(BookingStatus status) {
        return bookingRepository.countByStatus(status);
    }
}
