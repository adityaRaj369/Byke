package com.byke.service;

import com.byke.model.entity.Bid;
import com.byke.model.entity.Booking;
import com.byke.model.entity.Rider;
import com.byke.model.enums.BidStatus;
import com.byke.model.enums.RiderStatus;  
import com.byke.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List; 
import java.util.Optional;

@Service  
@RequiredArgsConstructor 
@Slf4j
public class BiddingService {

    private final BidRepository bidRepository;
    private final BookingService bookingService;
    private final RiderService riderService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.bidding.min-bid}")
    private Double minBid;

    @Value("${app.bidding.max-bid}")
    private Double maxBid;

    @Transactional
    public Bid placeBid(Long bookingId, Long riderId, Double bidAmount) {
        Booking booking = bookingService.getBookingById(bookingId);
        Rider rider = riderService.getRiderById(riderId);

        if (bidAmount < minBid || bidAmount > maxBid) {
            throw new RuntimeException("Bid amount must be between " + minBid + " and " + maxBid);
        }

        Optional<Bid> existingBid = bidRepository.findByBookingIdAndRiderId(bookingId, riderId);

        Bid bid;
        if (existingBid.isPresent()) {
            bid = existingBid.get();
            bid.setPreviousBidAmount(bid.getBidAmount());
            bid.setBidAmount(bidAmount);
            bid.setIsEdited(true);
            log.info("Bid updated for booking {} by rider {}", bookingId, riderId);
        } else {
            bid = Bid.builder()
                    .booking(booking)
                    .rider(rider)
                    .bidAmount(bidAmount)
                    .status(BidStatus.PENDING)
                    .build();
            log.info("New bid placed for booking {} by rider {}", bookingId, riderId);
        }

        Bid savedBid = bidRepository.save(bid);

        messagingTemplate.convertAndSend("/topic/booking/" + bookingId + "/bids", savedBid);

        return savedBid;
    }

    public List<Bid> getBookingBids(Long bookingId) {
        return bidRepository.findByBookingId(bookingId);
    }

    public List<Bid> getRiderBids(Long riderId) {
        return bidRepository.findByRiderId(riderId);
    }

    @Transactional
    public void acceptBid(Long bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        bid.setStatus(BidStatus.ACCEPTED);
        bidRepository.save(bid);

        List<Bid> otherBids = bidRepository.findByBookingIdAndStatus(
                bid.getBooking().getId(), BidStatus.PENDING);
        
        for (Bid otherBid : otherBids) {
            if (!otherBid.getId().equals(bidId)) {
                otherBid.setStatus(BidStatus.REJECTED);
                bidRepository.save(otherBid);
                notificationService.notifyRider(otherBid.getRider().getId(), 
                        "Bid Not Selected", "Another rider was selected for this booking");
            }
        }

        bookingService.acceptBid(bid.getBooking().getId(), bid.getRider().getId());
        riderService.updateRiderStatus(bid.getRider().getId(), RiderStatus.ON_RIDE);

        log.info("Bid {} accepted for booking {}", bidId, bid.getBooking().getId());
    }

    @Transactional
    public void broadcastBookingToNearbyRiders(Long bookingId) {
        Booking booking = bookingService.getBookingById(bookingId);
        
        List<Rider> nearbyRiders = riderService.getNearbyAvailableRiders(
                booking.getPickupLatitude(),
                booking.getPickupLongitude(),
                10.0
        );

        for (Rider rider : nearbyRiders) {
            notificationService.notifyRider(rider.getId(), 
                    "New Booking Available", 
                    "New " + booking.getServiceType() + " booking nearby. Tap to bid!");
            
            messagingTemplate.convertAndSend("/topic/rider/" + rider.getId() + "/bookings", booking);
        }

        log.info("Booking {} broadcasted to {} nearby riders", bookingId, nearbyRiders.size());
    }

    @Transactional
    public void expireBids(Long bookingId) {
        List<Bid> pendingBids = bidRepository.findByBookingIdAndStatus(bookingId, BidStatus.PENDING);
        
        for (Bid bid : pendingBids) {
            bid.setStatus(BidStatus.EXPIRED);
            bidRepository.save(bid);
        }

        log.info("Expired {} bids for booking {}", pendingBids.size(), bookingId);
    }
}
